import "@app/index.css";
import React, {useEffect, useRef} from "react";
import {useParams, useSearchParams} from "react-router-dom";
import {ActionModal} from "@common/components/modals/ActionModal.tsx";
import {Controller} from "react-hook-form";
import {GenericFormTextInput} from "@common/components/forms/GenericFormTextInput.tsx";
import {useUserConfigurableOpenChatAuth} from "@ai/hooks/useUserConfigurableOpenChatAuth.ts";
import UserConfigurableChat from "@ai/components/chat/user-configurable-chat/UserConfigurableChat.tsx";

export default function UserConfigurableChatEmbeddablePage() {
    const {agentId} = useParams();
    const [search] = useSearchParams();
    const containerRef = useRef<HTMLDivElement>(null);

    const parentViewportHeightParam = search.get("parentViewportHeight");
    const parentViewportHeight = parentViewportHeightParam
        ? Number(parentViewportHeightParam)
        : undefined;

    const normalizeExpandedHeight = (
        h: string | null,
        parentVH?: number
    ): string | undefined => {
        if (!h) return undefined;
        const s = String(h).trim();
        if (!s) return undefined;
        if (s.endsWith("px")) return s;
        const n = parseFloat(s);
        if (s.endsWith("dvh") || s.endsWith("vh")) {
            let viewport = parentVH && isFinite(parentVH) ? parentVH : 0;
            if (!viewport) {
                try {
                    viewport =
                        (window.top && window.top.innerHeight) || window.innerHeight;
                } catch (_e) {
                    viewport = window.innerHeight;
                }
            }
            const px = Math.round((n / 100) * viewport);
            return `${px}px`;
        }
        if (/^\d+(\.\d+)?$/.test(s)) {
            return `${n}px`;
        }
        return s;
    };

    function parseBoolean(value: string | null | undefined, defaultValue = false): boolean {
        if (value == null) {
            return defaultValue;
        }
        return value.toLowerCase() === "true";
    }

    const {
        props: baseProps,
        showAuthModal,
        control,
        handleSubmit,
        errors,
        onSubmit,
        validatePassword,
    } = useUserConfigurableOpenChatAuth(agentId);

    // merge in query params → chatExpandedHeight, inputOffset, headerOffset
    const mergedProps =
        baseProps &&
        ({
            ...baseProps,
            height: normalizeExpandedHeight(
                search.get("chatExpandedHeight"),
                parentViewportHeight
            ),
            inputOffset: search.get("inputOffset") ?? undefined,
            headerOffset: search.get("headerOffset") ?? undefined,
            fillBelowHeader: !search.get("chatExpandedHeight"),
            inputMaxWidth: search.get("inputMaxWidth"),
            hideHeader: parseBoolean(search.get("hideHeader")),
            horizontalQuickReplies: parseBoolean(search.get("horizontalQuickReplies"))
        } as typeof baseProps);

    // keep resize observer code
    useEffect(() => {
        if (!containerRef.current) return;

        const targetOrigin = search.get("parentOrigin") || "*";
        const embedId = search.get("embedId") || agentId || search.get("id");

        let raf = 0;
        const postSize = () => {
            raf = 0;
            const container = containerRef.current!;
            const height = Math.ceil(container.offsetHeight);
            window.parent?.postMessage(
                {type: "USER_CHAT_EMBED_RESIZE", height, id: embedId},
                targetOrigin
            );
        };

        const schedule = () => {
            if (raf) return;
            raf = requestAnimationFrame(postSize);
        };

        let ro: ResizeObserver | undefined;
        if (typeof ResizeObserver !== "undefined") {
            ro = new ResizeObserver(schedule);
            ro.observe(containerRef.current);
        }
        const interval = window.setInterval(postSize, 1000);
        postSize();

        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(postSize).catch(() => {
            });
        }
        window.addEventListener("load", postSize);
        window.addEventListener("resize", schedule);

        return () => {
            if (raf) cancelAnimationFrame(raf);
            ro?.disconnect();
            clearInterval(interval);
            window.removeEventListener("load", postSize);
            window.removeEventListener("resize", schedule);
        };
    }, [mergedProps, agentId, search]);

    useEffect(() => {
        const targetOrigin = search.get("parentOrigin") || "*";
        const embedId = search.get("embedId") || agentId || search.get("id");

        const handleChatStateChange = (event: CustomEvent) => {
            window.parent?.postMessage(
                {
                    type: "USER_CHAT_STATE_CHANGE",
                    state: event.detail.state,
                    id: embedId
                },
                targetOrigin
            );
        };

        window.addEventListener('chatStateChange', handleChatStateChange as EventListener);

        return () => {
            window.removeEventListener('chatStateChange', handleChatStateChange as EventListener);
        };
    }, [agentId, search]);

    if (showAuthModal) {
        return (
            <ActionModal
                headerText="Enter password"
                message="This chat is password protected"
                buttonText="Access"
                showModal={showAuthModal}
                onAction={validatePassword}
                dismissible={false}
                theme={{header: {close: {base: "hidden"}}}}
            >
                <form className="flex mt-4" onSubmit={handleSubmit(onSubmit)}>
                    <Controller
                        name="password"
                        control={control}
                        render={({field}) => (
                            <GenericFormTextInput
                                label="Password"
                                type="password"
                                errors={errors}
                                wrapperClassName="w-full"
                                field={field}
                            />
                        )}
                    />
                </form>
            </ActionModal>
        );
    }

    if (!mergedProps) {
        return <div/>;
    }

    return (
        <div ref={containerRef} style={{width: "100%"}}>
            <UserConfigurableChat {...mergedProps} />
        </div>
    );
}
