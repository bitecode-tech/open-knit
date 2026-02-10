import {z} from "zod";
import {ControllerRenderProps, type Resolver, SubmitHandler, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {showToast} from "@common/components/blocks/ToastManager.tsx";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {GenericButton} from "@common/components/blocks/GenericButton.tsx";
import AdminAiService from "@ai/services/AdminAiService.ts";
import AdminAiClient from "@ai/clients/AdminAiClient.ts";
import React, {useEffect, useState} from "react";
import {CHAT_GPT_MODELS, CHAT_GPT_RECORDING_MODELS} from "@ai/types/data/ChatGptModels.ts";
import AiAgentsList from "@ai/components/settings/AiAgentsList.tsx";
import useGetAiAgentQuery from "@ai/hooks/useGetAiAgentQuery.ts";
import {useAiAgents} from "@ai/contexts/AiAgentsContext.tsx";
import {DoubleButtonActionModal} from "@common/components/modals/DoubleButtonActionModal.tsx";
import {OLLAMA_MODELS} from "@ai/types/data/OllamaModels.ts";
import {AZURE_AI_FOUNDRY_MODELS} from "@ai/types/data/AzureAiFoundryModels.ts";
import {PROVIDER_MODEL_CONFIGS, ProviderModelType} from "@ai/types/data/ModelProvidersConfig.ts";
import ChatkitChatUpdateForm from "@ai/components/settings/update-ai-agent-form/ChatkitChatUpdateForm.tsx";
import DefaultChatUpdateForm from "@ai/components/settings/update-ai-agent-form/DefaultChatUpdateForm.tsx";

const preprocessNumericValue = (value: unknown): number | null => {
    if (value === "" || value === null || value === undefined) {
        return null;
    }

    if (typeof value === "number") {
        return Number.isNaN(value) ? null : value;
    }

    if (typeof value === "string") {
        const normalized = value.replace(",", ".").trim();
        if (normalized === "") {
            return null;
        }

        const parsed = Number(normalized);
        return Number.isNaN(parsed) ? null : parsed;
    }

    return null;
};

const formSchema = z.object({
    name: z.string(),
    title: z
        .union([
            z.literal(""),
            z.string().min(3, "Title must be at least 3 characters"),
        ]),
    inputPlaceholder: z.union([
        z.literal(""),
        z.string(),
    ]),
    systemMessage: z.string(),
    documents: z.array(z.object({
        id: z.string(),
        name: z.string(),
        sizeBytes: z.number(),
    })).min(0),
    newDocuments: z.array(z.instanceof(File)).min(0),
    exemplaryPrompts: z.array(z.string()).min(0),
    model: z.string(),
    visionModel: z.string(),
    recordingModel: z.string(),
    provider: z.string(),
    testMode: z.boolean(),
    chatUi: z.enum(["DEFAULT", "CHATKIT"]),
    chatkitWorkflowId: z.string().optional(),
    temperature: z.preprocess(
        preprocessNumericValue,
        z.number().min(0, "Temperature cannot be lower than 0").max(2, "Temperature cannot be higher than 2").nullable()
    ),
    topP: z.preprocess(
        preprocessNumericValue,
        z.number().min(0, "Top P cannot be lower than 0").max(1, "Top P cannot be higher than 1").nullable()
    ),
    maxTokens: z.preprocess(
        preprocessNumericValue,
        z.number().int("Max tokens must be an integer").min(1, "Max tokens must be at least 1").nullable()
    ),
    presencePenalty: z.preprocess(
        preprocessNumericValue,
        z.number().min(-2, "Presence penalty must be between -2 and 2").max(2, "Presence penalty must be between -2 and 2").nullable()
    ),
    frequencyPenalty: z.preprocess(
        preprocessNumericValue,
        z.number().min(-2, "Frequency penalty must be between -2 and 2").max(2, "Frequency penalty must be between -2 and 2").nullable()
    ),
    shortTermMemoryLastMessages: z.preprocess(
        preprocessNumericValue,
        z.number().int("Short-term memory messages must be a whole number").min(0, "Short-term memory messages cannot be negative").nullable()
    ),
    fileUploadEnabled: z.boolean(),
    recordingEnabled: z.boolean()
}).refine(
    (values) => values.provider !== "OPEN_AI" || values.chatUi !== "CHATKIT" || Boolean(values.chatkitWorkflowId?.trim()),
    {
        message: "Workflow ID is required when using ChatKit",
        path: ["chatkitWorkflowId"],
    }
);

export type FormInputs = z.infer<typeof formSchema>;

export function UpdateAiAgentFormSection() {
    const queryClient = useQueryClient();
    const {selectedAgent, invalidateQuery} = useAiAgents();

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isUpdatePending, setIsUpdatePending] = useState(false);
    const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
    const [disableRecordingModel, setDisableRecordingModel] = useState(false);
    const [disableFileUpload, setDisableFileUpload] = useState(false);

    const {
        control,
        handleSubmit,
        formState: {errors},
        watch,
        getValues,
        setValue,
        reset,
    } = useForm<FormInputs>({
        mode: 'onBlur',
        resolver: zodResolver(formSchema) as Resolver<FormInputs>,
        defaultValues: {
            name: "",
            title: "",
            systemMessage: "",
            inputPlaceholder: "",
            documents: [],
            newDocuments: [],
            exemplaryPrompts: [''],
            model: "",
            visionModel: "",
            recordingModel: "",
            provider: "",
            testMode: false,
            chatUi: "DEFAULT",
            chatkitWorkflowId: "",
            temperature: null,
            topP: null,
            maxTokens: null,
            presencePenalty: null,
            frequencyPenalty: null,
            shortTermMemoryLastMessages: null,
            fileUploadEnabled: true,
            recordingEnabled: false,
        }
    });
    const provider = watch("provider");
    const model = watch("model");
    const chatUi = watch("chatUi");
    const advancedSectionId = "advanced-ai-settings";
    const isChatKit = provider === "OPEN_AI" && chatUi === "CHATKIT";

    const normalizeNullableNumberField = <K extends keyof FormInputs>(field: ControllerRenderProps<FormInputs, K>) => ({
        ...field,
        value: field.value ?? "",
    });
    const {data} = useGetAiAgentQuery(selectedAgent?.uuid)

    useEffect(() => {
        if (!data) {
            return;
        }

        reset({
            ...data,
            temperature: data.temperature ?? null,
            topP: data.topP ?? null,
            maxTokens: data.maxTokens ?? null,
            presencePenalty: data.presencePenalty ?? null,
            frequencyPenalty: data.frequencyPenalty ?? null,
            shortTermMemoryLastMessages: data.shortTermMemoryLastMessages ?? null,
            chatUi: data.chatUi ?? "DEFAULT",
            chatkitWorkflowId: data.chatkitWorkflowId ?? "",
        });
    }, [data, reset]);

    useEffect(() => {
        setShowAdvancedSettings(false);
    }, [selectedAgent?.uuid]);

    useEffect(() => {
        setValue("visionModel", model);
    }, [model, setValue]);

    useEffect(() => {
        const providerConfig = PROVIDER_MODEL_CONFIGS[provider as ProviderModelType]
        if (providerConfig && providerConfig.recordingEnabled) {
            setDisableRecordingModel(false);
            // Only OPEN_AI works for the moment
            setValue("recordingModel", getRecordingModelOptions()[0])
        } else {
            setDisableRecordingModel(true)
            setValue("recordingModel", "");
            setValue("recordingEnabled", false);
        }
        if (providerConfig && providerConfig.visionEnabled) {
            setDisableFileUpload(false);
            setValue("fileUploadEnabled", true);
            setValue("visionModel", model);
        } else {
            setDisableFileUpload(true);
            setValue("fileUploadEnabled", false);
            setValue("visionModel", "");
        }
    }, [provider, setValue, model])

    useEffect(() => {
        if (provider !== "OPEN_AI") {
            setValue("chatUi", "DEFAULT");
            setValue("chatkitWorkflowId", "");
        }
    }, [provider, setValue]);

    const onSubmit: SubmitHandler<FormInputs> = async (formInputs) => {
        setIsUpdatePending(true);
        try {
            await AdminAiClient.updateAgentConfig(selectedAgent!.uuid, formInputs);

            await AdminAiClient.updateDocuments(selectedAgent!.uuid, formInputs.documents.map(({id}) => id));
            if (formInputs.newDocuments.length > 0) {
                await AdminAiClient.addDocuments(selectedAgent!.uuid, formInputs.newDocuments)
            }
            showToast("success", "Agent configuration successfully updated");
        } catch (error) {
            console.log(error)
            showToast("error", "Could not update agent configuration")
        } finally {
            await queryClient.invalidateQueries({queryKey: AdminAiService.QUERY_KEYS.GET_AGENT(selectedAgent!.uuid)})
            await queryClient.invalidateQueries({queryKey: invalidateQuery})
            setIsUpdatePending(false);
        }
    };

    const {isPending: isDeletePending, mutate: mutateDelete} = useMutation({
        mutationFn: () => AdminAiClient.deleteAgent(selectedAgent!.uuid),
        onSuccess: async () => await queryClient.invalidateQueries({queryKey: invalidateQuery}),
        onError: () => {
            showToast("error")
        }
    });

    const getProviderModelOptions = () => {
        switch (provider) {
            case "OPEN_AI":
                return CHAT_GPT_MODELS;
            case "OLLAMA":
                return OLLAMA_MODELS;
            case "AZURE_AI_FOUNDRY":
                return AZURE_AI_FOUNDRY_MODELS;
            default:
                return [];
        }
    }

    const getRecordingModelOptions = () => {
        if (provider === "OPEN_AI") {
            return CHAT_GPT_RECORDING_MODELS;
        }
        return [];
    }

    const shouldDisableButton = isUpdatePending || isDeletePending;

    return (
        <section className="grid grid-cols-6">
            <AiAgentsList setNavigateUrl={(agentId) => `/admin/aisettings/agents/${agentId}`}/>
            <form className="flex col-span-5 ml-9 gap-x-12 mb-4" onSubmit={handleSubmit(onSubmit)}>
                <div className="flex flex-col gap-6 w-full">
                    {isChatKit ? (
                        <ChatkitChatUpdateForm
                            control={control}
                            errors={errors}
                            showLeftColumn
                            providerOptions={Object.entries(PROVIDER_MODEL_CONFIGS).map(
                                ([provider, config]) => ({
                                    id: provider,
                                    label: config.label
                                })
                            )}
                            showChatUiSelect={provider === "OPEN_AI"}
                            disableFileUpload={disableFileUpload}
                        />
                    ) : (
                        <DefaultChatUpdateForm
                            control={control}
                            errors={errors}
                            disableFileUpload={disableFileUpload}
                            disableRecordingModel={disableRecordingModel}
                            advancedSectionId={advancedSectionId}
                            showAdvancedSettings={showAdvancedSettings}
                            setShowAdvancedSettings={setShowAdvancedSettings}
                            getProviderModelOptions={getProviderModelOptions}
                            getRecordingModelOptions={getRecordingModelOptions}
                            normalizeNullableNumberField={normalizeNullableNumberField}
                            getValues={getValues}
                            showLeftColumn
                            providerOptions={Object.entries(PROVIDER_MODEL_CONFIGS).map(
                                ([provider, config]) => ({
                                    id: provider,
                                    label: config.label
                                })
                            )}
                            showChatUiSelect={provider === "OPEN_AI"}
                        />
                    )}
                    <div className="flex items-center gap-2">
                        <GenericButton type="submit" isPending={isUpdatePending} disabled={shouldDisableButton} text="Save changes"/>
                        <GenericButton isPending={isDeletePending} disabled={shouldDisableButton}
                                       color="red" outline spinnerColor="black" text="Delete"
                                       onClick={() => setShowDeleteModal(true)}
                        />
                    </div>
                </div>
            </form>
            <DoubleButtonActionModal headerText="Delete AI assistant?"
                                     message="This action cannot be undone. The assistant will be deleted, however chat sessions will be still visible."
                                     showModal={showDeleteModal}
                                     setShowModal={setShowDeleteModal}
                                     actionButtonText="Delete"
                                     actionButtonColor="red"
                                     cancelButtonColor="light"
                                     onCancel={() => setShowDeleteModal(false)}
                                     onClose={() => setShowDeleteModal(false)}
                                     onAction={() => mutateDelete()}/>
        </section>
    );
}
