import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
import clsx from "clsx";
import "@ai/components/chat/user-configurable-chat/user-configurable-chat.css";
import {v4 as uuidv4} from "uuid";
import {showToast} from "@common/components/blocks/ToastManager.tsx";
import RibbonUnderline from "@ai/components/chat/user-configurable-chat/chat-provider/components/RibbonUnderline.tsx";
import MessageList from "@ai/components/chat/user-configurable-chat/chat-provider/components/MessageList.tsx";
import ChatComposer from "@ai/components/chat/user-configurable-chat/chat-provider/components/ChatComposer.tsx";
import QuickReplies from "@ai/components/chat/user-configurable-chat/chat-provider/components/QuickReplies.tsx";
import type {
    AttachmentItem,
    ChatMessage,
    ChatMessageAttachment,
    ChatMessageResponse,
    ChatStreamConfig,
    UserConfigurableChatProps,
} from "@ai/components/chat/user-configurable-chat/chat-provider/types.ts";
import {normalizeAttachments, parseAttachmentsPayload} from "@ai/components/chat/user-configurable-chat/chat-provider/utils/attachments.ts";
import {isChatMessageResponse, splitIntoUnits, tryDecodeBase64Utf8} from "@ai/components/chat/user-configurable-chat/chat-provider/utils/stream.ts";

export type {ChatMessage, ChatMessageResponse, UserConfigurableChatProps} from "@ai/components/chat/user-configurable-chat/chat-provider/types.ts";

