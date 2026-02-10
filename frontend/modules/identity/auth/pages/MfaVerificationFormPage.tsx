import {z} from "zod";
import {useNavigate} from "react-router-dom";
import {zodResolver} from '@hookform/resolvers/zod';
import {Controller, SubmitHandler, useForm} from 'react-hook-form';
import {SignInState} from "@identity/auth/types/enums/SignInState.ts";
import React, {useState} from "react";
import {MfaMethod} from "@identity/user/types/model/MfaMethod.ts";
import {useAuth} from "@identity/auth/contexts/AuthContext.tsx";
import {CommonAuthLoginLayout} from "@identity/auth/components/CommonAuthLoginLayout.tsx";
import {GenericButton} from "@common/components/blocks/GenericButton.tsx";
import {CardBody, CardFooter, CommonAuthLoginCard} from "@identity/auth/components/hero/CommonAuthLoginCard.tsx";
import GenericLink from "@common/components/elements/GenericLink.tsx";
import {GenericFormTextInput} from "@common/components/forms/GenericFormTextInput.tsx";

interface MfaVerificationFormProps {
    username: string,
    password: string,
    rememberDevice: boolean,
    mfaMethod: MfaMethod
    goBack: () => void
}

interface FormInputs {
    pinCode: string
}

const formSchema = z.object({
    pinCode: z.string().min(3, "Must be min 3 characters").max(12, "Max 12 characters"),
});

export function MfaVerificationFormPage({username, password, rememberDevice, mfaMethod, goBack}: MfaVerificationFormProps) {
    const navigate = useNavigate();
    const {login} = useAuth();
    const [mfaType, setMfaType] = useState<MfaMethod | null>(mfaMethod)
    const [isPending, setIsPending] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)

    const {
        control,
        handleSubmit,
        formState: {errors},
        setError,
    } = useForm<FormInputs>({
        mode: 'onBlur',
        resolver: zodResolver(formSchema)
    });


    const onSubmit: SubmitHandler<FormInputs> = async ({pinCode}) => {
        try {
            setIsPending(true)
            const loginState = await login(username, password, rememberDevice, pinCode);
            if (loginState === SignInState.SUCCESS) {
                setIsSuccess(true);
            }
            if (loginState === SignInState.MFA_REQUIRED_EMAIL) {
                setMfaType(MfaMethod.EMAIL);
            }
            if (loginState === SignInState.MFA_REQUIRED_APP) {
                setMfaType(MfaMethod.QR_CODE);
            }
            if (loginState === SignInState.INVALID_LOGIN_DETAILS) {
                setError("pinCode", {
                    type: "manual",
                    message: "Wrong code, try again",
                })
            }
        } catch (error) {
            console.log(error)
            navigate("/login")
        } finally {
            setIsPending(false)
        }
    };

    const resendMfaCode = async () => {
        if (!isPending) {
            try {
                setIsPending(true);
                await login(username, password, rememberDevice)
            } finally {
                setIsPending(false);
            }
        }
    }

    return (
        <CommonAuthLoginLayout>
            <CommonAuthLoginCard>
                <CardBody>
                    <div className="space-y-2">
                        <h2 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl">
                            MFA Authentication required
                        </h2>
                        <form className="space-y-5 mt-3" action="#"
                              onSubmit={handleSubmit(onSubmit)}>
                            <Controller name="pinCode"
                                        control={control}
                                        render={({field}) =>
                                            <GenericFormTextInput
                                                label={mfaType === MfaMethod.EMAIL ? "A verification code has been sent to your email." : "Enter 6-digit code your app generated."}
                                                required
                                                errors={errors}
                                                sizing="md"
                                                field={field}/>
                                        }>
                            </Controller>
                            <GenericButton
                                text="Verify"
                                type="submit"
                                className="w-full"
                                isPending={isPending}
                                isSuccess={isSuccess}
                            />
                        </form>
                    </div>
                </CardBody>
                <CardFooter>
                    {mfaType === MfaMethod.EMAIL &&
                        <div className="text-center text-sm text-gray-900 bg-gray-50">
                            <p className="text-center text-sm font-medium text-gray-900">
                                Didn't receive the code?&nbsp;
                                <span
                                    className="font-medium text-primary-600  cursor-pointer"
                                    onClick={resendMfaCode}
                                >
                            Resend&nbsp;
                                </span>
                                or&nbsp;
                                <GenericLink
                                    to="/login"
                                    onClick={goBack}>
                                    go back.
                                </GenericLink>
                            </p>
                        </div>
                    }
                </CardFooter>
            </CommonAuthLoginCard>
        </CommonAuthLoginLayout>
    );
}
