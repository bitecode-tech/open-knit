import {Toast as FlowbiteToast, ToastToggle} from "flowbite-react";
import {HiCheck, HiExclamation, HiX} from "react-icons/hi";
import {toast, Toaster} from "react-hot-toast";

export const ToastVariant = {
    success: {
        style: "bg-green-100 text-green-500",
        icon: <HiCheck className="h-5 w-5"/>,
        defaultMessage: undefined
    },
    error: {
        style: "bg-red-100 text-red-500",
        icon: <HiX className="h-5 w-5"/>,
        defaultMessage: "Something went wrong, please try again later.",
    },
    warning: {
        style: "bg-orange-100 text-orange-500",
        icon: <HiExclamation className="h-5 w-5"/>,
        defaultMessage: undefined
    }
} as const;

export type ToastVariant = keyof typeof ToastVariant;

export interface ToastProps {
    variant: ToastVariant;
    message?: string;
    onDismiss?: () => void
}

function CustomToast({message, variant, onDismiss}: ToastProps) {
    const toastVariant = ToastVariant[variant]
    return (
        <FlowbiteToast>
            <div className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${toastVariant.style}`}>
                {toastVariant.icon}
            </div>
            <div className="ml-3 text-sm font-normal">{message ? message : toastVariant.defaultMessage}</div>
            <ToastToggle onClick={onDismiss}/>
        </FlowbiteToast>
    );
}

export function ToastManager() {
    return <Toaster position="top-right"/>;
}

export function showToast(variant: ToastVariant, message?: string) {
    toast.custom((t) => (
        <div className={`transition-all duration-300 ${t.visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}>
            <CustomToast
                message={message}
                variant={variant}
                onDismiss={() => toast.dismiss(t.id)}
            />
        </div>
    ), {duration: 4000});
}