export default function UserConfigurableChat({
                                                 onSend,
                                                 onStream,
                                                 header = "",
                                                 placeholder = "",
                                                 quickReplies = [],
                                                 horizontalQuickReplies = false,
                                                 height = "80dvh",
                                                 onClose,
                                                 inputOffset = 100,
                                                 headerOffset = 0,
                                                 hideHeader = false,
                                                 inputMaxWidth,
                                                 fillBelowHeader = true,
                                                 messagesState,
                                                 fileUploadEnabled = true,
                                                 recordingEnabled = false,
                                                 enableCollapseExpand = true,
                                                 onTranscribeRecording,
                                             }: UserConfigurableChatProps) {
    const internalMessagesState = useState<ChatMessage[]>([]);
    const [messages, setMessages] = messagesState ?? internalMessagesState;
    const [value, setValue] = useState("");
    const [pending, setPending] = useState(false);
    const [collapsed, setCollapsed] = useState(false);
    const [attachments, setAttachments] = useState<AttachmentItem[]>([]);
    const [isTranscribingRecording, setIsTranscribingRecording] = useState(false);
    const footerRef = useRef<HTMLDivElement>(null);
    const [footerHeight, setFooterHeight] = useState(0);
    const streamRef = useRef<EventSource | null>(null);
    const queueRef = useRef<string[]>([]);
    const flushTimerRef = useRef<number | null>(null);
    const activeStreamCleanupRef = useRef<(() => void) | null>(null);
    const streamAttachmentsRef = useRef<ChatMessageAttachment[]>([]);
    const uploadEnabled = fileUploadEnabled !== false;

    const containerHeight = useMemo(() => (typeof height === "number" ? `${height}px` : height), [height]);
    const headerOffsetCss = useMemo(() => (typeof headerOffset === "number" ? `${headerOffset}px` : headerOffset), [headerOffset]);
    const inputOffsetCss = useMemo(() => (typeof inputOffset === "number" ? `${inputOffset}px` : inputOffset), [inputOffset]);
    const inputMaxWidthCss = useMemo(() => (typeof inputMaxWidth === "number" ? `${inputMaxWidth}px` : inputMaxWidth), [inputMaxWidth]);
    const expanded = (messages.length > 0 || pending) && !collapsed;
    const hasExplicitHeight = height !== undefined && height !== null && `${height}` !== "";
    const fillBelowHeaderResolved = fillBelowHeader && !hasExplicitHeight;

    useEffect(() => {
        const chatState = expanded ? "open" : "closed";
        window.dispatchEvent(new CustomEvent("chatStateChange", {
            detail: {state: chatState}
        }));
    }, [expanded]);

    const headerRef = useRef<HTMLHeadingElement>(null);
    const [headerHeight, setHeaderHeight] = useState(0);
    const headerHeightWithBuffer = headerHeight + 12;
    const headerVisible = !expanded && !hideHeader;
    const visibleHeaderHeight = headerVisible ? headerHeightWithBuffer : 0;
    const subtractHeaderOffsetCss = useMemo(
        () => (headerVisible && headerOffsetCss ? ` - ${headerOffsetCss}` : ""),
        [headerVisible, headerOffsetCss]
    );

    useEffect(() => {
        const el = headerRef.current;
        if (!el) {
            return;
        }
        const measure = () => setHeaderHeight(el.offsetHeight);
        measure();
        let ro: ResizeObserver | undefined;
        if (typeof ResizeObserver !== "undefined") {
            ro = new ResizeObserver(measure);
            ro.observe(el);
        }
        window.addEventListener("resize", measure);
        return () => {
            window.removeEventListener("resize", measure);
            ro?.disconnect();
        };
    }, []);


    useEffect(() => {
        const el = footerRef.current;
        if (!el) {
            return;
        }
        const measure = () => setFooterHeight(el.offsetHeight);
        measure();
        let resizeObserver: ResizeObserver | null = null;
        if (typeof ResizeObserver !== "undefined") {
            resizeObserver = new ResizeObserver(measure);
            resizeObserver.observe(el);
        }
        window.addEventListener("resize", measure);
        return () => {
            if (resizeObserver) {
                resizeObserver.disconnect();
            }
            window.removeEventListener("resize", measure);
        };
    }, [footerRef]);

    useEffect(() => {
        return () => {
            try {
                streamRef.current?.close();
            } catch (e) {
                console.log(e);
            }
            streamRef.current = null;
            if (flushTimerRef.current) {
                window.clearTimeout(flushTimerRef.current);
                flushTimerRef.current = null;
            }
            queueRef.current = [];
        };
    }, []);

    function resolveAssistantReply(text: string, files: File[]) {
        if (onSend) {
            return onSend(text, files);
        }
        return new Promise<ChatMessageResponse>(r => setTimeout(() => r({message: "Thanks for your message."}), 300));
    }

    function closeEventSource() {
        try {
            activeStreamCleanupRef.current?.();
        } catch (e) {
            console.log(e);
        }
        streamRef.current = null;
        activeStreamCleanupRef.current = null;
    }

    function closeActiveStream() {
        closeEventSource();
        if (flushTimerRef.current) {
            window.clearTimeout(flushTimerRef.current);
            flushTimerRef.current = null;
        }
        queueRef.current = [];
    }

    const handleFilesSelected = useCallback((selected: FileList | File[]) => {
        if (!uploadEnabled) return;
        const files = Array.isArray(selected) ? selected : Array.from(selected ?? []);
        if (files.length === 0) return;
        setAttachments(prev => {
            const existingSignatures = new Set(
                prev.map(item => `${item.file.name}-${item.file.size}-${item.file.lastModified}`)
            );
            const additions = files
                .filter(file => !existingSignatures.has(`${file.name}-${file.size}-${file.lastModified}`))
                .map(file => ({id: uuidv4(), file}));
            if (additions.length === 0) {
                return prev;
            }
            return [...prev, ...additions];
        });
    }, [uploadEnabled]);

    const handleAttachmentRemove = useCallback((id: string) => {
        setAttachments(prev => prev.filter(item => item.id !== id));
    }, []);

    const handleRecordingComplete = useCallback(async (file: File, _durationMs: number) => {
        void _durationMs;
        if (!onTranscribeRecording) {
            showToast("error", "Voice transcription is unavailable.");
            return;
        }

        setIsTranscribingRecording(true);
        try {
            const result = await onTranscribeRecording(file);
            const transcript = (result ?? "").trim();

            if (transcript.length === 0) {
                return;
            }

            setValue(prev => {
                if (prev.trim().length === 0) {
                    return transcript;
                }
                const trimmed = prev.trimEnd();
                const separator = trimmed.endsWith("\n") ? "" : "\n";
                return `${trimmed}${separator}${transcript}`;
            });
        } catch (error) {
            console.error("Failed to transcribe recording", error);
            showToast("error", "Failed to transcribe recording. Please try again.");
        } finally {
            setIsTranscribingRecording(false);
        }
    }, [onTranscribeRecording]);

    useEffect(() => {
        if (!uploadEnabled && attachments.length > 0) {
            setAttachments([]);
        }
    }, [uploadEnabled, attachments]);

    useEffect(() => {
        if (!enableCollapseExpand && collapsed) {
            setCollapsed(false);
        }
    }, [enableCollapseExpand, collapsed]);

    async function handleSend(overrideText?: string | unknown) {
        const raw = typeof overrideText === "string" ? overrideText : value;
        const trimmedMessage = raw.trim();
        const fileAttachments = attachments.map(item => item.file);
        const files = [...fileAttachments];
        streamAttachmentsRef.current = [];

        if (pending || isTranscribingRecording) {
            return;
        }

        if (trimmedMessage.length === 0 && files.length === 0) {
            return;
        }

        const attachmentsForMessage: ChatMessageAttachment[] = attachments.map(({id, file}) => ({
            id,
            name: file.name,
            size: file.size,
            mimeType: file.type || undefined,
        }));

        const userMessageId = uuidv4();
        setMessages(prev => [...prev, {
            id: userMessageId,
            role: "user",
            text: trimmedMessage,
            attachments: attachmentsForMessage,
        }]);
        setValue("");
        setPending(true);

        const attachmentsSnapshot = attachments;
        let attachmentsCleared = false;
        let assistantId: string | null = null;

        const streamChunks = async (assistantMessageId: string, config: ChatStreamConfig) => {
            const normalizedConfig: ChatStreamConfig = {
                delayMs: 0,
                method: "GET",
                withCredentials: false,
                ...config,
            };
            const delayMs = Math.max(0, Number(normalizedConfig.delayMs ?? 0) || 0);
            const method = (normalizedConfig.method ?? "GET").toUpperCase();

            await new Promise<void>((resolve) => {
                let firstChunkShown = false;

                const appendNow = (chunk: string) => {
                    setMessages(prev => prev.map(m => m.id === assistantMessageId ? {
                        ...m,
                        text: (m.text || "") + chunk
                    } : m));
                    if (!firstChunkShown) {
                        firstChunkShown = true;
                        setPending(false);
                    }
                };

                const flushOne = () => {
                    flushTimerRef.current = null;
                    const q = queueRef.current;
                    if (q.length === 0) return;
                    const next = q.shift()!;
                    appendNow(next);
                    if (q.length > 0) {
                        flushTimerRef.current = window.setTimeout(flushOne, delayMs);
                    }
                };

                const handleData = (raw: string) => {
                    const chunk = tryDecodeBase64Utf8(raw);
                    if (!chunk) return;
                    const maybeAttachments = parseAttachmentsPayload(chunk);
                    if (maybeAttachments) {
                        streamAttachmentsRef.current = maybeAttachments;
                        setMessages(prev => prev.map(m => m.id === assistantMessageId ? {
                            ...m,
                            attachments: maybeAttachments
                        } : m));
                        return;
                    }
                    const units = splitIntoUnits(chunk, 3);
                    if (units.length === 0) return;
                    const queue = queueRef.current;
                    const wasEmpty = queue.length === 0;
                    if (wasEmpty) {
                        appendNow(units.shift()!);
                        if (units.length) queue.push(...units);
                    } else {
                        queue.push(...units);
                    }

                    if (delayMs <= 0) {
                        while (queue.length) appendNow(queue.shift()!);
                        return;
                    }
                    if (!flushTimerRef.current && queue.length > 0) {
                        flushTimerRef.current = window.setTimeout(flushOne, delayMs);
                    }
                };

                const complete = () => {
                    streamRef.current = null;
                    activeStreamCleanupRef.current = null;
                    resolve();
                };

                if (method === "GET" && !normalizedConfig.body) {
                    try {
                        const source = new EventSource(normalizedConfig.url, {
                            withCredentials: !!normalizedConfig.withCredentials
                        });
                        streamRef.current = source;
                        activeStreamCleanupRef.current = () => {
                            try {
                                source.close();
                            } catch (e) {
                                console.log(e);
                            }
                            if (streamRef.current === source) {
                                streamRef.current = null;
                            }
                        };

                        source.onmessage = (event: MessageEvent) => {
                            if (!event?.data) return;
                            handleData(event.data);
                        };

                        source.onerror = () => {
                            source.close();
                            if (streamRef.current === source) streamRef.current = null;
                            complete();
                        };
                    } catch {
                        complete();
                    }
                } else {
                    const controller = new AbortController();
                    activeStreamCleanupRef.current = () => {
                        controller.abort();
                    };

                    fetch(normalizedConfig.url, {
                        method,
                        body: normalizedConfig.body ?? null,
                        headers: normalizedConfig.headers,
                        signal: controller.signal,
                        credentials: normalizedConfig.withCredentials ? "include" : "same-origin",
                    })
                        .then(async response => {
                            if (!response.ok) {
                                throw new Error(`Streaming request failed with status ${response.status}`);
                            }
                            const reader = response.body?.getReader();
                            if (!reader) {
                                throw new Error("Missing response body for stream");
                            }
                            const decoder = new TextDecoder();
                            let buffer = "";

                            const processBuffer = () => {
                                buffer = buffer.replace(/\r\n/g, "\n");
                                let boundary = buffer.indexOf("\n\n");
                                while (boundary !== -1) {
                                    const rawEvent = buffer.slice(0, boundary);
                                    buffer = buffer.slice(boundary + 2);
                                    const dataLines = rawEvent
                                        .split("\n")
                                        .filter(line => line.startsWith("data:"))
                                        .map(line => line.slice(5));
                                    if (dataLines.length > 0) {
                                        handleData(dataLines.join("\n"));
                                    }
                                    boundary = buffer.indexOf("\n\n");
                                }
                            };

                            try {
                                while (true) {
                                    const {value, done} = await reader.read();
                                    if (done) break;
                                    buffer += decoder.decode(value, {stream: true});
                                    processBuffer();
                                }
                                buffer += decoder.decode();
                                processBuffer();
                            } catch (error) {
                                if ((error as Error)?.name !== "AbortError") {
                                    throw error;
                                }
                            } finally {
                                complete();
                            }
                        })
                        .catch(() => complete());
                }
            });
        };

        try {
            if (onStream) {
                closeActiveStream();
                assistantId = uuidv4();
                setMessages(prev => [...prev, {id: assistantId!, role: "assistant", text: ""}]);

                const result = await onStream(trimmedMessage, files);

                if (isChatMessageResponse(result)) {
                    const isError = !!result?.error;
                    const assistantText = isError ? (result?.error ?? "") : (result?.message ?? "");
                    const assistantAttachments = isError ? [] : normalizeAttachments(result?.files);
                    setMessages(prev => prev.map(m => m.id === assistantId ? {
                        ...m,
                        text: assistantText,
                        isError,
                        attachments: assistantAttachments,
                    } : m));
                    if (!isError) {
                        setAttachments([]);
                        attachmentsCleared = true;
                    }
                    setPending(false);
                    return;
                }

                const streamConfig = typeof result === "string" ? {url: result} : result;
                if (!streamConfig || !(streamConfig as ChatStreamConfig).url) {
                    const reply = await resolveAssistantReply(trimmedMessage, files);
                    const isError = !!reply?.error;
                    const assistantText = isError ? (reply?.error ?? "") : (reply?.message ?? "");
                    setMessages(prev => prev.map(m => m.id === assistantId ? {...m, text: assistantText, isError} : m));
                    if (!isError) {
                        setAttachments([]);
                        attachmentsCleared = true;
                    }
                    setPending(false);
                    return;
                }

                setAttachments([]);
                attachmentsCleared = true;
                await streamChunks(assistantId, streamConfig as ChatStreamConfig);
                return;
            }

            const reply = await resolveAssistantReply(trimmedMessage, files);
            const isError = !!reply?.error;
            const assistantText = isError ? (reply?.error ?? "") : (reply?.message ?? "");
            const assistantAttachments = isError ? [] : normalizeAttachments((reply as ChatMessageResponse | undefined)?.files);
            setMessages(prev => [...prev, {
                id: uuidv4(),
                role: "assistant",
                text: assistantText,
                isError,
                attachments: assistantAttachments,
            }]);
            if (!isError) {
                setAttachments([]);
                attachmentsCleared = true;
            }
            setPending(false);
        } catch (error) {
            console.error("Failed to send chat message", error);
            if (assistantId) {
                setMessages(prev => prev.map(m => m.id === assistantId ? {
                    ...m,
                    text: "Something went wrong. Please try again.",
                    isError: true
                } : m));
            }
            if (attachmentsCleared) {
                setAttachments(attachmentsSnapshot);
                attachmentsCleared = false;
            }
        } finally {
            closeEventSource();
            setPending(false);
        }
    }

    function handleQuickPick(text: string) {
        setValue(text);
        void handleSend(text);
    }

    const headerSplit = header?.split(" ") ?? [];
    const firstPart = headerSplit.slice(0, 2).join(" ");
    const secondPart = headerSplit.length > 2 ? headerSplit.slice(2, 3).join(" ") : undefined;
    const ribbonPart = headerSplit.length > 3 ? headerSplit.slice(3).join(" ") : undefined;

    return (
        <div className="w-full font-new-atten" style={{background: "transparent"}}>
            <div
                style={{
                    maxHeight: headerVisible ? `${headerHeightWithBuffer}px` : 0,
                    opacity: headerVisible ? 1 : 0,
                    transform: headerVisible ? "translateY(0)" : "translateY(-12px)",
                    transition: "max-height 500ms ease, opacity 300ms ease, transform 500ms ease, margin-top 500ms ease",
                    paddingBottom: headerVisible ? "4px" : 0,
                    marginTop: headerVisible ? headerOffsetCss || 0 : 0,
                }}
                aria-hidden={!headerVisible}
            >
                <h1
                    ref={headerRef}
                    className="text-oxford-blue font-new-spirit leading-[52.8px] md:leading-[91.2px] text-[42px] md:text-8xl text-center"
                >
                    {ribbonPart && firstPart && <span className="block">{firstPart}</span>}
                    {secondPart && <span>{secondPart}&nbsp;</span>}
                    <RibbonUnderline>{ribbonPart || firstPart}</RibbonUnderline>
                </h1>
            </div>
            <div className="mx-auto">
                <div
                    className="mt-3 relative flex flex-col justify-end rounded-2xl bg-transparent min-h-0"
                    style={{
                        height: expanded
                            ? (fillBelowHeaderResolved
                                ? `calc(100dvh - ${visibleHeaderHeight}px - ${inputOffsetCss || 0}${subtractHeaderOffsetCss})`
                                : containerHeight)
                            : (footerHeight ? `calc(${footerHeight}px + ${inputOffsetCss || 0}${subtractHeaderOffsetCss})` : undefined),
                        overflow: "hidden",
                        transition: "height 500ms ease"
                    }}
                >

                    <div
                        className={`flex flex-col min-h-0 flex-1 overflow-y-auto transition-[max-height,opacity] duration-500 ease-out ${expanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"}`}
                    >
                        <div
                            style={{
                                maxWidth: inputMaxWidthCss || undefined,
                                marginLeft: "auto",
                                marginRight: "auto",
                                width: "100%",
                            }}
                            className="h-full"
                        >
                            <MessageList messages={messages} pending={pending}/>
                        </div>
                    </div>

                    <div ref={footerRef} className="flex-shrink-0">
                        <div style={{maxWidth: inputMaxWidthCss || undefined, marginLeft: "auto", marginRight: "auto"}}>
                            <ChatComposer
                                value={value}
                                onChange={(v) => {
                                    if (collapsed && messages.length > 0 && v.trim().length > 0) {
                                        setCollapsed(false);
                                    }
                                    setValue(v);
                                }}
                                onSend={handleSend}
                                placeholder={placeholder}
                                disabled={pending}
                                showToggle={enableCollapseExpand && messages.length > 0}
                                collapsed={collapsed}
                                onToggle={enableCollapseExpand ? () => {
                                    if (messages.length === 0) return;
                                    if (collapsed) {
                                        setCollapsed(false);
                                    } else {
                                        setCollapsed(true);
                                        setValue("");
                                        onClose?.();
                                    }
                                } : undefined}
                                attachments={attachments}
                                onFilesSelected={handleFilesSelected}
                                onAttachmentRemove={handleAttachmentRemove}
                                fileUploadEnabled={uploadEnabled}
                                recordingEnabled={recordingEnabled}
                                onRecordingComplete={recordingEnabled ? handleRecordingComplete : undefined}
                                isTranscribing={isTranscribingRecording}
                            />
                        </div>
                        {quickReplies?.length > 0 && (
                            <div style={{
                                maxWidth: inputMaxWidthCss || undefined,
                                marginLeft: "auto",
                                marginRight: "auto"
                            }}>
                                <div
                                    className={clsx("fle x-shrink-0", horizontalQuickReplies && "hide-scrollbar")}
                                    style={horizontalQuickReplies ? {overflowX: "auto"} : undefined}
                                >
                                    <QuickReplies
                                        items={quickReplies}
                                        onPick={handleQuickPick}
                                        horizontal={horizontalQuickReplies}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
