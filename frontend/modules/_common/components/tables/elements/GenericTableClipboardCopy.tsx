import {FileCopy} from "flowbite-react-icons/outline";
import {showToast} from "@common/components/blocks/ToastManager.tsx";
import React from "react";
import {twMerge} from "tailwind-merge";

interface GenericTableCopyRowProps {
    value?: string
    fallbackText?: string
    toastMessage?: string
    className?: string,
}

const GenericTableClipboardCopy = ({value, fallbackText = "-", toastMessage = "Copied to clipboard!", className}: GenericTableCopyRowProps) => {
    return (
        <div className={twMerge("flex items-center", className)}>
            {value &&
                <FileCopy className="pr-1 text-gray-500 hover:text-primary-500 cursor-pointer"
                          onClick={() => {
                              navigator.clipboard.writeText(value)
                                  .then(() => showToast("success", toastMessage));
                          }}
                />
            }
            <span className="text-sm text-gray-700 whitespace-nowrap">{value ?? fallbackText}</span>
        </div>
    );
}

export default GenericTableClipboardCopy;