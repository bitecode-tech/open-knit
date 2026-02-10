import {ButtonColors, Modal as FlowbiteModal, ModalBody, ModalFooter, ModalHeader} from "flowbite-react";
import {type ComponentProps, Dispatch, JSX, SetStateAction, useState} from "react";
import type {DynamicStringEnumKeysOf} from "flowbite-react/types";
import {GenericButton} from "@common/components/blocks/GenericButton.tsx";

export interface ModalProps extends ComponentProps<typeof FlowbiteModal> {
    headerText: string;
    headerBg?: boolean
    message?: string;
    showModal: boolean;
    setShowModal?: Dispatch<SetStateAction<boolean>>;
    buttonText: string;
    buttonColor?: DynamicStringEnumKeysOf<ButtonColors>
    buttonOutline?: boolean,
    children?: JSX.Element
    onAction?: () => void
    onClose?: () => void
}

export function ActionModal({
                                headerText,
                                headerBg = false,
                                buttonText,
                                message,
                                buttonColor = "default",
                                buttonOutline = false,
                                children,
                                onAction,
                                onClose,
                                showModal,
                                setShowModal,
                                ...rest
                            }: ModalProps) {
    const [pendingAction, setPendingAction] = useState(false);

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
        <FlowbiteModal show={showModal}
                       size="lg"
                       onClose={() => onClose ? onClick(onClose) : setShowModal && setShowModal(false)}
                       className="pt-[100px]"
                       popup
                       {...rest}>
            <ModalHeader className={`${headerBg && "bg-primary-100"} p-5`}>
                <span className="text-gray-900 text-xl font-bold">{headerText}</span>
            </ModalHeader>
            {!headerBg && <hr className="text-gray-200"/>}
            <ModalBody className="p-5">
                <div className="self-stretch justify-start text-gray-500 text-sm md:text-base">
                    {message}
                </div>
                {children}
            </ModalBody>
            <hr className="text-gray-200"/>
            <ModalFooter>
                <GenericButton disabled={pendingAction}
                               color={buttonColor}
                               className="ml-auto"
                               isPending={pendingAction}
                               onClick={() => onClick(onAction)}
                               outline={buttonOutline}>
                    {buttonText}
                </GenericButton>
            </ModalFooter>
        </FlowbiteModal>
    );
}
