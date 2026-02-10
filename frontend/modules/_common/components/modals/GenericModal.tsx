import {Button, Modal as FlowbiteModal, ModalBody, ModalHeader} from "flowbite-react";
import {Dispatch, JSX, SetStateAction, useState} from "react";
import OkCircleIcon from "@common/assets/common/OkCircleIcon.svg"
import {H} from "@common/components/misc/H.tsx";
import {ModalVariant} from "@common/components/modals/GenericModalVariant.ts";

export interface ModalProps {
    variant: ModalVariant;
    buttonText?: string;
    headerText?: string;
    message?: string | JSX.Element;
    showModal: boolean;
    setShowModal?: Dispatch<SetStateAction<boolean>>;
    onAction?: () => void;
    onClose?: () => void;
}

export function GenericModal({variant, buttonText, headerText, message, onAction, onClose, showModal, setShowModal}: ModalProps) {
    const [_, setPendingAction] = useState(false);
    const modalVariant = ModalVariant[variant];
    if (!buttonText) {
        buttonText = modalVariant.defaultButtonText;
    }
    if (!headerText) {
        headerText = modalVariant.defaultHeaderText;
    }

    const onClick = (onFunction?: () => void) => {
        if (onFunction) {
            setPendingAction(true);
            onFunction();
            setPendingAction(false);
        }
        if (setShowModal) {
            setShowModal(false);
        }
    }

    return (
        <FlowbiteModal
            show={showModal}
            size="lg"
            onClose={() => onClick(onClose)}
            popup
        >
            <ModalHeader></ModalHeader>
            <ModalBody>
                <div className="flex flex-col text-center gap-y-4">
                    <img src={OkCircleIcon} className="mx-auto" alt="icon"/>
                    <H level="h5">{headerText}</H>
                    <div className="self-stretch text-center justify-start text-gray-600 text-sm">
                        {message}
                    </div>
                    <Button className="mx-auto" onClick={() => onClick(onAction)}>
                        {buttonText}
                    </Button>
                </div>
            </ModalBody>
        </FlowbiteModal>
    );
}
