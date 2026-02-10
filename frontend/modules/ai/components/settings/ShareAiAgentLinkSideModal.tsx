"use client";

import React, {useEffect, useState} from "react";
import {Controller, useForm} from "react-hook-form";
import {useQueryClient} from "@tanstack/react-query";
import GenericSideModal from "@common/components/modals/GenericSideModal.tsx";
import {GenericFormToggleSwitch} from "@common/components/forms/GenericFormToggleSwitch.tsx";
import {GenericFormTextInput} from "@common/components/forms/GenericFormTextInput.tsx";
import {useAiAgents} from "@ai/contexts/AiAgentsContext.tsx";
import AdminAiClient from "@ai/clients/AdminAiClient.ts";
import AdminAiService from "@ai/services/AdminAiService.ts";
import {showToast} from "@common/components/blocks/ToastManager.tsx";
import {useDebounce} from "@common/hooks/useDebounce.ts";
import {Label, TextInput} from "flowbite-react";
import {GenericButton} from "@common/components/blocks/GenericButton.tsx";

export interface FormInputs {
    accessPasswordEnabled: boolean;
    accessPassword: string;
}

interface ShareAiAgentLinkSideModalProps {
    showState: [boolean, React.Dispatch<React.SetStateAction<boolean>>];
}

export function ShareAiAgentLinkSideModal({showState}: ShareAiAgentLinkSideModalProps) {
    const [showModal, setShowModal] = showState;
    const {selectedAgent, invalidateQuery} = useAiAgents();
    const queryClient = useQueryClient();
    const [url, setUrl] = useState("");
    const [embedUrl, setEmbedUrl] = useState("");
    const {
        control,
        watch,
        reset,
        formState: {errors},
    } = useForm<FormInputs>({
        defaultValues: {
            accessPasswordEnabled: false,
            accessPassword: "",
        },
    });

    const accessPasswordEnabled = watch("accessPasswordEnabled");
    const accessPassword = watch("accessPassword");

    useEffect(() => {
        if (selectedAgent) {
            reset({
                accessPasswordEnabled: selectedAgent.accessPasswordEnabled,
                accessPassword: selectedAgent.accessPassword ?? "",
            });
            setUrl(`${window.location.origin}/chats/${selectedAgent.uuid}`);
            setEmbedUrl(`${window.location.origin}/chats/${selectedAgent.uuid}/embeddable`);
        }
    }, [selectedAgent, reset]);

    const debouncedAccessPassword = useDebounce(accessPassword, 800);
    const debouncedAccessEnabled = useDebounce(accessPasswordEnabled, 800);

    useEffect(() => {
        if (!selectedAgent) {
            return
        }

        if (debouncedAccessPassword === selectedAgent.accessPassword && debouncedAccessEnabled === selectedAgent.accessPasswordEnabled) {
            return;
        }

        AdminAiClient.updateAgentConfig(selectedAgent.uuid, {
            accessPassword: debouncedAccessPassword,
            accessPasswordEnabled: debouncedAccessEnabled
        })
            .then(async () => {
                await queryClient.invalidateQueries({
                    queryKey: AdminAiService.QUERY_KEYS.GET_AGENT(selectedAgent.uuid),
                });
                await queryClient.invalidateQueries({queryKey: invalidateQuery});
                showToast("success", "Access control updated");
            })
            .catch((error) => {
                console.log(error);
                showToast("error", "Could not update access control");
            });
    }, [debouncedAccessPassword, debouncedAccessEnabled]);

    return (
        <GenericSideModal headerText="AI Assistant Settings" showState={[showModal, setShowModal]}>
            <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-4">

                    <div className="flex flex-col gap-2">
                        <Label>Link</Label>
                        <TextInput sizing="sm" readOnly value={url}/>
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label className="mt-2">Embeddable link</Label>
                        <TextInput sizing="sm" readOnly value={embedUrl}/>
                    </div>


                    <div className="flex flex-col gap-4">
                        <Controller
                            name="accessPasswordEnabled"
                            control={control}
                            render={({field}) => (
                                <GenericFormToggleSwitch
                                    label="Chat Access Password"
                                    errors={errors}
                                    switchText={{true: "Active", false: "Inactive"}}
                                    field={field}
                                />
                            )}
                        />

                        {accessPasswordEnabled && (
                            <Controller
                                name="accessPassword"
                                control={control}
                                render={({field}) => (
                                    <GenericFormTextInput
                                        label="Access password"
                                        errors={errors}
                                        type="password"
                                        field={field}
                                    />
                                )}
                            />
                        )}
                    </div>

                    <div className="flex flex-col gap-2 mt-4">
                        <GenericButton
                            onClick={() => {
                                navigator.clipboard
                                    .writeText(url)
                                    .then(() => showToast("success", "Link copied!"));
                                setShowModal(false);
                            }}
                        >
                            Copy link
                        </GenericButton>
                        <GenericButton color="alternative" onClick={() => setShowModal(false)}>
                            Go back
                        </GenericButton>
                    </div>
                </div>

            </div>
        </GenericSideModal>
    );
}
