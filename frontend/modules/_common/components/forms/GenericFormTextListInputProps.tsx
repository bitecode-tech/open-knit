import React, {ComponentProps, useMemo} from 'react'
import {ControllerRenderProps, FieldErrors, FieldValues, Path} from 'react-hook-form'
import {HelperText, Label, TextInput} from 'flowbite-react'
import XIcon from '@common/assets/common/x-icon.svg?react'
import type {FlowbiteSizes} from "flowbite-react/types";

export interface GenericFormTextListInputProps<T extends FieldValues, F extends Path<T>>
    extends Omit<ComponentProps<'input'>, 'onChange' | 'value'> {
    field: ControllerRenderProps<T, F>
    errors: FieldErrors<T>
    label?: string
    sizing?: keyof Pick<FlowbiteSizes, "sm" | "md" | "lg">
    placeholder?: string
    maxItems?: number
    wrapperClassName?: string,
}

function toStringArray(value: unknown): string[] {
    if (!Array.isArray(value)) {
        return []
    }
    return value.map(v => (typeof v === 'string' ? v : String(v ?? '')))
}

function ensureSingleTrailingEmpty(items: string[]): string[] {
    const out = [...items]
    while (out.length > 1 && out[out.length - 1].trim() === '' && out[out.length - 2].trim() === '') {
        out.pop()
    }
    if (out.length === 0 || out[out.length - 1].trim() !== '') out.push('')
    return out
}

function sanitize(items: string[], maxItems?: number): string[] {
    // Preserve original user-typed values while using trimmed versions only for emptiness checks.
    const raw = items.map(v => (typeof v === 'string' ? v : String(v ?? '')))
    const trimmed = raw.map(i => i.trim())

    // Decide which indices to keep based on trimmed emptiness, but return original values.
    const filteredOriginal = raw.filter((_, idx) => {
        const prevFilled = idx > 0 ? trimmed[idx - 1] !== '' : true
        const nextFilled = idx < trimmed.length - 1 ? trimmed[idx + 1] !== '' : true
        return trimmed[idx] !== '' || (!prevFilled && !nextFilled) || idx === trimmed.length - 1
    })

    const withoutExtraTrailing = ensureSingleTrailingEmpty(filteredOriginal)
    return typeof maxItems === 'number' ? withoutExtraTrailing.slice(0, maxItems + 1) : withoutExtraTrailing
}

export function GenericFormTextListInput<T extends FieldValues, F extends Path<T>>({
                                                                                       field,
                                                                                       errors,
                                                                                       label,
                                                                                       placeholder,
                                                                                       maxItems,
                                                                                       className,
                                                                                       sizing = "sm",
                                                                                       wrapperClassName,
                                                                                       ...inputProps
                                                                                   }: GenericFormTextListInputProps<T, F>) {
    const fieldName = field.name
    const error = errors[fieldName]
    const errorMessage = typeof error?.message === 'string' ? error.message : undefined
    const color = error ? 'failure' : undefined

    const items = useMemo(() => sanitize(toStringArray(field.value), maxItems), [field.value, maxItems])

    const updateAt = (index: number, value: string) => {
        const base = toStringArray(field.value)
        const next = [...base]
        next[index] = value
        field.onChange(sanitize(next, maxItems))
    }

    const removeAt = (index: number) => {
        const base = toStringArray(field.value)
        const filtered = base.filter((_, i) => i !== index)
        field.onChange(sanitize(filtered, maxItems))
    }

    return (
        <div className={wrapperClassName}>
            <Label htmlFor={field.name} className="mb-2 block" color={color}>
                {label}
            </Label>

            <div className="flex flex-col gap-2">
                {items.map((value, idx) => {
                    const isRemovable = value !== ''
                    return (
                        <div key={`${field.name}-${idx}`} className="relative flex items-center group w-fit">
                            <TextInput
                                id={`${field.name}-${idx}`}
                                type="text"
                                color={color}
                                value={value}
                                sizing={sizing}
                                onChange={e => updateAt(idx, e.target.value)}
                                placeholder={placeholder}
                                className={className}
                                {...inputProps}
                            />
                            {isRemovable && (
                                <button
                                    type="button"
                                    onClick={() => removeAt(idx)}
                                    tabIndex={-1}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-600 cursor-pointer"
                                    aria-label="Remove"
                                >
                                    <XIcon/>
                                </button>
                            )}
                        </div>
                    )
                })}
            </div>

            <HelperText color={color}>
                <span>{errorMessage}</span>
            </HelperText>
        </div>
    )
}
