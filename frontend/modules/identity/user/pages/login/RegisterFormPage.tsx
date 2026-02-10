import {z} from "zod";
import UserService from "@identity/user/services/UserService.ts";
import {useNavigate} from "react-router-dom";
import {zodResolver} from '@hookform/resolvers/zod';
import {Controller, SubmitHandler, useForm} from 'react-hook-form';
import {SignUpState} from "@identity/auth/types/enums/SignUpState.ts";
import {useState} from "react";
import {VerifyAccountFormPage} from "@identity/auth/pages/VerifyAccountFormPage.tsx";
import {GenericFormTextInput} from "@common/components/forms/GenericFormTextInput.tsx";
import {CommonAuthLoginLayout} from "@identity/auth/components/CommonAuthLoginLayout.tsx";
import {GenericButton} from "@common/components/blocks/GenericButton.tsx";
import {CardBody, CardFooter, CommonAuthLoginCard} from "@identity/auth/components/hero/CommonAuthLoginCard.tsx";
import {GenericFormCheckbox} from "@common/components/forms/GenericCheckbox.tsx";
import GenericLink from "@common/components/elements/GenericLink.tsx";
import OAuth2ProviderLoginButton from "@identity/auth/components/OAuth2ProviderLoginButton.tsx";

interface FormInputs {
    email: string
    password: string
    confirmPassword?: string
    terms: boolean
}

const formSchema = z.object({
    email: z.string().email("Must be email"),
    password: z.string().min(8, "Passwords need to be at least 8 characters"),
    confirmPassword: z.string().optional(),
    terms: z.boolean()
}).refine((data) => {
    if (data.confirmPassword) {
        return data.password === data.confirmPassword;
    }
    return true;
}, {
    message: "Passwords must match",
    path: ["confirmPassword"],
}).refine((data) => data.terms, {
    message: "You must accept the terms",
    path: ["terms"]
});

export function RegisterFormPage() {
    const navigate = useNavigate();
    const [signUpState, setSignUpState] = useState<SignUpState | null>(null)
    const [isPending, setIsPending] = useState(false);

    const {
        control,
        handleSubmit,
        formState: {errors},
        setError,
        getValues,
        trigger,
    } = useForm<FormInputs>({
        mode: 'onBlur',
        resolver: zodResolver(formSchema),
        defaultValues: {
            terms: false
        }
    });

    const onSubmit: SubmitHandler<FormInputs> = async ({password, email}) => {
        try {
            setIsPending(true);
            const signUpState = await UserService.signUp(email, password);
            setSignUpState(signUpState)
            switch (signUpState) {
                case SignUpState.SUCCESS:
                    navigate("/login");
                    break;
                case SignUpState.USER_ALREADY_EXISTS:
                    setError("email", {type: "Manual", message: "This email is already registered"})
                    break;
                case null: {
                    setError("email", {type: "Manual", message: "Try again later..."})
                }
            }
        } catch (error) {
            console.log(error)
            setError("email", {type: "Manual", message: "Error, try again later..."})
        } finally {
            setIsPending(false);
        }
    };

    if (signUpState === SignUpState.EMAIL_VALIDATION_REQUIRED) {
        return <VerifyAccountFormPage email={getValues().email}/>;
    }

    return (
        <CommonAuthLoginLayout>
            <CommonAuthLoginCard>
                <CardBody>
                    <div className="space-y-5">
                        <h2 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl">
                            Create your account
                        </h2>
                        <form className="space-y-4 md:space-y-5" action="#"
                              onSubmit={handleSubmit(onSubmit)}>
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
                            <Controller name="password"
                                        control={control}
                                        render={({field}) =>
                                            <GenericFormTextInput
                                                label="Password"
                                                type="password"
                                                required
                                                errors={errors}
                                                sizing="md"
                                                field={field}/>
                                        }>
                            </Controller>
                            <Controller name="confirmPassword"
                                        control={control}
                                        render={({field}) =>
                                            <GenericFormTextInput
                                                label="Repeat password"
                                                type="password"
                                                required
                                                errors={errors}
                                                sizing="md"
                                                onBlur={() => {
                                                    field.onBlur();
                                                    trigger("confirmPassword")
                                                }
                                                }
                                                field={field}/>
                                        }>
                            </Controller>
                            <Controller name="terms"
                                        control={control}
                                        render={({field}) =>
                                            <GenericFormCheckbox
                                                field={field}
                                                errors={errors}>
                                                I accept the&nbsp;
                                                <a
                                                    className="font-medium text-primary-500 hover:text-gray-900"
                                                    href="#"
                                                >
                                                    Terms and Conditions
                                                </a>
                                                &nbsp;and&nbsp;
                                                <a
                                                    className="font-medium text-primary-500 hover:text-gray-900"
                                                    href="#"
                                                >
                                                    Privacy Policy
                                                </a>
                                            </GenericFormCheckbox>
                                        }>
                            </Controller>
                            <GenericButton
                                text="Create account"
                                type="submit"
                                className="w-full"
                                isPending={isPending}>
                            </GenericButton>
                        </form>
                        <hr className="text-gray-200"/>
                        <OAuth2ProviderLoginButton provider="google" type="Sign up"/>
                    </div>
                </CardBody>
                <CardFooter>
                    <p className="text-center text-sm font-medium text-gray-900">
                        Already have an account? &nbsp;
                        <GenericLink to="/login">
                            Sign in
                        </GenericLink>
                    </p>
                </CardFooter>
            </CommonAuthLoginCard>
        </CommonAuthLoginLayout>
    );
}
