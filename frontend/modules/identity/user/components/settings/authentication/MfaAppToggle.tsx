import {ToggleCard} from "@common/components/blocks/ToggleCard.tsx";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import UserService from "@identity/user/services/UserService.ts";
import {MfaMethod} from "@identity/user/types/model/MfaMethod.ts";
import {showToast} from "@common/components/blocks/ToastManager.tsx";
import {useAuth} from "@identity/auth/contexts/AuthContext.tsx";
import {ActionModal} from "@common/components/modals/ActionModal.tsx";
import QRCode from 'react-qr-code';
import {useState} from "react";
import {TextInput} from "flowbite-react";
import {GenericModal} from "@common/components/modals/GenericModal.tsx";
import {MfaDisableEnableModals} from "@identity/user/components/settings/authentication/MfaDisableEnableModals.tsx";

const enum ModalState {
    CONFIGURE_THE_APP,
    CONFIRMATION_CODE,
    SUCCESS
}

interface MfaAppToggleProps {
    currentMfaMethod?: MfaMethod
}

export function MfaAppToggle({currentMfaMethod}: MfaAppToggleProps) {
    const queryClient = useQueryClient();
    const {user} = useAuth();
    const [modalState, setModalState] = useState<ModalState | null>(null);
    const [confirmationCode, setConfirmationCode] = useState("")
    const [showDisableAuthModal, setShowDisableAuthModal] = useState(false);
    const [showDuplicateEnableVerificationAuthModal, setShowDuplicateEnableVerificationAuthModal] = useState(false);

    const {data: mfaResult, isPending, mutate, mutateAsync, isError} = useMutation({
        mutationFn: ({mfaMethod, code}: { mfaMethod: MfaMethod; code?: string }) => UserService.setMfaMethod(mfaMethod, code),
        onSuccess: async (result) => {
            if (result.completed) {
                showToast("success", "Authentication method changed successfully");
                await queryClient.invalidateQueries({queryKey: UserService.QUERY_KEYS.GET_USER(user?.uuid as string)});
                setModalState(ModalState.SUCCESS)
            } else if (!result.completed && result.qrCodeImageUri) {
                setModalState(ModalState.CONFIGURE_THE_APP);
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
                mutate({mfaMethod: MfaMethod.QR_CODE});
            }
        }
    }

    return <>
        <ToggleCard
            title="App authentication"
            text="Use a mobile app to authenticate during the sing-in flow."
            toggle={currentMfaMethod === MfaMethod.QR_CODE}
            onToggle={onToggle}
            disabled={isPending}
        />

        <ActionModal headerText="Configure the App"
                     message="Install a two factor authenticator app such as Google Authenticator on your smartphone or tablet, then scan the QR code below."
                     buttonText="Next step"
                     buttonColor="alternative"
                     showModal={modalState === ModalState.CONFIGURE_THE_APP}
                     onAction={() => setModalState(ModalState.CONFIRMATION_CODE)}
                     onClose={() => setModalState(null)}
        >
            <QRCode className="mx-auto py-8" value={mfaResult?.qrCodeImageUri as string} size={250}/>
        </ActionModal>

        <ActionModal headerText="Confirmation code"
                     message="Enter 6-digit code your app generated."
                     buttonText="Verify"
                     buttonColor="default"
                     showModal={modalState === ModalState.CONFIRMATION_CODE}
                     onAction={() => mutate({mfaMethod: MfaMethod.QR_CODE, code: confirmationCode})}
                     onClose={() => setModalState(null)}
        ><>
            <TextInput value={confirmationCode}
                       className="mt-2"
                       type="text"
                       onChange={(e) => setConfirmationCode(e.target.value)}>
            </TextInput>
            {isError && <p className="text-sm text-red-500 pt-4">Invalid code</p>}
        </>
        </ActionModal>
        <GenericModal
            variant="success"
            showModal={modalState === ModalState.SUCCESS}
            onAction={() => setModalState(null)}
            onClose={() => setModalState(null)}
        />

        <MfaDisableEnableModals
            showDisableAuthModal={showDisableAuthModal}
            setShowDisableAuthModal={setShowDisableAuthModal}
            showDuplicateEnableVerificationAuthModal={showDuplicateEnableVerificationAuthModal}
            setShowDuplicateEnableVerificationAuthModal={setShowDuplicateEnableVerificationAuthModal}
            disableMfaMutateFun={() => mutate({mfaMethod: MfaMethod.DISABLE})}
        />
    </>
}