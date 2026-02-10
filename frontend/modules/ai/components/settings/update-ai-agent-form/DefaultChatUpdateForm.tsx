import React from "react";
import {type Control, Controller, type ControllerRenderProps, type FieldErrors} from "react-hook-form";
import {GenericFormTextInput} from "@common/components/forms/GenericFormTextInput.tsx";
import {GenericFormTextarea} from "@common/components/forms/GenericFormTextArea.tsx";
import {GenericFormMultiFileInput} from "@common/components/forms/GenericFormMultiFileInput.tsx";
import {GenericFormTextListInput} from "@common/components/forms/GenericFormTextListInputProps.tsx";
import {GenericFormSelectInput} from "@common/components/forms/GenericFormSelectInput.tsx";
import {GenericFormToggleSwitch} from "@common/components/forms/GenericFormToggleSwitch.tsx";
import {GenericButton} from "@common/components/blocks/GenericButton.tsx";
import {ChevronDownIcon} from "flowbite-react";
import {shouldPropertyBeDisabled} from "@ai/utils/AiAgentSettingsUtils.ts";
import type {FormInputs} from "@ai/components/settings/UpdateAiAgentFormSection.tsx";

interface DefaultChatUpdateFormProps {
    control: Control<FormInputs>;
    errors: FieldErrors<FormInputs>;
    disableFileUpload: boolean;
    disableRecordingModel: boolean;
    advancedSectionId: string;
    showAdvancedSettings: boolean;
    setShowAdvancedSettings: React.Dispatch<React.SetStateAction<boolean>>;
    getProviderModelOptions: () => readonly string[] | string[];
    getRecordingModelOptions: () => readonly string[] | string[];
    normalizeNullableNumberField: (field: ControllerRenderProps<FormInputs, any>) => ControllerRenderProps<FormInputs, any>;
    getValues: () => FormInputs;
    showLeftColumn?: boolean;
    providerOptions: { id: string; label: string }[];
    showChatUiSelect: boolean;
}

