import type {Control, FieldErrors} from "react-hook-form";
import {Controller} from "react-hook-form";
import {GenericFormTextInput} from "@common/components/forms/GenericFormTextInput.tsx";
import {GenericFormSelectInput} from "@common/components/forms/GenericFormSelectInput.tsx";
import {GenericFormTextListInput} from "@common/components/forms/GenericFormTextListInputProps.tsx";
import {GenericFormToggleSwitch} from "@common/components/forms/GenericFormToggleSwitch.tsx";
import type {FormInputs} from "@ai/components/settings/UpdateAiAgentFormSection.tsx";

interface ChatkitChatUpdateFormProps {
    control: Control<FormInputs>;
    errors: FieldErrors<FormInputs>;
    showLeftColumn?: boolean;
    providerOptions: { id: string; label: string }[];
    showChatUiSelect: boolean;
    disableFileUpload?: boolean;
}

export default function ChatkitChatUpdateForm({
                                                  control,
                                                  errors,
                                                  showLeftColumn = false,
                                                  providerOptions,
                                                  showChatUiSelect,
                                                  disableFileUpload = false,
                                              }: ChatkitChatUpdateFormProps) {
    return (
        <div className="flex gap-x-12">
            {showLeftColumn && (
                <div className="flex flex-col gap-2">
                    <div className="flex items-center">
                        <Controller
                            name="name"
                            control={control}
                            render={({field}) => (
                                <GenericFormTextInput
                                    label="Assistant name"
                                    type="text"
                                    errors={errors}
                                    placeholder="Sales agent"
                                    className="xl:w-[412px]"
                                    wrapperClassName="w-full"
                                    field={field}
                                />
                            )}
                        />
                    </div>
                    <div className="flex items-center">
                        <Controller
                            name="inputPlaceholder"
                            control={control}
                            render={({field}) => (
                                <GenericFormTextInput
                                    label="Placeholder"
                                    type="text"
                                    placeholder="Text input placeholder"
                                    errors={errors}
                                    wrapperClassName="w-full"
                                    className="xl:w-[412px]"
                                    field={field}
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
                        name="fileUploadEnabled"
                        control={control}
                        render={({field}) => (
                            <GenericFormToggleSwitch
                                label="File attachments"
                                errors={errors}
                                disabled={disableFileUpload}
                                tooltip="Allow users to attach files to chat prompts."
                                switchText={{true: "enabled", false: "disabled"}}
                                field={field}
                            />
                        )}
                    />
                </div>
                <div className="flex items-center">
                    <Controller
                        name="chatkitWorkflowId"
                        control={control}
                        render={({field}) => (
                            <GenericFormTextInput
                                label="Workflow ID"
                                type="text"
                                errors={errors}
                                wrapperClassName="w-full"
                                className="xl:w-[412px]"
                                field={field}
                            />
                        )}
                    />
                </div>
            </div>
        </div>
    );
}
