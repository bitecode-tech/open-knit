import React, {ComponentProps} from 'react'
import {ControllerRenderProps, FieldErrors, FieldValues, Path} from 'react-hook-form'
import {HelperText, Label, Textarea} from 'flowbite-react'

export interface GenericFormTextareaProps<T extends FieldValues, F extends Path<T>>
    extends Omit<ComponentProps<'textarea'>, 'onChange' | 'value'> {
    field: ControllerRenderProps<T, F>
    errors: FieldErrors<T>
    label?: string
    placeholder?: string
    rows?: number
    resize?: 'none' | 'x' | 'y' | 'both'
    wrapperClassName?: string,
}

export function GenericFormTextarea<T extends FieldValues, F extends Path<T>>({
                                                                                  field,
                                                                                  errors,
                                                                                  label,
                                                                                  placeholder,
                                                                                  rows = 4,
                                                                                  resize = 'y',
                                                                                  className,
                                                                                  wrapperClassName,
                                                                                  ...textareaProps
                                                                              }: GenericFormTextareaProps<T, F>) {
    const fieldName = field.name
    const error = errors[fieldName]
    const errorMessage = typeof error?.message === 'string' ? error.message : undefined
    const color = error ? 'failure' : undefined

    return (
        <div className={wrapperClassName}>
            {label && (
                <Label htmlFor={field.name} className="mb-2 block" color={color}>
                    {label}
                </Label>
            )}
            <Textarea
                id={field.name}
                color={color}
                placeholder={placeholder}
                value={field.value ?? ''}
                onChange={e => field.onChange(e.target.value)}
                rows={rows}
                className={`${className || ''} resize-${resize}`}
                {...textareaProps}
            />
            <HelperText color={color}>
                <span>{errorMessage}</span>
            </HelperText>
        </div>
    )
}
