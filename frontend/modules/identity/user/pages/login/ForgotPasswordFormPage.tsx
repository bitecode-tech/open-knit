import {z} from "zod";
import UserService from "@identity/user/services/UserService.ts";
import {Link} from "react-router-dom";
import {zodResolver} from '@hookform/resolvers/zod';
import {Controller, SubmitHandler, useForm} from 'react-hook-form';
import React, {useState} from "react";
import {CommonAuthLoginLayout} from "@identity/auth/components/CommonAuthLoginLayout.tsx";
import {GenericButton} from "@common/components/blocks/GenericButton.tsx";
import {CardBody, CardFooter, CommonAuthLoginCard} from "@identity/auth/components/hero/CommonAuthLoginCard.tsx";
import {showToast} from "@common/components/blocks/ToastManager.tsx";
import GenericLink from "@common/components/elements/GenericLink.tsx";
import {GenericFormTextInput} from "@common/components/forms/GenericFormTextInput.tsx";

interface FormInputs {
    email: string
}

const formSchema = z.object({
    email: z.string().email("Must be email"),
});

export function ForgotPasswordFormPage() {
    const [emailSent, setEmailSent] = useState(false)
    const [isPending, setIsPending] = useState(false)
    const [lastCodeResend, setLastCodeResend] = useState<Date | null>(null)

    const {
        control,
        handleSubmit,
        formState: {errors},
        getValues,
    } = useForm<FormInputs>({
        mode: 'onBlur',
        resolver: zodResolver(formSchema)
    });

    const onSubmit: SubmitHandler<FormInputs> = async ({email}) => {
        const now = new Date();
        const secondsPassed = () => (now.getTime() - lastCodeResend!.getTime());
        if (lastCodeResend && secondsPassed() <= 30_000) {
            showToast("warning", `Please wait ${Math.floor(secondsPassed() / 1000)}s to retry`)
        }
        try {
            setIsPending(true);
            await UserService.requestForgotPasswordLink(email);
            setLastCodeResend(new Date());
            showToast("success", `Code sent successfully to ${email}`);
            setEmailSent(true);
        } catch (error) {
            console.log(error)
        } finally {
            setIsPending(false);
        }
    };

    const ForgotPasswordForm = () => (
        <CommonAuthLoginCard>
            <CardBody>
                <div className="space-y-2">
                    <h2 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl">
                        Reset your password
                    </h2>
                    <p className="text-gray-500">Please provide the email linked to your account, and we’ll send you a password reset link.</p>
                    <form className="space-y-5 mt-3" action="#" onSubmit={handleSubmit(onSubmit)}>
                        <Controller name="email"
                                    control={control}
                                    render={({field}) =>
                                        <GenericFormTextInput
                                            label="Email"
                                            required
                                            errors={errors}
                                            sizing="md"
                                            field={field}/>
                                    }>
                        </Controller>
                        <GenericButton
                            text="Reset password"
                            type="submit"
                            className="w-full"
                            isPending={isPending}
                        />
                    </form>
                </div>
            </CardBody>
            <CardFooter>
                <p className="text-center text-sm text-gray-900">
                    Not registered yet? &nbsp;
                    <GenericLink to="/register">
                        Sign up
                    </GenericLink>
                </p>
            </CardFooter>
        </CommonAuthLoginCard>
    );

    const LinkSentSuccessfully = () => (
        <CommonAuthLoginCard>
            <CardBody>
                <div className="space-y-2">
                    <h2 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl">
                        Check your email
                    </h2>
                    <p className="text-gray-500">If the entered email is associated with an account, you will receive a password reset link shortly.</p>
                    <p className="text-gray-500">If you haven’t received the email within 5 minutes, please check your spam folder, try resending it, or use a different email
                        address.</p>
                    <Link to="/login">
                        <GenericButton
                            className="mt-3 mx-auto w-full"
                            isPending={isPending}
                            text="Continue"
                        />
                    </Link>
                </div>
            </CardBody>
            <CardFooter>
                <p className="text-center text-sm font-medium text-gray-900">
                    Didn't receive a code? &nbsp;
                    <div
                        className={`inline font-medium text-primary-500 hover:underline hover:text-gray-900 ${isPending ? "pointer-events-none" : "cursor-pointer"}`}
                        onClick={() => onSubmit(getValues())}
                    >
                        Send again
                    </div>
                </p>
            </CardFooter>
        </CommonAuthLoginCard>
    )

    return (
        <CommonAuthLoginLayout>
            {emailSent ? <LinkSentSuccessfully/> : <ForgotPasswordForm/>}
        </CommonAuthLoginLayout>
    );
}