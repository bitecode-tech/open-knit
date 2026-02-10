import React, {ComponentProps, ReactNode} from "react";
import {HelperText, Label, ToggleSwitch} from "flowbite-react";
import {ControllerRenderProps, FieldErrors, FieldValues, Path} from "react-hook-form";
import {twMerge} from "tailwind-merge";
import {GenericTooltip} from "@common/components/elements/GenericTooltip.tsx";

export interface GenericFormToggleSwitchProps<T extends FieldValues, F extends Path<T>> extends Omit<ComponentProps<typeof ToggleSwitch>, "checked" | "onChange"> {
    field: ControllerRenderProps<T, F>;
    label?: string
    tooltip?: React.ReactNode,
    errors: FieldErrors<T>;
    fieldName?: F;
    children?: ReactNode; // used as the ToggleSwitch label
    wrapperClassName?: string,
    switchText?: string | { true: string, false: string }
}

export function GenericFormToggleSwitch<T extends FieldValues, F extends Path<T>>({
                                                                                      label,
                                                                                      field,
                                                                                      tooltip,
                                                                                      errors,
                                                                                      children,
                                                                                      wrapperClassName,
                                                                                      switchText,
                                                                                      ...toggleProps
                                                                                  }: GenericFormToggleSwitchProps<T, F>) {
    const error = errors[field.name];
    const errorMessage = typeof error?.message === "string" ? error.message : undefined;
    const color = error ? "failure" : undefined;

    const constantText = typeof switchText === 'string';

    const getSwitchText = () => {
        if (constantText) {
            return switchText;
        }
        return !!field.value ? switchText?.true : switchText?.false
    }

    return (
        <div className={twMerge(wrapperClassName)}>
            <Label htmlFor={field.name}
                   className="mb-2 block"
                   color={color}>
                <div className="flex gap-1 items-center">
                    <div>{label}</div>
                    {tooltip && <GenericTooltip>{tooltip}</GenericTooltip>}
                </div>
            </Label>

            <div className="flex items-center gap-2">
                <ToggleSwitch
                    id={field.name as string}
                    {...toggleProps}
                    sizing="sm"
                    checked={!!field.value}
                    label={typeof children === 'string' ? children : undefined}
                    onChange={(checked: boolean) => {
                        field.onChange(checked)
                    }}
                />
                {children}
                <div className={`${!!field.value ? "text-gray-900" : "text-gray-500"} text-sm font-medium leading-none`}>{getSwitchText()}</div>
            </div>
            {errorMessage && (
                <HelperText color="failure">
                    <span>{errorMessage}</span>
                </HelperText>
            )}
        </div>
    );
}