export default function DefaultChatUpdateForm({
                                                  control,
                                                  errors,
                                                  disableFileUpload,
                                                  disableRecordingModel,
                                                  advancedSectionId,
                                                  showAdvancedSettings,
                                                  setShowAdvancedSettings,
                                                  getProviderModelOptions,
                                                  getRecordingModelOptions,
                                                  normalizeNullableNumberField,
                                                  getValues,
                                                  showLeftColumn = true,
                                                  providerOptions,
                                                  showChatUiSelect,
                                              }: DefaultChatUpdateFormProps) {
    return (
        <div className="flex gap-x-12">
            {showLeftColumn && (
                <div className="flex flex-col gap-2">
                    <div className="flex items-center">
                        <Controller name="name"
                                    control={control}
                                    render={({field}) =>
                                        <GenericFormTextInput
                                            label="Assistant name"
                                            type="text"
                                            errors={errors}
                                            placeholder="Sales agent"
                                            className="xl:w-[412px]"
                                            wrapperClassName="w-full"
                                            field={field}/>
                                    }>
                        </Controller>
                    </div>
                    <div className="flex items-center">
                        <Controller name="title"
                                    control={control}
                                    render={({field}) =>
                                        <GenericFormTextInput
                                            label="Title"
                                            type="text"
                                            errors={errors}
                                            placeholder="Your chat title header"
                                            className="xl:w-[412px]"
                                            wrapperClassName="w-full"
                                            field={field}/>
                                    }>
                        </Controller>
                    </div>
                    <div className="flex items-center">
                        <Controller name="inputPlaceholder"
                                    control={control}
                                    render={({field}) =>
                                        <GenericFormTextInput
                                            label="Placeholder"
                                            type="text"
                                            placeholder="Text input placeholder"
                                            errors={errors}
                                            wrapperClassName="w-full"
                                            className="xl:w-[412px]"
                                            field={field}/>
                                    }>
                        </Controller>
                    </div>
                    <div className="flex items-center">
                        <Controller name="systemMessage"
                                    control={control}
                                    render={({field}) =>
                                        <GenericFormTextarea
                                            label="Instructions"
                                            placeholder="What is the AI assistant designed to do? How should it respond or interact? What actions or behaviors are considered inappropriate or off-limits?"
                                            errors={errors}
                                            className="xl:w-[412px]"
                                            wrapperClassName="w-full"
                                            field={field}/>
                                    }>
                        </Controller>
                    </div>
                    <div className="flex items-center">
                        <Controller
                            name="newDocuments"
                            control={control}
                            render={({field: newDocumentsField}) => (
                                <Controller
                                    name="documents"
                                    control={control}
                                    render={({field}) => (
                                        <GenericFormMultiFileInput
                                            existingFilesField={field}
                                            newFilesField={newDocumentsField}
                                            errors={errors}
                                            tooltip="Upload documents that form the AI’s knowledge base. The assistant will use these files to answer questions and provide context-aware responses."
                                            label="Knowledge base"
                                            accept=".pdf,.doc,.docx,.txt,.xls,.xlsx"
                                            multiple
                                            showFileType
                                            wrapperClassName="md:max-w-[412px]"
                                            addButtonText="+ New"
                                        />
                                    )}
                                />
                            )}
                        />
                    </div>
                    <div className="flex items-center">
                        <Controller
                            name="exemplaryPrompts"
                            control={control}
                            render={({field}) => (
                                <GenericFormTextListInput
                                    field={field}
                                    errors={errors}
                                    label="Conversation starters"
                                    placeholder="Type something..."
                                    className="xl:w-[412px] w-full"
                                    wrapperClassName="w-full"
                                    maxItems={10}
                                />
                            )}
                        />
                    </div>
                </div>
            )}
            <div className="flex flex-col gap-2">
                <div className="flex items-center">
                    <Controller
                        name="provider"
                        control={control}
                        render={({field}) => (
                            <GenericFormSelectInput
                                label="Provider"
                                errors={errors}
                                field={field}
                                tooltip={
                                    <div>Model info:
                                        <p><a target="_blank" href="https://platform.openai.com/docs/models"><u>OpenAi documentation</u></a></p>
                                        <p><a target="_blank" href="https://ollama.com/"><u>Ollama documentation</u></a></p>
                                    </div>
                                }
                                emptyOptionPlaceholderText="Choose provider"
                                className="xl:w-[412px] w-full"
                                options={providerOptions}
                            />
                        )}
                    />
                </div>
                {showChatUiSelect && (
                    <div className="flex items-center">
                        <Controller
                            name="chatUi"
                            control={control}
                            render={({field}) => (
                                <GenericFormSelectInput
                                    label="Chat UI"
                                    errors={errors}
                                    field={field}
                                    className="xl:w-[412px] w-full"
                                    options={[
                                        {id: "DEFAULT", label: "Default chat"},
                                        {id: "CHATKIT", label: "ChatKit"},
                                    ]}
                                />
                            )}
                        />
                    </div>
                )}
                <div className="flex items-center">
                    <Controller
                        name="model"
                        control={control}
                        render={({field}) => (
                            <GenericFormSelectInput
                                label="Model"
                                allowCustomValue={true}
                                errors={errors}
                                field={field}
                                tooltip={
                                    <div>Model info:
                                        <a target="_blank" href="https://platform.openai.com/docs/models"><u>OpenAi documentation</u></a>
                                        <a target="_blank" href="https://ollama.com/"><u>Ollama documentation</u></a>
                                    </div>
                                }
                                emptyOptionPlaceholderText="Choose model"
                                className="xl:w-[412px] w-full"
                                options={getProviderModelOptions()?.map((modelName) => ({label: modelName, id: modelName}))}
                            />
                        )}
                    />
                </div>
                <div className="flex items-center">
                    <Controller name="testMode"
                                control={control}
                                render={({field}) =>
                                    <GenericFormToggleSwitch
                                        label="Test mode"
                                        errors={errors}
                                        tooltip="Messages are randomly generated for demo purposes. Your quota will not be used."
                                        switchText={{true: "active", false: "inactive"}}
                                        field={field}/>
                                }>
                    </Controller>
                </div>
                <div className="flex items-center">
                    <Controller name="fileUploadEnabled"
                                control={control}
                                render={({field}) =>
                                    <GenericFormToggleSwitch
                                        label="File uploads"
                                        errors={errors}
                                        disabled={disableFileUpload}
                                        tooltip="Allow users to attach files to chat prompts."
                                        switchText={{true: "enabled", false: "disabled"}}
                                        field={field}/>
                                }>
                    </Controller>
                </div>
                <div className="flex items-center">
                    <Controller name="recordingEnabled"
                                control={control}
                                render={({field}) =>
                                    <GenericFormToggleSwitch
                                        label="Voice recordings"
                                        disabled={disableRecordingModel}
                                        errors={errors}
                                        tooltip="Allow users to record audio messages in the chat composer."
                                        switchText={{true: "enabled", false: "disabled"}}
                                        field={field}/>
                                }>
                    </Controller>
                </div>
                <div className="flex items-center mt-4">
                    <GenericButton
                        type="button"
                        color="light"
                        outline
                        className="w-full px-0 focus:ring-0"
                        onClick={() => setShowAdvancedSettings((prev) => !prev)}
                        aria-expanded={showAdvancedSettings}
                        aria-controls={advancedSectionId}
                    >
                        <span className="flex w-full items-center gap-2.5 text-sm font-medium text-gray-900">
                            <span>Advanced settings</span>
                            <ChevronDownIcon className={`h-4 w-4 transition-transform ${showAdvancedSettings ? "rotate-180" : ""}`}/>
                        </span>
                    </GenericButton>
                </div>
                <div
                    id={advancedSectionId}
                    aria-hidden={!showAdvancedSettings}
                    className={`w-full overflow-hidden transition-[max-height,opacity,transform] duration-500 ease-out ${showAdvancedSettings ? "mt-3 max-h-[900px] opacity-100 translate-y-0 pointer-events-auto" : "max-h-0 opacity-0 -translate-y-2 pointer-events-none"}`}
                >
                    <div className="flex flex-col gap-3 bg-white">
                        <Controller
                            name="temperature"
                            control={control}
                            render={({field}) => (
                                <GenericFormTextInput
                                    label="Temperature"
                                    type="number"
                                    step="0.01"
                                    min={0}
                                    max={2}
                                    disabled={shouldPropertyBeDisabled(getValues(), "temperature")}
                                    placeholder="0 - 2"
                                    tooltip="Controls randomness; lower values make responses more focused."
                                    errors={errors}
                                    className="xl:w-[412px] w-full"
                                    wrapperClassName="w-full"
                                    field={normalizeNullableNumberField(field)}
                                />
                            )}
                        />
                        <div className="flex items-center">
                            <Controller
                                name="visionModel"
                                control={control}
                                render={({field}) => (
                                    <GenericFormSelectInput
                                        label="Vision model"
                                        allowCustomValue={true}
                                        errors={errors}
                                        disabled={disableFileUpload}
                                        field={field}
                                        tooltip="Images and other visual imputs processing model"
                                        emptyOptionPlaceholderText="Choose model"
                                        className="xl:w-[412px] w-full"
                                        options={getProviderModelOptions()?.map((modelName) => ({label: modelName, id: modelName}))}
                                    />
                                )}
                            />
                        </div>
                        <div className="flex items-center">
                            <Controller
                                name="recordingModel"
                                control={control}
                                render={({field}) => (
                                    <GenericFormSelectInput
                                        label="Speech to Text model"
                                        allowCustomValue={true}
                                        errors={errors}
                                        disabled={disableRecordingModel}
                                        field={field}
                                        tooltip="Speech to Text model - only available using ChatGPT"
                                        emptyOptionPlaceholderText="Choose model"
                                        className="xl:w-[412px] w-full"
                                        options={getRecordingModelOptions()?.map((modelName) => ({label: modelName, id: modelName}))}
                                    />
                                )}
                            />
                        </div>
                        <Controller
                            name="topP"
                            control={control}
                            render={({field}) => (
                                <GenericFormTextInput
                                    label="Top P"
                                    type="number"
                                    step="0.01"
                                    min={0}
                                    max={1}
                                    placeholder="0 - 1"
                                    tooltip="Limits sampling to a probability mass; combines with temperature."
                                    errors={errors}
                                    className="xl:w-[412px] w-full"
                                    wrapperClassName="w-full"
                                    field={normalizeNullableNumberField(field)}
                                />
                            )}
                        />
                        <Controller
                            name="maxTokens"
                            control={control}
                            render={({field}) => (
                                <GenericFormTextInput
                                    label="Max tokens"
                                    type="number"
                                    step="1"
                                    min={1}
                                    placeholder="e.g. 1024"
                                    tooltip="Sets an upper bound for the assistant reply length."
                                    errors={errors}
                                    className="xl:w-[412px] w-full"
                                    wrapperClassName="w-full"
                                    field={normalizeNullableNumberField(field)}
                                />
                            )}
                        />
                        <Controller
                            name="presencePenalty"
                            control={control}
                            render={({field}) => (
                                <GenericFormTextInput
                                    label="Presence penalty"
                                    type="number"
                                    step="0.1"
                                    min={-2}
                                    max={2}
                                    placeholder="-2 to 2"
                                    tooltip="Penalises introducing new topics; higher values encourage broader replies."
                                    errors={errors}
                                    className="xl:w-[412px] w-full"
                                    wrapperClassName="w-full"
                                    field={normalizeNullableNumberField(field)}
                                />
                            )}
                        />
                        <Controller
                            name="frequencyPenalty"
                            control={control}
                            render={({field}) => (
                                <GenericFormTextInput
                                    label="Frequency penalty"
                                    type="number"
                                    step="0.1"
                                    min={-2}
                                    max={2}
                                    placeholder="-2 to 2"
                                    tooltip="Reduces repeated phrases; higher values make responses less repetitive."
                                    errors={errors}
                                    className="xl:w-[412px] w-full"
                                    wrapperClassName="w-full"
                                    field={normalizeNullableNumberField(field)}
                                />
                            )}
                        />
                        <Controller
                            name="shortTermMemoryLastMessages"
                            control={control}
                            render={({field}) => (
                                <GenericFormTextInput
                                    label="Short-term memory (messages)"
                                    type="number"
                                    step="1"
                                    min={0}
                                    placeholder="Number of recent messages"
                                    tooltip="How many of the latest user and assistant messages are kept for quick recall."
                                    errors={errors}
                                    className="xl:w-[412px] w-full"
                                    wrapperClassName="w-full"
                                    field={normalizeNullableNumberField(field)}
                                />
                            )}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
