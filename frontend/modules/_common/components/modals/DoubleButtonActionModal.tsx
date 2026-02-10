import {ButtonColors, Modal as FlowbiteModal, ModalBody, ModalFooter, ModalHeader} from "flowbite-react";
import React, {Dispatch, JSX, SetStateAction, useState} from "react";
import type {DynamicStringEnumKeysOf} from "flowbite-react/types";
import {GenericButton} from "@common/components/blocks/GenericButton.tsx";

export interface ModalProps {
    headerText: string;
    headerBg?: boolean;
    message?: string | JSX.Element;
    children?: React.ReactNode
    isPending?: boolean;
    manual?: boolean;
    showModal: boolean
    setShowModal?: Dispatch<SetStateAction<boolean>>;
    actionButtonText: string;
    actionButtonColor?: DynamicStringEnumKeysOf<ButtonColors>
    actionButtonOutline?: boolean
    cancelButtonText?: string;
    cancelButtonColor?: DynamicStringEnumKeysOf<ButtonColors>
    cancelButtonOutline?: boolean
    onAction?: () => void
    onClose?: () => void
    onCancel?: () => void
}

export function DoubleButtonActionModal({
                                            headerText,
                                            headerBg,
                                            actionButtonText,
                                            actionButtonColor,
                                            cancelButtonText = "Cancel",
                                            cancelButtonColor = "blue",
                                            message,
                                            manual = false,
                                            isPending,
                                            children,
                                            showModal,
                                            setShowModal,
                                            onAction,
                                            onCancel,
                                            onClose,
                                            actionButtonOutline,
                                            cancelButtonOutline
                                        }: ModalProps) {
    const [pendingActionOrCancel, setPendingActionOrCancel] = useState(false);
    const isDisabled = () => manual ? isPending : pendingActionOrCancel;

    const onClick = (onFunction?: () => void) => {
        if (manual && onFunction) {
            onFunction();
        } else if (onFunction) {
            setPendingActionOrCancel(true);
            onFunction();
            setPendingActionOrCancel(false);
            if (setShowModal) {
                setShowModal(false);
            }
        }
    }

    return (
        <FlowbiteModal show={showModal}
                       size="lg"
                       className="pt-[100px]"
                       onClose={() => onClose ? onClick(onClose) : setShowModal && setShowModal(false)}
                       popup>
            <ModalHeader className={`${headerBg && "bg-primary-100"} p-5`}>
                <span className="text-gray-900 text-xl font-bold">{headerText}</span>
            </ModalHeader>
            {!headerBg && <hr className="text-gray-200"/>}
            <ModalBody className="p-5">
                {message
                    ? <div className="self-stretch justify-start text-sm md:text-base text-gray-500">
                        {message}
                    </div>
                    : children
                }
            </ModalBody>
            <hr className="text-gray-200"/>
            <ModalFooter>
                <div className="flex flex-wrap justify-end w-full gap-x-2">
                    <GenericButton
                        isPending={isDisabled()}
                        text={actionButtonText}
                        color={actionButtonColor}
                        onClick={() => onClick(onAction)}
                        outline={actionButtonOutline}>
                    </GenericButton>
                    <GenericButton disabled={isDisabled()}
                                   color={cancelButtonColor}
                                   onClick={() => onClick(onCancel)}
                                   outline={cancelButtonOutline}>
                        {cancelButtonText}
                    </GenericButton>
                </div>
            </ModalFooter>
        </FlowbiteModal>
    );
}
