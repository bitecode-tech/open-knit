import React, {useEffect, useMemo, useRef} from "react";
import {useInfiniteQuery, useQuery} from "@tanstack/react-query";
import {useParams} from "react-router-dom";
import AdminAiService from "@ai/services/AdminAiService.ts";
import AdminAiClient from "@ai/clients/AdminAiClient.ts";
import {formatDate} from "@common/utils/DateFormatterUtils.ts";

const PAGE_SIZE = 30;

export default function SessionConversationDetailsPage() {
    const {sessionId} = useParams<{ agentId: string; sessionId: string }>();
    const chatScrollRef = useRef<HTMLDivElement>(null);
    const sentinelRef = useRef<HTMLDivElement | null>(null);

    const {data: sessionStats} = useQuery({
        queryKey: AdminAiService.QUERY_KEYS.GET_CHAT_SESSION_STATS(sessionId!),
        queryFn: () => AdminAiClient.getChatSessionStats(sessionId!),
        enabled: !!sessionId
    });

    const {
        data: pages,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage
    } = useInfiniteQuery({
        queryKey: sessionStats
            ? AdminAiService.QUERY_KEYS.GET_CHAT_SESSION_MESSAGES(sessionStats.sessionUuid, PAGE_SIZE, 0)
            : ["chatSessionMessagesDisabled"],
        queryFn: ({pageParam = 0}) =>
            AdminAiClient.getChatSessionMessages(sessionStats!.sessionUuid, {
                page: {
                    page: pageParam,
                    size: PAGE_SIZE,
                    sort: [{property: "createdDate", direction: "DESC"}]
                }
            }),
        enabled: !!sessionStats,
        initialPageParam: 0,
        getNextPageParam: (lastPage) => {
            const current = lastPage.page.number;
            const totalPages = lastPage.page.totalPages;
            return current + 1 < totalPages ? current + 1 : undefined;
        }
    });

    const messages = useMemo(() => {
        return pages?.pages.flatMap(p => p.content) ?? [];
    }, [pages]);

    const sentinelIndex = useMemo(() => {
        if (messages.length === 0) return -1;
        return Math.min(messages.length - 1, 19);
    }, [messages.length]);

    useEffect(() => {
        if (!sentinelRef.current || !hasNextPage) return;
        const observer = new IntersectionObserver(entries => {
            const entry = entries[0];
            if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
                fetchNextPage();
            }
        }, {root: chatScrollRef.current, rootMargin: "0px", threshold: 1.0});
        observer.observe(sentinelRef.current);
        return () => observer.disconnect();
    }, [fetchNextPage, hasNextPage, isFetchingNextPage, sentinelIndex]);

    return (
        <div className="p-6 flex flex-col gap-6 h-screen">
            <h1 className="text-2xl font-semibold text-gray-900">Conversation details</h1>

            <div className="grid grid-cols-12 gap-8 flex-1 overflow-hidden">
                <div ref={chatScrollRef} className="col-span-8 flex flex-col gap-4 overflow-y-auto pr-2">
                    {messages.map((msg, idx) => {
                        const isSentinel = idx === sentinelIndex;
                        return (
                            <div
                                key={`ai-chat-message-${idx}`}
                                ref={isSentinel ? sentinelRef : null}
                                className={`flex ${msg.type === "USER" ? "justify-end" : "justify-start"}`}
                            >
                                <div
                                    className={`px-4 py-2 rounded-xl max-w-xl text-sm leading-relaxed ${
                                        msg.type === "USER"
                                            ? "bg-gray-100 text-gray-800"
                                            : "bg-white border border-gray-200 text-gray-700"
                                    }`}
                                >
                                    {msg.message}
                                </div>
                            </div>
                        );
                    })}
                    {isFetchingNextPage && <p className="text-center text-sm text-gray-500">Loading more…</p>}
                </div>

                <div className="col-span-4">
                    <div className="bg-white  rounded-lg p-4">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Conversation details</h2>
                        <dl className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <dt className="text-gray-500">Chat #</dt>
                                <dd className="font-medium text-gray-900">{sessionStats?.sessionId}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-gray-500">Created</dt>
                                <dd className="font-medium text-gray-900">{formatDate(sessionStats?.createdDate)}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-gray-500">Number of prompts</dt>
                                <dd className="font-medium text-gray-900">{sessionStats?.totalPrompts}</dd>
                            </div>
                        </dl>
                    </div>
                </div>
            </div>
        </div>
    );
}
