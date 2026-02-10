import {ExistingFile} from "@common/components/forms/GenericFormMultiFileInput.tsx";
import React, {useRef} from "react";
import XIcon from '@common/assets/common/x-icon.svg?react'

interface FileCardProps {
    file: File | ExistingFile
    onRemove: () => void
    showFileType?: boolean
    isExisting?: boolean
}

function fileExtension(filename: string) {
    return filename.split('.').pop()?.toUpperCase() ?? 'File'
}

export default function FileCard({file, onRemove, showFileType = true, isExisting}: FileCardProps) {
    const xRef = useRef<HTMLButtonElement | null>(null)

    return (
        <div className="relative rounded-lg border border-gray-200 p-3 shadow-sm min-h-[64px] flex items-center">
            <button
                ref={xRef}
                type="button"
                aria-label="Remove"
                onClick={onRemove}
                className="absolute right-1 top-1 rounded-full p-1 cursor-pointer text-gray-500 hover:text-gray-600"
            >
                <XIcon/>
            </button>
            <div className="flex items-center gap-2 w-full pr-2">
                {showFileType && (
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-gray-100">
            <span className="text-xs font-semibold">
              {fileExtension(file.name)}
            </span>
                    </div>
                )}
                <div
                    className="min-w-0 flex-1"
                >
                    <div className="truncate text-sm font-semibold text-gray-900">
                        {file.name}
                    </div>
                    <div className="text-xs text-gray-500">
                        {isExisting
                            ? ((file as ExistingFile).sizeBytes / 1024).toFixed(0)
                            : ((file as File).size / 1024).toFixed(0)}{" "}
                        KB
                    </div>
                </div>
            </div>
        </div>
    )
}
