import React, {Dispatch, SetStateAction} from "react";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {showToast} from "@common/components/blocks/ToastManager.tsx";
import AdminUserService from "@identity/user/services/AdminUserService.ts";
import {z} from "zod";
import {Controller, SubmitHandler, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {GenericFormTextInput} from "@common/components/forms/GenericFormTextInput.tsx";
import {GenericFormSelectInput} from "@common/components/forms/GenericFormSelectInput.tsx";
import {GenericButton} from "@common/components/blocks/GenericButton.tsx";
import GenericSideModal from "@common/components/modals/GenericSideModal.tsx";
import PlusIcon from '@common/assets/common/plus-icon.svg?react';
import {InviteUserRequest} from "@identity/user/types/admin/InviteUserRequest.ts";
import {CallWrapper} from "@common/config/AxiosUtil.ts";

export interface AddUserSidePanelProps {
    showState: [boolean, Dispatch<SetStateAction<boolean>>]
}

interface FormInputs {
    firstName?: string,
    lastName?: string,
    email: string,
    role: string,
}

const formSchema = z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    email: z.string().email("Must be valid email"),
    role: z.string().nonempty("Missing role")
});

export function AddUserSidePanel({showState}: AddUserSidePanelProps) {
    const queryClient = useQueryClient();
    const [_, setShowModal] = showState;

    const {
        control,
        handleSubmit,
        formState: {errors},
        getValues,
        setError,
        reset
    } = useForm<FormInputs>({
        mode: 'onBlur',
        resolver: zodResolver(formSchema)
    });

    const {isPending, mutate, isSuccess} = useMutation<CallWrapper<void>, unknown, InviteUserRequest>({
        mutationFn: AdminUserService.inviteNewUser,
        onSuccess: async (result) => {
            const {error} = result;
            if (error && error.status === 409) {
                setError("email", {type: "Manual", message: "User already exists"})
            } else {
                const {email} = getValues();
                showToast("success", `Sent invitation to ${email}`);
                setShowModal(false);
            }
        }
    });

    const handleCloseModal = () => {
        setShowModal(false);
        reset();
    }

    const onSubmit: SubmitHandler<FormInputs> = async (formInputs) => {
        mutate(formInputs);
    };

    return (
        <GenericSideModal headerText="Add new customer" showState={showState} onClose={handleCloseModal}>
            <form className="space-y-4 md:space-y-6" action="#" onSubmit={handleSubmit(onSubmit)}>
                <Controller name="firstName"
                            control={control}
                            render={({field}) =>
                                <GenericFormTextInput
                                    label="First name"
                                    errors={errors}
                                    field={field}/>
                            }>
                </Controller>
                <Controller name="lastName"
                            control={control}
                            render={({field}) =>
                                <GenericFormTextInput
                                    label="Last name"
                                    errors={errors}
                                    field={field}/>
                            }>
                </Controller>
                <Controller name="email"
                            control={control}
                            render={({field}) =>
                                <GenericFormTextInput
                                    label="Email"
                                    type="email"
                                    errors={errors}
                                    field={field}/>
                            }>
                </Controller>
                <Controller name="role"
                            control={control}
                            render={({field}) =>
                                <GenericFormSelectInput
                                    label="Role"
                                    required
                                    errors={errors}
                                    field={field}
                                    emptyOptionPlaceholderText="Choose role"
                                    options={[{label: "User", id: "ROLE_USER"}, {label: "Admin", id: "ROLE_ADMIN"}]}
                                />
                            }>
                </Controller>
                <GenericButton type="submit" icon={PlusIcon} text="Invite user" className="w-full"
                               isPending={isPending}
                               onSuccess={() => {
                                   reset();
                                   queryClient.invalidateQueries({queryKey: AdminUserService.QUERY_KEYS.GET_USERS_INVALIDATE()})
                               }}
                               isSuccess={isSuccess}/>
            </form>
            <GenericButton color="alternative" text="Go back" className="w-full mt-2" onClick={handleCloseModal}/>
        </GenericSideModal>
    );
}
