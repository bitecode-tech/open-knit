import "@app/index.css";
import React from "react";
import {useParams} from "react-router-dom";
import {ActionModal} from "@common/components/modals/ActionModal.tsx";
import {Controller} from "react-hook-form";
import {GenericFormTextInput} from "@common/components/forms/GenericFormTextInput.tsx";
import {useUserConfigurableOpenChatAuth} from "@ai/hooks/useUserConfigurableOpenChatAuth.ts";
import UserConfigurableChat from "@ai/components/chat/user-configurable-chat/UserConfigurableChat.tsx";
import {useIsMobile} from "@common/hooks/useIsMobile.ts";

export default function UserConfigurableChatOpenEndpointPage() {
    const isMobile = useIsMobile();

    const {agentId} = useParams<{ agentId: string }>();
    const {
        props,
        showAuthModal,
        control,
        handleSubmit,
        errors,
        onSubmit,
        validatePassword,
    } = useUserConfigurableOpenChatAuth(agentId);

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

    if (!props) {
        return (
            <div className="flex h-screen items-center justify-center">Loading...</div>
        );
    }

    return (
        <div className="flex flex-col h-dvh">
            <header className="h-14 flex items-center justify-center border-b border-gray-200 shadow-sm">
                <h1 className="text-lg font-semibold text-gray-900 text-center">{props.header}</h1>
            </header>
            <main className={`flex flex-1 items-center justify-center p-4 bg-gray-50`}>
                <div className="w-full max-w-3xl my-auto">
                    <UserConfigurableChat {...props} height={isMobile ? "80dvh" : undefined} enableCollapseExpand={false} hideHeader horizontalQuickReplies={isMobile}/>
                </div>
            </main>
        </div>
    );
}
