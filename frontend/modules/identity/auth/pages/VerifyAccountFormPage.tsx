import {Label, TextInput} from "flowbite-react";
import {z} from "zod";
import {useLocation, useNavigate, useSearchParams} from "react-router-dom";
import {zodResolver} from '@hookform/resolvers/zod';
import {Controller, SubmitHandler, useForm} from 'react-hook-form';
import {CommonAuthLoginLayout} from "@identity/auth/components/CommonAuthLoginLayout.tsx";
import {GenericButton} from "@common/components/blocks/GenericButton.tsx";
import {useEffect, useState} from "react";
import UserService from "@identity/user/services/UserService.ts";
import {CardBody, CardFooter, CommonAuthLoginCard} from "@identity/auth/components/hero/CommonAuthLoginCard.tsx";
import {useMutation} from "@tanstack/react-query";
import {showToast} from "@common/components/blocks/ToastManager.tsx";

interface FormInputs {
    verificationCode: string
}

const formSchema = z.object({
    verificationCode: z.string().min(3, "Must be min 3 characters").max(12, "Max 12 characters"),
});

export function VerifyAccountFormPage({email = null}: { email?: string | null }) {
    const [emailAddr, setEmailAddr] = useState(email)
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const [isSubmitPending, setIsSubmitPending] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)

    const {
        control,
        handleSubmit,
        formState: {errors},
        setError,
        setValue
    } = useForm<FormInputs>({
        mode: 'onBlur',
        resolver: zodResolver(formSchema)
    });

    useEffect(() => {
        const code = searchParams.get("code");

        if (!email) {
            const paramsEmail = searchParams.get("email") ?? location.state?.email;
            if (!paramsEmail) {
                navigate("/login")
            } else {
                setEmailAddr(paramsEmail)
            }
        }

        if (code) {
            setValue("verificationCode", code);
            handleSubmit(onSubmit)()
        }
    }, [setValue]);

    const {isPending: sendEmailPending, mutate} = useMutation({
        mutationFn: () => UserService.resendAccountConfirmationEmail(emailAddr!),
        onSuccess: async ({error}) => {
            if (error) {
                showToast("error", error.status === 429 ? "Only one code in every 30 seconds can be send" : "Try again later");
            } else {
                showToast("success", `Sent verification email to ${emailAddr}`)
            }
        },
    });


    const onSubmit: SubmitHandler<FormInputs> = async ({verificationCode}) => {
        try {
            setIsSubmitPending(true);
            await UserService.confirmEmail(verificationCode);
            setIsSuccess(true)
        } catch {
            setError('verificationCode', {
                type: 'manual',
                message: 'Invalid verification code',
            })
        } finally {
            setIsSubmitPending(false)
        }
    };

    const isPending = sendEmailPending || isSubmitPending;

    return (
        <CommonAuthLoginLayout>
            <CommonAuthLoginCard>
                <CardBody>
                    <div className="space-y-2">
                        <h2 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl">
                            Verify your email address
                        </h2>
                        <form className="space-y-2 mt-3" action="#"
                              onSubmit={handleSubmit(onSubmit)}>
                            <Controller name="verificationCode"
                                        control={control}
                                        render={({field}) =>
                                            <div className="grid grid-cols-1 gap-2">
                                                <Label htmlFor="verificationCode" className="">
                                                    Enter the code sent to your email address
                                                </Label>
                                                <TextInput
                                                    id="verificationCode"
                                                    required
                                                    sizing="md"
                                                    {...field}
                                                />
                                                {errors.verificationCode && <p className="text-sm text-red-500">{errors.verificationCode.message}</p>}
                                            </div>
                                        }>
                            </Controller>
                            <GenericButton
                                text="Create account"
                                type="submit"
                                className="w-full mt-3"
                                isPending={isPending}
                                isSuccess={isSuccess}
                                onSuccess={() => navigate("/login")}
                            />
                            <GenericButton
                                color="alternative"
                                text="Return to sign up"
                                className="w-full"
                                onClick={() => navigate("/login")}
                            />
                        </form>
                    </div>
                </CardBody>
                {emailAddr &&
                    <CardFooter>
                        <p className="text-center text-sm font-medium text-gray-900">
                            Didn't receive the code?&nbsp;
                            <span className={`font-medium text-primary-600 cursor-pointer ${isPending && "pointer-events-none"}`} onClick={() => mutate()}>
                                Send again&nbsp;
                            </span>
                        </p>
                    </CardFooter>
                }

            </CommonAuthLoginCard>
        </CommonAuthLoginLayout>
    );
}
