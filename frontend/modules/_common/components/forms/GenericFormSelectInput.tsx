import {ControllerRenderProps, FieldErrors, FieldValues, Path} from "react-hook-form";
import {HelperText, Label, Select, TextInput} from "flowbite-react";
import React, {ComponentProps, useEffect, useState} from "react";
import {GenericTooltip} from "@common/components/elements/GenericTooltip.tsx";

export interface GenericFormInputProps<T extends FieldValues, F extends Path<T>> extends ComponentProps<typeof Select> {
    field: ControllerRenderProps<T, F>;
    errors: FieldErrors<T>;
    label?: string;
    emptyOptionPlaceholderText?: string;
    options?: { label: string, id?: string }[];
    tooltip?: React.ReactNode,
    allowCustomValue?: boolean;
}

export function GenericFormSelectInput<T extends FieldValues, F extends Path<T>>({
                                                                                     field,
                                                                                     errors,
                                                                                     label,
                                                                                     emptyOptionPlaceholderText,
                                                                                     options,
                                                                                     allowCustomValue = false,
                                                                                     tooltip,
                                                                                     ...selectInputProps
                                                                                 }: GenericFormInputProps<T, F>) {
    const fieldName = field.name;
    const error = errors[fieldName];
    const errorMessage = typeof error?.message === "string" ? error.message : undefined;
    const color = error ? "failure" : undefined;

    const allOptionValues = (options ?? []).map(({label, id}) => (id ?? label));
    const isCustomValue = allowCustomValue && field.value !== undefined && field.value !== null && !allOptionValues.includes(String(field.value));
    const [showCustomInput, setShowCustomInput] = useState<boolean>(isCustomValue);

    useEffect(() => {
        if (isCustomValue) {
            setShowCustomInput(true);
        } else {
            setShowCustomInput(false);
        }

        if (selectInputProps.disabled && (field.value === null || field.value === "")) {
            setShowCustomInput(false);
            field.onChange("");
        }
    }, [isCustomValue, field.value, selectInputProps.disabled]);

    return (
        <div>
            <Label htmlFor={field.name}
                   className="mb-2 block"
                   color={color}>
                <div className="flex gap-1 items-center">
                    <div>{label}</div>
                    {tooltip && <GenericTooltip>{tooltip}</GenericTooltip>}
                </div>
            </Label>

            <Select
                id={field.name}
                color={color}
                {...field}
                value={showCustomInput ? "__custom__" : (field.value ?? "")}
                onChange={(e) => {
                    const val = e.target.value;
                    if (allowCustomValue && val === "__custom__") {
                        setShowCustomInput(true);
                        return;
                    }
                    setShowCustomInput(false);
                    field.onChange(val)
                }}
                {...selectInputProps}
                sizing={selectInputProps.sizing ?? "sm"}
            >
                {emptyOptionPlaceholderText && (
                    <option value="" disabled hidden defaultChecked>
                        {emptyOptionPlaceholderText}
                    </option>
                )}
                {options?.map(({label, id}) => <option key={id || label} value={id || label}>{label}</option>)}
                {allowCustomValue && (
                    <option value="__custom__">Custom value…</option>
                )}
            </Select>
            {allowCustomValue && showCustomInput && (
                <div className="mt-2">
                    <TextInput
                        id={`${field.name}-custom`}
                        color={color}
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value)}
                        placeholder="Enter custom value"
                        sizing={selectInputProps.sizing ?? "sm"}
                    />
                </div>
            )}
            <HelperText color={color}>
                <span>{errorMessage}</span>
            </HelperText>
        </div>
    )
}
