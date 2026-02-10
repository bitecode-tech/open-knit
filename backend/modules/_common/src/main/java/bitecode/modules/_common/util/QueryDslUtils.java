package bitecode.modules._common.util;

import com.querydsl.core.types.Expression;
import com.querydsl.core.types.Order;
import com.querydsl.core.types.OrderSpecifier;
import com.querydsl.core.types.dsl.EntityPathBase;
import com.querydsl.core.types.dsl.PathBuilder;
import com.querydsl.jpa.impl.JPAQuery;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.function.Supplier;

public class QueryDslUtils {

    public static <T> Page<T> applyPagination(JPAQuery<T> contentQuery, Supplier<Long> countSupplier, Pageable pageable) {
        List<T> content = contentQuery
                .offset(pageable.getOffset())
                .limit(pageable.getPageSize())
                .fetch();

        long total = countSupplier.get();

        return new PageImpl<>(content, pageable, total);
    }

    // It works only with EntityClasses
    public static OrderSpecifier<?>[] toOrderSpecifiers(Class<?> entityClass, Sort sort) {
        PathBuilder<?> entityPath = new PathBuilder<>(entityClass, entityClass.getSimpleName().toLowerCase());
        List<OrderSpecifier<?>> orderSpecifiers = new ArrayList<>();

        for (Sort.Order order : sort) {
            Order direction = order.isAscending() ? Order.ASC : Order.DESC;
            orderSpecifiers.add(new OrderSpecifier<>(
                    direction,
                    entityPath.getComparable(order.getProperty(), Comparable.class)
            ));
        }

        return orderSpecifiers.toArray(new OrderSpecifier[0]);
    }

    // It works with projections and others
    public static OrderSpecifier<?>[] toOrderSpecifiers(EntityPathBase<?> entityPath, Sort sort) {
        PathBuilder<?> pathBuilder = new PathBuilder<>(entityPath.getType(), entityPath.getMetadata());
        List<OrderSpecifier<?>> orderSpecifiers = new ArrayList<>();

        for (Sort.Order order : sort) {
            Order direction = order.isAscending() ? Order.ASC : Order.DESC;
            orderSpecifiers.add(new OrderSpecifier<>(
                    direction,
                    pathBuilder.getComparable(order.getProperty(), Comparable.class)
            ));
        }

        return orderSpecifiers.toArray(new OrderSpecifier[0]);
    }

    /**
     * Builds QueryDSL OrderSpecifiers based on a Spring Data Sort and a mapping
     * of DTO property names to QueryDSL Expressions.
     *
     * @param sort           the Spring Data Sort object
     * @param sortableFields a map of property name → QueryDSL expression
     * @return array of OrderSpecifiers to be passed into a QueryDSL query
     */
    public static OrderSpecifier<?>[] toOrderSpecifiers(Sort sort, Map<String, Expression<? extends Comparable<?>>> sortableFields) {
        List<OrderSpecifier<?>> orderSpecifiers = new ArrayList<>();

        for (Sort.Order order : sort) {
            Expression<? extends Comparable<?>> expr = sortableFields.get(order.getProperty());
            if (expr != null) {
                Order direction = order.isAscending() ? Order.ASC : Order.DESC;
                orderSpecifiers.add(new OrderSpecifier<>(direction, expr));
            }
        }

        return orderSpecifiers.toArray(new OrderSpecifier[0]);
    }
}
