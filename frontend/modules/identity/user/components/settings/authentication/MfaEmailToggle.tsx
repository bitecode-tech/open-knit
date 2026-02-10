import {ToggleCard} from "@common/components/blocks/ToggleCard.tsx";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import UserService from "@identity/user/services/UserService.ts";
import {MfaMethod} from "@identity/user/types/model/MfaMethod.ts";
import {showToast} from "@common/components/blocks/ToastManager.tsx";
import {useAuth} from "@identity/auth/contexts/AuthContext.tsx";
import {useState} from "react";
import {MfaDisableEnableModals} from "@identity/user/components/settings/authentication/MfaDisableEnableModals.tsx";

interface MfaEmailToggleProps {
    currentMfaMethod?: MfaMethod
}

export function MfaEmailToggle({currentMfaMethod}: MfaEmailToggleProps) {
    const queryClient = useQueryClient();
    const {user} = useAuth();
    const [showDisableAuthModal, setShowDisableAuthModal] = useState(false);
    const [showDuplicateEnableVerificationAuthModal, setShowDuplicateEnableVerificationAuthModal] = useState(false);

    const {isPending, mutate} = useMutation({
        mutationFn: (mfaMethod: MfaMethod) => UserService.setMfaMethod(mfaMethod),
        onSuccess: async (result) => {
            if (result.completed) {
                showToast("success", "Authentication method changed to email");
                await queryClient.invalidateQueries({queryKey: UserService.QUERY_KEYS.GET_USER(user?.uuid as string)});
            } else {
                showToast("error");
            }
        }
    });

    const onToggle = (toggleValue: boolean) => {
        if (!toggleValue) {
            setShowDisableAuthModal(true);
        } else {
            if (currentMfaMethod !== undefined) {
                setShowDuplicateEnableVerificationAuthModal(true);
            } else {
                mutate(MfaMethod.EMAIL);
            }
        }
    }

    return <>
        <ToggleCard
            title="Email authentication"
            text="Receive an authentication code by email during the sign-in flow."
            toggle={currentMfaMethod === MfaMethod.EMAIL}
            onToggle={onToggle}
            disabled={isPending}
        />

        <MfaDisableEnableModals
            showDisableAuthModal={showDisableAuthModal}
            setShowDisableAuthModal={setShowDisableAuthModal}
            showDuplicateEnableVerificationAuthModal={showDuplicateEnableVerificationAuthModal}
            setShowDuplicateEnableVerificationAuthModal={setShowDuplicateEnableVerificationAuthModal}
            disableMfaMutateFun={() => mutate(MfaMethod.DISABLE)}
        />
    </>
}