import React, {useCallback, useEffect, useRef} from "react";
import type {ChatMessage} from "@ai/components/chat/user-configurable-chat/chat-provider/types.ts";
import MessageItem from "@ai/components/chat/user-configurable-chat/chat-provider/components/MessageItem.tsx";

function AssistantPending() {
    return (
        <div className="flex justify-start">
            <div className="max-w-[90%] w-fit px-3 py-2 rounded-2xl">
                <div className="typing-bubble">
                    <span className="typing-dot" aria-hidden="true"/>
                    <span className="typing-dot" aria-hidden="true"/>
                    <span className="typing-dot" aria-hidden="true"/>
                </div>
            </div>
        </div>
    );
}

export default function MessageList({messages, pending}: { messages: ChatMessage[]; pending: boolean }) {
    const listRef = useRef<HTMLDivElement>(null);
    const endRef = useRef<HTMLDivElement>(null);
    const autoScrollDisabledRef = useRef(false);
    const lastMessageIdRef = useRef<string | null>(null);
    const previousPendingRef = useRef(false);
    const forceScrollRef = useRef(false);
    const lastScrollTopRef = useRef(0);

    const isNearBottom = useCallback((element: HTMLDivElement) => {
        const threshold = 8;
        const distanceFromBottom = element.scrollHeight - element.scrollTop - element.clientHeight;
        return distanceFromBottom <= threshold;
    }, []);

    const handleScroll = useCallback(() => {
        const list = listRef.current;
        if (!list) return;

        const nearBottom = isNearBottom(list);
        const currentTop = list.scrollTop;
        const previousTop = lastScrollTopRef.current;

        if (nearBottom) {
            autoScrollDisabledRef.current = false;
        } else if (currentTop < previousTop) {
            autoScrollDisabledRef.current = true;
        }

        lastScrollTopRef.current = currentTop;
    }, [isNearBottom]);

    const scrollToBottom = useCallback((behavior: ScrollBehavior = "auto", force = false) => {
        if (!force && autoScrollDisabledRef.current) {
            return;
        }

        const end = endRef.current;
        if (!end) return;

        try {
            end.scrollIntoView({block: "end", inline: "nearest", behavior});
        } catch {
            const list = listRef.current;
            if (list) list.scrollTop = list.scrollHeight;
        }

        const list = listRef.current;
        if (list) {
            lastScrollTopRef.current = list.scrollTop;
        }
    }, []);

    useEffect(() => {
        if (!messages.length) {
            lastMessageIdRef.current = null;
            autoScrollDisabledRef.current = false;
            lastScrollTopRef.current = 0;
            return;
        }

        const latestMessage = messages[messages.length - 1];
        const latestMessageId = latestMessage?.id ?? null;

        if (latestMessageId && lastMessageIdRef.current !== latestMessageId) {
            autoScrollDisabledRef.current = false;
            forceScrollRef.current = true;
            lastMessageIdRef.current = latestMessageId;
            const list = listRef.current;
            if (list) {
                lastScrollTopRef.current = list.scrollTop;
            }
        }
    }, [messages]);

    useEffect(() => {
        if (pending && !previousPendingRef.current) {
            autoScrollDisabledRef.current = false;
            forceScrollRef.current = true;
            const list = listRef.current;
            if (list) {
                lastScrollTopRef.current = list.scrollTop;
            }
        }
        previousPendingRef.current = pending;
    }, [pending]);

    useEffect(() => {
        const force = forceScrollRef.current;
        forceScrollRef.current = false;

        const attemptScroll = (behavior: ScrollBehavior) => scrollToBottom(behavior, force);

        attemptScroll("auto");
        const raf = requestAnimationFrame(() => attemptScroll("auto"));
        const t0 = setTimeout(() => attemptScroll("auto"), 0);
        const t1 = setTimeout(() => attemptScroll("smooth"), 150);
        const t2 = setTimeout(() => attemptScroll("auto"), 400);

        return () => {
            cancelAnimationFrame(raf);
            clearTimeout(t0);
            clearTimeout(t1);
            clearTimeout(t2);
        };
    }, [messages, pending, scrollToBottom]);

    return (
        <div
            ref={listRef}
            className="flex-1 min-h-0 min-w-0 overflow-y-auto overflow-x-hidden py-4 space-y-6 chat-scroll scroll-anchor-none"
            onScroll={handleScroll}
            style={{maxHeight: "100%"}}
        >
            {messages.map(m => (
                <MessageItem key={m.id} message={m}/>
            ))}
            {pending && <AssistantPending/>}
            <div ref={endRef} className="scroll-anchor-auto" aria-hidden="true"/>
        </div>
    );
}
