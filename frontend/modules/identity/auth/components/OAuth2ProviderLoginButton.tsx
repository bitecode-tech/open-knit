import {GenericButton} from "@common/components/blocks/GenericButton.tsx";
import {ComponentProps} from "react";
import GoogleIcon from '@common/assets/common/google-icon.svg?react';
import {twMerge} from "tailwind-merge";
import {capitalizeFirstLetter} from "@common/utils/StringUtils.ts";

export interface OAuth2ProviderLoginButtonProps extends ComponentProps<typeof GenericButton> {
    provider: OAuth2Provider
    type: "Sign in" | "Sign up"
}

const providersConf = {
    google: {
        icon: GoogleIcon
    }
} as const;

type OAuth2Provider = keyof typeof providersConf;

export default function OAuth2ProviderLoginButton({provider, type, ...rest}: OAuth2ProviderLoginButtonProps) {
    // const [isPending, setIsPending] = useState(false);
    const providerConfig = providersConf[provider];
    console.log(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080'}/oauth2/authorization/${provider}`)
    return (
        <GenericButton
            size="md"
            text={`${type} with ${capitalizeFirstLetter(provider)}`}
            className={twMerge("w-full", rest.className)}
            color="alternative"
            icon={providerConfig.icon}
            // isPending={isPending}
            onClick={() => {
                // setIsPending(true)
                window.location.href = `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080'}/oauth2/authorization/${provider}`;
                // setTimeout(() => setIsPending(false), 3000);
            }}
            {...rest}
        />
    );
}