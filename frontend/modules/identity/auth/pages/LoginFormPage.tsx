import {Checkbox, Label} from "flowbite-react";
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {Controller, FieldValues, Path, SubmitHandler, useForm} from 'react-hook-form';
import {Link, useNavigate} from "react-router-dom";
import {useState} from "react";
import {SignInState} from "@identity/auth/types/enums/SignInState.ts";
import {MfaVerificationFormPage} from "@identity/auth/pages/MfaVerificationFormPage.tsx";
import {useAuth} from "@identity/auth/contexts/AuthContext.tsx";
import {MfaMethod} from "@identity/user/types/model/MfaMethod.ts";
import {GenericFormInputProps, GenericFormTextInput} from "@common/components/forms/GenericFormTextInput.tsx";
import {GenericButton} from "@common/components/blocks/GenericButton.tsx";
import {CommonAuthLoginLayout} from "@identity/auth/components/CommonAuthLoginLayout.tsx";
import {CardBody, CardFooter, CommonAuthLoginCard} from "@identity/auth/components/hero/CommonAuthLoginCard.tsx";
import GenericLink from "@common/components/elements/GenericLink.tsx";
import OAuth2ProviderLoginButton from "@identity/auth/components/OAuth2ProviderLoginButton.tsx";

interface FormInputs {
    email: string
    password: string
    rememberDevice: boolean
}

const formSchema = z.object({
    email: z.string().email("Must be email"),
    password: z.string().min(5, "Must be min 5 chars"),
    rememberDevice: z.boolean()
});

export function LoginFormPage() {
    const [loginState, setLoginState] = useState<SignInState | null>(null);
    const navigate = useNavigate();
    const auth = useAuth();
    const [isPending, setIsPending] = useState(false);

    const {
        control,
        handleSubmit,
        formState: {errors},
        getValues,
        reset,
        setError
    } = useForm<FormInputs>({
        mode: 'onSubmit',
        resolver: zodResolver(formSchema),
        defaultValues: {
            rememberDevice: false,
        },
    });

    const onSubmit: SubmitHandler<FormInputs> = async ({password, email, rememberDevice}) => {
        try {
            setIsPending(true);
            const loginState = await auth.login(email, password, rememberDevice)
            if (loginState === SignInState.INVALID_LOGIN_DETAILS) {
                setError("email", {type: "Manual", message: "Incorrect email or password"})
                setError("password", {type: "Manual", message: "Incorrect email or password"})
            }
            setLoginState(loginState);
        } catch (error) {
            console.log(error)
        } finally {
            setIsPending(false);
        }
    };

    if (loginState === SignInState.SUCCESS) {
        navigate("/user");
    } else if ([SignInState.MFA_REQUIRED_APP, SignInState.MFA_REQUIRED_EMAIL].find(state => state === loginState)) {
        const {password, email, rememberDevice} = getValues();
        const mfaMethod = SignInState.MFA_REQUIRED_EMAIL === loginState ? MfaMethod.EMAIL : MfaMethod.QR_CODE;
        const goBack = () => {
            setLoginState(null);
            reset();
        }
        return <MfaVerificationFormPage username={email} password={password} mfaMethod={mfaMethod} rememberDevice={rememberDevice} goBack={goBack}/>;
    } else if (loginState === SignInState.EMAIL_VALIDATION_REQUIRED) {
        navigate("/verify-account", {state: {email: getValues().email}})
    }

    return (
        <CommonAuthLoginLayout>
            <CommonAuthLoginCard>
                <CardBody>
                    <div className="space-y-5">
                        <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl">
                            Sign in to your account
                        </h1>
                        <form className="space-y-4 md:space-y-5" action="#" onSubmit={handleSubmit(onSubmit)}>
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
                                            <PasswordInput
                                                label="Password"
                                                required
                                                type="password"
                                                errors={errors}
                                                sizing="md"
                                                field={field}/>
                                        }>
                            </Controller>
                            <div className="flex items-center justify-between">
                                <div className="flex items-start">
                                    <div className="flex h-5 items-center">
                                        <Controller
                                            name="rememberDevice"
                                            control={control}
                                            render={({field}) => (
                                                <Checkbox
                                                    id="rememberDevice"
                                                    name="rememberDevice"
                                                    checked={field.value}
                                                    onChange={(e) => field.onChange(e.target.checked)}
                                                />
                                            )}
                                        />
                                    </div>
                                    <div className="ml-3 text-sm">
                                        <Label
                                            htmlFor="rememberDevice"
                                            className="text-gray-900"
                                        >
                                            Remember me on this device
                                        </Label>
                                    </div>
                                </div>
                            </div>
                            <GenericButton
                                text="Sign in"
                                type="submit"
                                className="w-full"
                                isPending={isPending}
                            />
                        </form>
                        <hr className="text-gray-200"/>
                        <OAuth2ProviderLoginButton provider="google" type="Sign in"/>
                    </div>
                </CardBody>
                <CardFooter>
                    <div className="text-center text-sm text-gray-900 bg-gray-50">
                        Don't have an account? &nbsp;
                        <GenericLink to="/register">
                            Sign up
                        </GenericLink>
                    </div>
                </CardFooter>
            </CommonAuthLoginCard>
        </CommonAuthLoginLayout>
    )
}

export function PasswordInput<T extends FieldValues, F extends Path<T>>({field, errors, label, ...rest}: GenericFormInputProps<T, F>) {
    return (
        <div>
            <div className="flex mb-2 justify-between">
                <GenericFormTextInput.Label field={field} label={label} className="mb-0"/>
                <Link
                    tabIndex={-1}
                    to="/forgot-password"
                    className="text-sm font-medium text-primary-500 hover:text-secondary-900"
                >
                    Forgot your password?
                </Link>
            </div>
            <GenericFormTextInput.TextInput field={field} errors={errors} {...rest} type="password"/>
            <GenericFormTextInput.HelperText field={field} errors={errors}/>
        </div>
    )
}
