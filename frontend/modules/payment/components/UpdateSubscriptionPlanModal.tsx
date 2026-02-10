import React, {Dispatch, SetStateAction} from "react";
import {DoubleButtonActionModal} from "@common/components/modals/DoubleButtonActionModal.tsx";
import {useMutation} from "@tanstack/react-query";
import {showToast} from "@common/components/blocks/ToastManager.tsx";
import {z} from "zod";
import {Controller, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {GenericFormTextInput} from "@common/components/forms/GenericFormTextInput.tsx";
import AdminSubscriptionService from "@payment/services/AdminSubscriptionService.ts";
import {UpdateSubscriptionPlanRequest} from "@payment/types/request/UpdateSubscriptionPlanRequest.ts";
import {SubscriptionPlan} from "@payment/types/model/SubscriptionPlan.ts";
import {Label} from "flowbite-react";

export interface UpdateSubscriptionPlanModalProps {
    showModal: boolean
    setShowModal: Dispatch<SetStateAction<boolean>>;
    subscriptionPlan: SubscriptionPlan
}

interface FormInputs extends UpdateSubscriptionPlanRequest {
}

const formSchema = z.object({
    price: z.number({coerce: true}),
});

export function UpdateSubscriptionPlanModal({showModal, setShowModal, subscriptionPlan}: UpdateSubscriptionPlanModalProps) {
    const {
        control,
        handleSubmit,
        formState: {errors},
        getValues,
        setError,
        trigger,
        reset,
    } = useForm<FormInputs>({
        mode: 'onBlur',
        resolver: zodResolver(formSchema)
    });

    const {data, isPending, mutate, mutateAsync, isError} = useMutation({
        mutationFn: (request: UpdateSubscriptionPlanRequest) => AdminSubscriptionService.updateSubscriptionPlanRequest(subscriptionPlan.uuid, request),
        onSuccess: async (_result) => {
            showToast("success", `Updated subscription plan '${subscriptionPlan.name}'`);
            reset();
            setShowModal(false);
        }
    });

    return <DoubleButtonActionModal headerText="Update subscription plan"
                                    headerBg={true}
                                    showModal={showModal}
                                    setShowModal={setShowModal}
                                    actionButtonText="Update"
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
                                    onCancel={() => {
                                        reset();
                                        setShowModal(false)
                                    }}
                                    onClose={() => {
                                        reset();
                                        setShowModal(false)
                                    }}
    >

        <form className="space-y-4 md:space-y-6" action="#">
            <div className="flex flex-col">
                <Label>UUID:</Label>
                <div className="text-xs hover:bg-gray-100 cursor-pointer rounded-lg w-fit px-1" onClick={() => navigator.clipboard.writeText(subscriptionPlan?.uuid)
                    .then(() => showToast("success", "Copied!"))}>{subscriptionPlan?.uuid}</div>
            </div>
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
        </form>
    </DoubleButtonActionModal>
}