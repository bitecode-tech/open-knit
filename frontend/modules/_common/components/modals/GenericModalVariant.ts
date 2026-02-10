import OkCircleIcon from "@common/assets/common/OkCircleIcon.svg";
import ErrCrossCircleIcon from "@common/assets/common/ErrCrossCircleIcon.svg";

export const ModalVariant = {
    success: {defaultButtonText: "Continue", defaultHeaderText: "Success!", icon: OkCircleIcon},
    error: {defaultButtonText: "Try again", defaultHeaderText: "Something went wrong", icon: ErrCrossCircleIcon},
} as const;

export type ModalVariant = keyof typeof ModalVariant;

