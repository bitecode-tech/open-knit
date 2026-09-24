import {Dispatch, ReactNode, SetStateAction} from "react";
import {Modal as FlowbiteModal, ModalBody} from "flowbite-react";

export interface GenericContentModalProps {
    showModal: boolean;
    setShowModal?: Dispatch<SetStateAction<boolean>>;
    onClose?: () => void;
    size?: "sm" | "md" | "lg" | "xl" | "2xl" | "4xl" | "5xl" | "6xl" | "7xl";
    children: ReactNode;
}

export function GenericContentModal({
    showModal,
    setShowModal,
    onClose,
    size = "lg",
    children,
}: GenericContentModalProps) {
    const handleClose = () => {
        if (setShowModal) {
            setShowModal(false);
        }
        if (onClose) {
            onClose();
        }
    };

    return (
        <FlowbiteModal
            show={showModal}
            size={size}
            popup
            dismissible
            onClose={handleClose}
        >
            <ModalBody className="p-0">
                {children}
            </ModalBody>
        </FlowbiteModal>
    );
}
