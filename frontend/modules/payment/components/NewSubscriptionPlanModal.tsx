import React, {Dispatch, SetStateAction} from "react";
import {DoubleButtonActionModal} from "@common/components/modals/DoubleButtonActionModal.tsx";
import {useMutation} from "@tanstack/react-query";
import {showToast} from "@common/components/blocks/ToastManager.tsx";
import {z} from "zod";
import {Controller, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {GenericFormTextInput} from "@common/components/forms/GenericFormTextInput.tsx";
import {NewSubscriptionPlanRequest} from "@payment/types/request/NewSubscriptionPlanRequest.ts";
import AdminSubscriptionService from "@payment/services/AdminSubscriptionService.ts";

export interface NewSubscriptionPlanModalProps {
    showModal: boolean
    setShowModal: Dispatch<SetStateAction<boolean>>;
}

interface FormInputs extends NewSubscriptionPlanRequest {
}

const formSchema = z.object({
    name: z.string().min(3, "Min 3 chars"),
    price: z.number({coerce: true}),
    currency: z.string(),
    paymentFrequencyType: z.enum(["DAYS", "WEEKS", "MONTHS", "YEARS"]),
    paymentFrequency: z.number({coerce: true})
});

export function NewSubscriptionPlanModal({showModal, setShowModal}: NewSubscriptionPlanModalProps) {
    const {
        control,
        formState: {errors},
        getValues,
        trigger
    } = useForm<FormInputs>({
        mode: 'onBlur',
        resolver: zodResolver(formSchema)
    });

    const {data, isPending, mutate, mutateAsync, isError} = useMutation({
        mutationFn: (request: NewSubscriptionPlanRequest) => AdminSubscriptionService.createNewSubscriptionPlan(request),
        onSuccess: async (_result) => {
            showToast("success", `Created new subscription plan '${getValues().name}'`);
            setShowModal(false);
        }
    });

    return <DoubleButtonActionModal headerText="Create new subscription plan"
                                    headerBg={true}
                                    showModal={showModal}
                                    setShowModal={setShowModal}
                                    actionButtonText="Create"
                                    actionButtonColor="blue"
                                    cancelButtonColor="light"
                                    isPending={isPending}
                                    manual
                                    onAction={async () => {
                                        const isValid = await trigger();
                                        if (isValid) {
                                            mutate(getValues());
                                        }
                                    }}
                                    onCancel={() => setShowModal(false)}
                                    onClose={() => setShowModal(false)}
    >

        <form className="space-y-4 md:space-y-6" action="#">
            <Controller name="name"
                        control={control}
                        render={({field}) =>
                            <GenericFormTextInput
                                label="name"
                                required
                                type="text"
                                errors={errors}
                                field={field}/>
                        }>
            </Controller>
            <Controller name="price"
                        control={control}
                        render={({field}) =>
                            <GenericFormTextInput
                                label="price"
                                placeholder="149.99"
                                required
                                type="number"
                                errors={errors}
                                field={field}/>
                        }>
            </Controller>
            <Controller name="currency"
                        control={control}
                        render={({field}) =>
                            <GenericFormTextInput
                                label="currency"
                                placeholder="pln | usd | eur"
                                required
                                type="text"
                                errors={errors}
                                field={field}/>
                        }>
            </Controller>
            <Controller name="paymentFrequency"
                        control={control}
                        render={({field}) =>
                            <GenericFormTextInput
                                label="paymentFrequency"
                                placeholder="1...31"
                                required
                                type="number"
                                errors={errors}
                                field={field}/>
                        }>
            </Controller>
            <Controller name="paymentFrequencyType"
                        control={control}
                        render={({field}) =>
                            <GenericFormTextInput
                                label="paymentFrequencyType"
                                placeholder="DAYS | MONTHS"
                                required
                                type="text"
                                errors={errors}
                                field={field}/>
                        }>
            </Controller>
        </form>
    </DoubleButtonActionModal>
}