import {Controller, SubmitHandler, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {z} from "zod";
import UserService from "@identity/user/services/UserService.ts";
import {useNavigate, useSearchParams} from "react-router-dom";
import {CommonAuthLoginLayout} from "@identity/auth/components/CommonAuthLoginLayout.tsx";
import {GenericButton} from "@common/components/blocks/GenericButton.tsx";
import React, {useState} from "react";
import {CardBody, CardFooter, CommonAuthLoginCard} from "@identity/auth/components/hero/CommonAuthLoginCard.tsx";
import {GenericFormTextInput} from "@common/components/forms/GenericFormTextInput.tsx";

interface FormInputs {
    password: string
    confirmPassword: string
}

const formSchema = z.object({
    password: z.string().min(5, "Must be min 5 chars"),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
});

export function ResetForgotPasswordFormPage() {
    const [searchParams] = useSearchParams();
    const navigation = useNavigate()
    const verificationCode = searchParams.get('verificationCode');
    const [isPending, setIsPending] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)

    if (!verificationCode) {
        navigation("/login")
    }

    const {
        control,
        handleSubmit,
        formState: {errors},
    } = useForm<FormInputs>({
        mode: 'onBlur',
        resolver: zodResolver(formSchema)
    });

    const onSubmit: SubmitHandler<FormInputs> = async ({password}) => {
        try {
            setIsPending(true)
            await UserService.resetForgotPassword(verificationCode!, password);
            setIsSuccess(true)
        } catch (error) {
            console.log(error)
        } finally {
            setIsPending(false)
        }
    };

    return (
        <CommonAuthLoginLayout>
            <CommonAuthLoginCard>
                <CardBody>
                    <div className="space-y-2">
                        <h2 className="mb-1 text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl">
                            Change Password
                        </h2>
                        <form className="space-y-5 mt-3" onSubmit={handleSubmit(onSubmit)}>
                            <Controller name="password" control={control}
                                        render={({field}) =>
                                            <GenericFormTextInput
                                                label="New password"
                                                required
                                                errors={errors}
                                                sizing="md"
                                                type="password"
                                                field={field}/>
                                        }
                            />
                            <Controller name="confirmPassword" control={control}
                                        render={({field}) =>
                                            <GenericFormTextInput
                                                label="Repeat password"
                                                required
                                                errors={errors}
                                                sizing="md"
                                                type="password"
                                                field={field}/>
                                        }
                            />
                            <GenericButton
                                text="Reset password"
                                type="submit" className="w-full"
                                isPending={isPending}
                                isSuccess={isSuccess}
                                onSuccess={() => navigation("/login")}
                            />
                        </form>
                    </div>
                </CardBody>
                <CardFooter>
                    <p className="text-center text-sm font-medium text-gray-900">
                        Changed your mind?&nbsp;
                        <a
                            href="/login"
                            className="font-medium text-primary-600 hover:underline"
                        >
                            Sign in&nbsp;
                        </a>
                    </p>
                </CardFooter>
            </CommonAuthLoginCard>
        </CommonAuthLoginLayout>
    );
}
