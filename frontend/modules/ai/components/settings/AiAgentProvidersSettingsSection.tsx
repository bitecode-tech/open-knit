import {z} from "zod";
import {Controller, SubmitHandler, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {showToast} from "@common/components/blocks/ToastManager.tsx";
import {useQuery, useQueryClient} from "@tanstack/react-query";
import {GenericFormTextInput} from "@common/components/forms/GenericFormTextInput.tsx";
import {GenericButton} from "@common/components/blocks/GenericButton.tsx";
import AdminAiService from "@ai/services/AdminAiService.ts";
import AdminAiClient from "@ai/clients/AdminAiClient.ts";
import React, {useEffect, useState} from "react";

export interface FormInputs {
    apiKey: string;
}

const formSchema = z.object({
    apiKey: z
        .union([
            z.literal(""),
            z.string(),
        ]),
});

export function AiAgentProvidersSettingsSection() {
    const queryClient = useQueryClient();

    const [isPending, setIsPending] = useState(false);

    const {
        control,
        handleSubmit,
        reset,
        formState: {errors}
    } = useForm<FormInputs>({
        mode: 'onBlur',
        resolver: zodResolver(formSchema),
        defaultValues: {
            apiKey: "",
        }
    });

    const {data: providerConfig} = useQuery({
        queryKey: AdminAiService.QUERY_KEYS.GET_PROVIDER_CONFIG('OPEN_AI'),
        queryFn: async () => await AdminAiClient.getAiServicesProviderConfig('OPEN_AI')
    });

    useEffect(() => {
        if (providerConfig) {
            reset({apiKey: providerConfig.apiKey ?? ""})
        }
    }, [providerConfig]);

    const onSubmit: SubmitHandler<FormInputs> = async (formInputs) => {
        setIsPending(true);
        try {
            const {apiKey} = formInputs;
            await AdminAiClient.updateAiServicesProviderConfig({apiKey, provider: 'OPEN_AI'});
            showToast("success", "Providers configuration successfully updated");
        } catch (error) {
            console.log(error)
            showToast("error", "Could not update providers configuration")
        } finally {
            await queryClient.invalidateQueries({queryKey: AdminAiService.QUERY_KEYS.GET_PROVIDER_INVALIDATE()})
            setIsPending(false);
        }
    };

    return (
        <section>
            <form className="flex" onSubmit={handleSubmit(onSubmit)}>
                <div className="flex flex-col gap-2">
                    <div className="flex items-center">
                        <Controller name="apiKey"
                                    control={control}
                                    render={({field}) =>
                                        <GenericFormTextInput
                                            label="ChatGPT api key"
                                            type="password"
                                            errors={errors}
                                            wrapperClassName="w-full"
                                            className="xl:w-[412px]"
                                            field={field}/>
                                    }>
                        </Controller>
                    </div>
                    <div className="flex items-center">
                        <GenericButton type="submit" isPending={isPending} text="Save changes"/>
                    </div>
                </div>
            </form>
        </section>
    );
}
