package bitecode.modules.auth.user.repository;

import bitecode.modules.auth.auth.model.entity.QRole;
import bitecode.modules.auth.user.model.data.FindUsersCriteria;
import bitecode.modules.auth.user.model.entity.QUser;
import bitecode.modules.auth.user.model.entity.QUserData;
import bitecode.modules.auth.user.model.entity.QUserRole;
import bitecode.modules.auth.user.model.entity.User;
import com.querydsl.core.BooleanBuilder;
import com.querydsl.jpa.impl.JPAQueryFactory;
import io.jsonwebtoken.lang.Collections;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.function.Supplier;

import static bitecode.modules._common.util.QueryDslUtils.applyPagination;
import static bitecode.modules._common.util.QueryDslUtils.toOrderSpecifiers;

@Repository
@RequiredArgsConstructor
public class CustomUserRepositoryImpl implements CustomUserRepository {

    private final JPAQueryFactory queryFactory;

    @Override
    public Page<User> findAllByCriteria(Pageable pageable, FindUsersCriteria criteria) {
        var qUser = QUser.user;

        var query = queryFactory.selectFrom(qUser);

        if (criteria.includeUserData()) {
            var qUserData = QUserData.userData;
            var qRole = QRole.role;
            var qUserRole = QUserRole.userRole;

            query.leftJoin(qUser.userData, qUserData).fetchJoin()
                    .leftJoin(qUser.roles, qUserRole).fetchJoin()
                    .leftJoin(qUserRole.role, qRole).fetchJoin();
        }

        var where = new BooleanBuilder();

        if (!Collections.isEmpty(criteria.userIds())) {
            where.and(qUser.uuid.in(criteria.userIds()));
        }

        if (criteria.emailConfirmed() != null) {
            where.and(qUser.emailConfirmed.eq(criteria.emailConfirmed()));
        }

        if (criteria.startDate() != null) {
            where.and(qUser.createdDate.goe(criteria.startDate()));
        }

        if (criteria.endDate() != null) {
            where.and(qUser.createdDate.loe(criteria.endDate()));
        }

        query.where(where);

        query.orderBy(toOrderSpecifiers(User.class, pageable.getSort()));

        Supplier<Long> countSupplier = () -> queryFactory
                .select(qUser.count())
                .from(qUser)
                .where(where)
                .fetchOne();

        return applyPagination(query, countSupplier, pageable);
    }
}
