package bitecode.modules.ai.repository;

import bitecode.modules._common.util.QueryDslUtils;
import bitecode.modules.ai.model.data.projection.AgentChatSession;
import bitecode.modules.ai.model.data.projection.AiAgentSessionStats;
import bitecode.modules.ai.model.data.projection.AiAgentSessionsStats;
import bitecode.modules.ai.model.entity.QAiAgent;
import bitecode.modules.ai.model.entity.QChatSession;
import bitecode.modules.ai.model.entity.QChatSessionMessage;
import bitecode.modules.ai.model.enums.ChatMessageUserType;
import com.querydsl.core.BooleanBuilder;
import com.querydsl.core.types.Expression;
import com.querydsl.core.types.Projections;
import com.querydsl.core.types.dsl.CaseBuilder;
import com.querydsl.core.types.dsl.Expressions;
import com.querydsl.jpa.JPAExpressions;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.StringUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class CustomChatSessionRepositoryImpl implements CustomChatSessionRepository {
    private final JPAQueryFactory queryFactory;

    @Override
    public Page<AiAgentSessionsStats> findAgentSessionsStats(String name, Instant startDate, Instant endDate, Pageable pageable) {
        var qAgent = QAiAgent.aiAgent;
        var qSession = QChatSession.chatSession;

        var predicate = new BooleanBuilder();

        if (StringUtils.isNotBlank(name)) {
            predicate.and(qAgent.name.likeIgnoreCase(name));
        }

        var sessionsInRange = new CaseBuilder()
                .when(qSession.createdDate.between(startDate, endDate)).then(1)
                .otherwise(0)
                .castToNum(Long.class)
                .sum();

        var mostRecentSessionDate = qSession.createdDate.max();

        Map<String, Expression<? extends Comparable<?>>> sortableFields = Map.of(
                "agentName", qAgent.name,
                "totalSessions", qSession.count(),
                "sessionsInRange", sessionsInRange,
                "mostRecentSessionDate", mostRecentSessionDate
        );

        var query = queryFactory
                .select(Projections.constructor(
                        AiAgentSessionsStats.class,
                        qAgent.uuid,
                        qAgent.name,
                        qSession.count(),
                        sessionsInRange,
                        qSession.createdDate.max()
                ))
                .from(qAgent)
                .leftJoin(qSession).on(qSession.agentId.eq(qAgent.uuid))
                .where(predicate)
                .groupBy(qAgent.uuid, qAgent.name);

        var content = query
                .offset(pageable.getOffset())
                .limit(pageable.getPageSize())
                .orderBy(QueryDslUtils.toOrderSpecifiers(pageable.getSort(), sortableFields))
                .fetch();

        Long total = queryFactory
                .select(qAgent.count())
                .from(qAgent)
                .where(predicate)
                .fetchOne();

        return new PageImpl<>(content, pageable, total != null ? total : 0);
    }

    @Override
    public Optional<AiAgentSessionStats> findAgentSessionStatsBySessionId(Long id, Instant startDate, Instant endDate) {
        var qSession = QChatSession.chatSession;
        var qMessage = QChatSessionMessage.chatSessionMessage;
        var qAgent = QAiAgent.aiAgent;

        var predicate = new BooleanBuilder()
                .and(qSession.id.eq(id));

        if (startDate != null && endDate != null) {
            predicate.and(qSession.createdDate.between(startDate, endDate));
        } else if (startDate != null) {
            predicate.and(qSession.createdDate.goe(startDate));
        } else if (endDate != null) {
            predicate.and(qSession.createdDate.loe(endDate));
        }

        var result = queryFactory
                .select(Projections.constructor(
                        AiAgentSessionStats.class,
                        qSession.agentId,
                        qAgent.name,
                        qSession.id,
                        qSession.uuid,
                        qMessage.count(),
                        qSession.createdDate
                ))
                .from(qSession)
                .leftJoin(qMessage).on(
                        qMessage.externalSessionId.eq(qSession.externalSessionId)
                                .and(qMessage.type.eq(bitecode.modules.ai.model.enums.ChatMessageUserType.USER))
                )
                .leftJoin(qAgent).on(qAgent.uuid.eq(qSession.agentId))
                .where(predicate)
                .groupBy(qSession, qAgent.name)
                .fetchOne();

        return Optional.ofNullable(result);
    }

    @Override
    public Page<AgentChatSession> findAgentChatSessions(UUID agentId, Instant startDate, Instant endDate, Pageable pageable) {
        var qSession = QChatSession.chatSession;
        var qMessage = QChatSessionMessage.chatSessionMessage;

        var predicate = new BooleanBuilder().and(qSession.agentId.eq(agentId));
        if (startDate != null && endDate != null) {
            predicate.and(qSession.createdDate.between(startDate, endDate));
        } else if (startDate != null) {
            predicate.and(qSession.createdDate.goe(startDate));
        } else if (endDate != null) {
            predicate.and(qSession.createdDate.loe(endDate));
        }

        var firstUserMessageSubquery = JPAExpressions
                .select(qMessage.message.substring(0, 25))
                .from(qMessage)
                .where(qMessage.externalSessionId.eq(qSession.externalSessionId)
                        .and(qMessage.type.eq(ChatMessageUserType.USER))
                        .and(qMessage.createdDate.eq(
                                JPAExpressions
                                        .select(qMessage.createdDate.min())
                                        .from(qMessage)
                                        .where(qMessage.externalSessionId.eq(qSession.externalSessionId)
                                                .and(qMessage.type.eq(ChatMessageUserType.USER)))
                        )));

        var minUserTsSubquery = JPAExpressions
                .select(qMessage.createdDate.min())
                .from(qMessage)
                .where(qMessage.externalSessionId.eq(qSession.externalSessionId)
                        .and(qMessage.type.eq(bitecode.modules.ai.model.enums.ChatMessageUserType.USER)));

        var maxUserTsSubquery = JPAExpressions
                .select(qMessage.createdDate.max())
                .from(qMessage)
                .where(qMessage.externalSessionId.eq(qSession.externalSessionId)
                        .and(qMessage.type.eq(bitecode.modules.ai.model.enums.ChatMessageUserType.USER)));

        var promptsCountSubquery = JPAExpressions
                .select(qMessage.count())
                .from(qMessage)
                .where(qMessage.externalSessionId.eq(qSession.externalSessionId)
                        .and(qMessage.type.eq(bitecode.modules.ai.model.enums.ChatMessageUserType.USER)));

        var durationSecondsExpression = Expressions.numberTemplate(
                Long.class,
                "timestampdiff(SECOND, {0}, {1})",
                minUserTsSubquery,
                maxUserTsSubquery
        );

        var query = queryFactory
                .select(Projections.constructor(
                        AgentChatSession.class,
                        qSession.uuid,
                        qSession.id,
                        firstUserMessageSubquery,
                        qSession.createdDate,
                        durationSecondsExpression,
                        promptsCountSubquery
                ))
                .from(qSession)
                .where(predicate);

        List<AgentChatSession> content = query
                .offset(pageable.getOffset())
                .limit(pageable.getPageSize())
                .orderBy(QueryDslUtils.toOrderSpecifiers(QChatSession.chatSession, pageable.getSort()))
                .fetch();

        Long total = queryFactory
                .select(qSession.count())
                .from(qSession)
                .where(predicate)
                .fetchOne();

        return new PageImpl<>(content, pageable, total != null ? total : 0);
    }
}