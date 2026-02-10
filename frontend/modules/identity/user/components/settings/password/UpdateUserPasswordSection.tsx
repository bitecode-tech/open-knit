import {z} from "zod";
import {Controller, SubmitHandler, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import UserService from "@identity/user/services/UserService.ts";
import {ChangePasswordState} from "@identity/auth/types/enums/ChangePasswordState.ts";
import {showToast} from "@common/components/blocks/ToastManager.tsx";
import {GenericFormTextInput} from "@common/components/forms/GenericFormTextInput.tsx";
import {GenericButton} from "@common/components/blocks/GenericButton.tsx";
import {useAuth} from "@identity/auth/contexts/AuthContext.tsx";

interface FormInputs {
    currentPassword?: string,
    newPassword: string
    confirmPassword?: string
}

const formSchema = z.object({
    currentPassword: z.union([
        z.literal(""),
        z.string().min(8, "Passwords need to be at least 8 characters")
    ]).optional(),
    newPassword: z.union([
        z.literal(""),
        z.string().min(8, "Passwords need to be at least 8 characters")
    ]),
    confirmPassword: z.string().optional()
}).refine((data) => {
    if (data.confirmPassword) {
        return data.newPassword === data.confirmPassword;
    }
    return true;
}, {
    message: "Passwords must match",
    path: ["confirmPassword"],
});

export function UpdateUserPasswordSection() {
    const {user} = useAuth();

    const {
        control,
        handleSubmit,
        formState: {errors},
        setError,
        trigger
    } = useForm<FormInputs>({
        mode: 'onBlur',
        resolver: zodResolver(formSchema),
        defaultValues: {
            currentPassword: undefined,
            newPassword: "",
            confirmPassword: undefined,
        }
    });

    const onSubmit: SubmitHandler<FormInputs> = async ({newPassword, currentPassword}) => {
        try {
            const state = await UserService.changePassword(newPassword, currentPassword);
            if (state === ChangePasswordState.SUCCESS) {
                showToast("success", "Password changed successfully.");
            } else if (state === ChangePasswordState.PASSWORDS_MUST_BE_EQUAL) {
                setError('currentPassword', {
                    type: 'manual',
                    message: 'Old and new passwords must match.',
                })
            } else {
                showToast("error", "Error");
            }
        } catch (error) {
            console.log(error)
        }
    };
    return (
        <div className="flex flex-col gap-1 md:gap-4">
            <form className="flex flex-col justify-center gap-4" onSubmit={handleSubmit(onSubmit)}>
                <Controller name="currentPassword"
                            control={control}
                            render={({field}) =>
                                <GenericFormTextInput
                                    label="Enter your current password"
                                    required
                                    type="password"
                                    disabled={user?.emptyPassword}
                                    className="md:w-[426px]"
                                    errors={errors}
                                    field={field}/>
                            }>
                </Controller>
                <Controller name="newPassword"
                            control={control}
                            render={({field}) =>
                                <GenericFormTextInput
                                    label="Your new password"
                                    required
                                    type="password"
                                    className="md:w-[426px]"
                                    errors={errors}
                                    field={field}/>
                            }>
                </Controller>
                <Controller name="confirmPassword"
                            control={control}
                            render={({field}) =>
                                <GenericFormTextInput
                                    label="Confirm new password"
                                    required
                                    type="password"
                                    className="md:w-[426px]"
                                    onBlur={() => {
                                        field.onBlur();
                                        trigger("confirmPassword")
                                    }}
                                    errors={errors}
                                    field={field}/>
                            }>
                </Controller>
                <GenericButton className="w-full md:w-fit" type="submit">
                    Save changes
                </GenericButton>
            </form>
        </div>
    );
}
