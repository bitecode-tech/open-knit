import {DoubleButtonActionModal} from "@common/components/modals/DoubleButtonActionModal.tsx";
import {ActionModal} from "@common/components/modals/ActionModal.tsx";
import {Dispatch, SetStateAction} from "react";

export interface MfaDisableEnableModalsProps {
    showDisableAuthModal: boolean
    setShowDisableAuthModal: Dispatch<SetStateAction<boolean>>;
    showDuplicateEnableVerificationAuthModal: boolean
    setShowDuplicateEnableVerificationAuthModal: Dispatch<SetStateAction<boolean>>;
    disableMfaMutateFun: () => void
}

export function MfaDisableEnableModals({
                                           showDisableAuthModal,
                                           setShowDisableAuthModal,
                                           showDuplicateEnableVerificationAuthModal,
                                           setShowDuplicateEnableVerificationAuthModal,
                                           disableMfaMutateFun
                                       }: MfaDisableEnableModalsProps) {
    return <>
        <DoubleButtonActionModal headerText="Disable authentication?"
                                 message="This action will remove an extra level of protection from your account and could make it more vulnerable to unauthorized access."
                                 showModal={showDisableAuthModal}
                                 setShowModal={setShowDisableAuthModal}
                                 actionButtonText="Disable"
                                 actionButtonColor="red"
                                 cancelButtonColor="light"
                                 onCancel={() => setShowDisableAuthModal(false)}
                                 onAction={() => disableMfaMutateFun()}/>

        <ActionModal headerText="Enable verification?"
                     showModal={showDuplicateEnableVerificationAuthModal}
                     setShowModal={setShowDuplicateEnableVerificationAuthModal}
                     message="To enable this verification method, please disable your current verification method first."
                     buttonText="Okay, got this"/>
    </>
}