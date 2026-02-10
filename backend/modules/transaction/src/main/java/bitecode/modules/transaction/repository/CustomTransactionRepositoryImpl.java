package bitecode.modules.transaction.repository;

import bitecode.modules._common.util.QueryDslUtils;
import bitecode.modules.transaction.model.data.TransactionCriteria;
import bitecode.modules.transaction.model.entity.QTransaction;
import bitecode.modules.transaction.model.entity.Transaction;
import com.querydsl.core.BooleanBuilder;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class CustomTransactionRepositoryImpl implements CustomTransactionRepository {
    private final JPAQueryFactory queryFactory;

    @Override
    public Page<Transaction> findByCriteria(Pageable pageable, TransactionCriteria criteria) {
        var qTransaction = QTransaction.transaction;
        var predicate = new BooleanBuilder();

        if (criteria.status() != null) {
            predicate.and(qTransaction.status.eq(criteria.status()));
        }

        if (criteria.statusNot() != null) {
            predicate.and(qTransaction.status.ne(criteria.statusNot()));
        }

        if (criteria.startDate() != null) {
            predicate.and(qTransaction.createdDate.goe(criteria.startDate()));
        }

        if (criteria.endDate() != null) {
            predicate.and(qTransaction.createdDate.loe(criteria.endDate()));
        }

        var content = queryFactory
                .selectFrom(qTransaction)
                .where(predicate)
                .offset(pageable.getOffset())
                .limit(pageable.getPageSize())
                .orderBy(QueryDslUtils.toOrderSpecifiers(Transaction.class, pageable.getSort()))
                .fetch();

        long total = queryFactory
                .select(qTransaction.count())
                .from(qTransaction)
                .where(predicate)
                .fetchOne();

        return new PageImpl<>(content, pageable, total);
    }
}
