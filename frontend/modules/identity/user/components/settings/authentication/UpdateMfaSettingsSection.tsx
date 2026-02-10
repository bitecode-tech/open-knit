import {MfaEmailToggle} from "@identity/user/components/settings/authentication/MfaEmailToggle.tsx";
import {useQuery} from "@tanstack/react-query";
import UserService from "@identity/user/services/UserService.ts";
import {useAuth} from "@identity/auth/contexts/AuthContext.tsx";
import {MfaAppToggle} from "@identity/user/components/settings/authentication/MfaAppToggle.tsx";

export function UpdateMfaSettingsSection() {
    const {user} = useAuth();

    const {data: userDetails} = useQuery({
        queryKey: UserService.QUERY_KEYS.GET_USER(user!.uuid),
        queryFn: UserService.getSelf,
    });

    return (
        <div className="flex flex-col gap-4 max-w-[862px]">
            <p className="justify-start text-gray-500 text-sm md:text-base md:w-[532px]">
                Enhance your account security with Multi-Factor Authentication (MFA)
                for an extra level of protection.
            </p>
            <MfaEmailToggle currentMfaMethod={userDetails?.mfaMethod}/>
            <MfaAppToggle currentMfaMethod={userDetails?.mfaMethod}/>
        </div>
    );
}
