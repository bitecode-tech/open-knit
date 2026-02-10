import {ControllerRenderProps, FieldErrors, FieldValues, Path} from 'react-hook-form'
import {HelperText, Label} from 'flowbite-react'
import React, {ComponentProps, useMemo, useRef} from 'react'
import {GenericButton} from '@common/components/blocks/GenericButton.tsx'
import {GenericTooltip} from "@common/components/elements/GenericTooltip.tsx";
import FileCard from "@common/components/forms/multi-file-input/FileCard.tsx";
import {twMerge} from "tailwind-merge";

export interface ExistingFile {
    id: string
    name: string
    sizeBytes: number
}

export interface GenericFormMultiFileInputProps<
    T extends FieldValues,
    FE extends Path<T>,
    FN extends Path<T>
> extends Omit<ComponentProps<'input'>, 'onChange' | 'value' | 'type'> {
    existingFilesField: ControllerRenderProps<T, FE>
    newFilesField: ControllerRenderProps<T, FN>
    errors: FieldErrors<T>
    label?: string
    tooltip?: string,
    addButtonText?: string
    emptyStateText?: string
    showFileType?: boolean
    wrapperClassName?: string
}

function buildFileKey(file: File | ExistingFile) {
    if (file instanceof File) {
        return `${file.name}-${file.size}-${file.lastModified}`
    }
    return `${file.name}-${file.sizeBytes}-${file.id}`
}

export function GenericFormMultiFileInput<
    T extends FieldValues,
    FE extends Path<T>,
    FN extends Path<T>>({
                            existingFilesField,
                            newFilesField,
                            errors,
                            label,
                            accept,
                            multiple,
                            addButtonText,
                            emptyStateText,
                            showFileType,
                            tooltip,
                            wrapperClassName,
                            ...rest
                        }: GenericFormMultiFileInputProps<T, FE, FN>) {
    const inputRef = useRef<HTMLInputElement | null>(null)

    const error =
        errors[existingFilesField.name] || errors[newFilesField.name]
    const errorMessage =
        typeof (error as any)?.message === 'string'
            ? (error as any).message
            : undefined
    const color = error ? 'failure' : undefined

    const existingFiles: ExistingFile[] = Array.isArray(existingFilesField.value)
        ? existingFilesField.value
        : []
    const newFiles: File[] = Array.isArray(newFilesField.value)
        ? newFilesField.value
        : []

    const fileKeys = useMemo(
        () =>
            new Set(
                [...existingFiles, ...newFiles].map(file => buildFileKey(file))
            ),
        [existingFiles, newFiles]
    )

    const openPicker = () => inputRef.current?.click()

    const onFilesSelected: React.ChangeEventHandler<HTMLInputElement> = e => {
        const selected = Array.from(e.target.files || [])
        const merged: File[] = [...newFiles]
        for (const f of selected) {
            const key = buildFileKey(f)
            if (!fileKeys.has(key)) {
                merged.push(f)
            }
        }
        newFilesField.onChange(merged)
        if (inputRef.current) inputRef.current.value = ''
    }

    const removeExistingAt = (idx: number) => {
        const next = existingFiles
            .slice(0, idx)
            .concat(existingFiles.slice(idx + 1))
        existingFilesField.onChange(next)
    }

    const removeNewAt = (idx: number) => {
        const next = newFiles.slice(0, idx).concat(newFiles.slice(idx + 1))
        newFilesField.onChange(next)
    }

    return (
        <div className={twMerge(wrapperClassName, "space-y-2")}>
            <Label htmlFor={newFilesField.name}
                   className="mb-2 block"
                   color={color}>
                <div className="flex gap-1 items-center">
                    <div>{label}</div>
                    {tooltip && <GenericTooltip>{tooltip}</GenericTooltip>}
                </div>
            </Label>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 auto-rows-fr">
                {existingFiles.map((file, idx) => (
                    <FileCard
                        key={buildFileKey(file)}
                        file={file}
                        isExisting
                        onRemove={() => removeExistingAt(idx)}
                    />
                ))}
                {newFiles.map((file, idx) => (
                    <FileCard
                        key={buildFileKey(file)}
                        file={file}
                        onRemove={() => removeNewAt(idx)}
                    />
                ))}
                {existingFiles.length + newFiles.length === 0 && (
                    <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
                        {emptyStateText ?? 'No files added yet'}
                    </div>
                )}
            </div>

            <div className="flex items-center gap-3">
                <GenericButton
                    size="sm"
                    color={color ? 'failure' : 'alternative'}
                    onClick={openPicker}
                >
                    {addButtonText ?? '+ New'}
                </GenericButton>
                <input
                    {...rest}
                    ref={inputRef}
                    id={newFilesField.name}
                    type="file"
                    className="hidden"
                    accept={accept}
                    multiple={multiple ?? true}
                    onChange={onFilesSelected}
                />
            </div>

            <HelperText color={color}>
                <span>{errorMessage}</span>
            </HelperText>
        </div>
    )
}
