import {ControllerRenderProps, FieldErrors, FieldValues, Path} from "react-hook-form";
import {HelperText as FlowbiteHelperText, Label as FlowbiteLabel, TextInput as FlowbiteTextInput} from "flowbite-react";
import React, {ComponentProps, FC, useState} from "react";
import {IoEyeOffOutline, IoEyeOutline} from "react-icons/io5";
import {GenericTooltip} from "@common/components/elements/GenericTooltip.tsx";

const getColor = <T extends FieldValues>(errors: FieldErrors<T>, field: ControllerRenderProps<T>) => {
    const error = errors[field.name];
    return error ? "failure" : undefined;
}

const getErrorMessage = <T extends FieldValues>(errors: FieldErrors<T>, field: ControllerRenderProps<T>) => {
    const error = errors[field.name];
    return typeof error?.message === "string" ? error.message : undefined;
}

export interface GenericFormInputProps<T extends FieldValues, F extends Path<T>> extends ComponentProps<typeof FlowbiteTextInput> {
    field: ControllerRenderProps<T, F>;
    errors: FieldErrors<T>;
    label?: string;
    wrapperClassName?: string;
    tooltip?: string,
}

const GenericFormTextInputComponent = function GenericFormTextInput<T extends FieldValues, F extends Path<T>>({
                                                                                                                  field,
                                                                                                                  errors,
                                                                                                                  label,
                                                                                                                  wrapperClassName,
                                                                                                                  tooltip,
                                                                                                                  ...textInputProps
                                                                                                              }: GenericFormInputProps<T, F>) {
    return (
        <div className={wrapperClassName}>
            <Label label={label} field={field} tooltip={tooltip} disabled={textInputProps.disabled}/>
            <TextInput field={field} errors={errors} {...textInputProps}/>
            <HelperText field={field} errors={errors}/>
        </div>
    )
}

interface TextInputProps<T extends FieldValues, F extends Path<T>> extends ComponentProps<typeof FlowbiteTextInput> {
    field: ControllerRenderProps<T, F>;
    errors: FieldErrors<T>;
}

function TextInput<T extends FieldValues, F extends Path<T>>({field, errors, ...textInputProps}: TextInputProps<T, F>) {
    const [showPassword, setShowPassword] = useState(false);
    const isPasswordField = textInputProps.type === "password";

    return <FlowbiteTextInput
        {...textInputProps}
        id={field.name}
        color={getColor(errors, field)}
        sizing={textInputProps.sizing ?? "sm"}
        {...field}
        type={isPasswordField && showPassword ? "text" : textInputProps.type}
        rightIcon={isPasswordField ? () => (
            <button type="button" tabIndex={-1} onClick={() => setShowPassword((prev) => !prev)}
                    className="focus:outline-none pointer-events-auto cursor-pointer px-1 text-gray-500">
                {showPassword ? <IoEyeOffOutline className="h-5 w-5"/> : <IoEyeOutline className="h-5 w-5"/>}
            </button>
        ) : undefined}
    />
}

interface LabelProps<T extends FieldValues, F extends Path<T>> extends ComponentProps<typeof FlowbiteLabel> {
    field: ControllerRenderProps<T, F>;
    label?: string;
    tooltip?: string;
}


function Label<T extends FieldValues, F extends Path<T>>({field, label, tooltip, ...labelProps}: LabelProps<T, F>) {
    return (
        <FlowbiteLabel
            {...labelProps}
            htmlFor={field.name}
            className="mb-2 block">
            <div className="flex gap-1 items-center">
                <div className="text-sm md:text-base">{label}</div>
                {tooltip && <GenericTooltip>{tooltip}</GenericTooltip>}
            </div>
        </FlowbiteLabel>
    )
}

interface HelperTextProps<T extends FieldValues, F extends Path<T>> extends ComponentProps<typeof FlowbiteHelperText> {
    field: ControllerRenderProps<T, F>;
    errors: FieldErrors<T>;
}

function HelperText<T extends FieldValues, F extends Path<T>>({field, errors, ...helperTextProps}: HelperTextProps<T, F>) {
    return <FlowbiteHelperText color={getColor(errors, field)} {...helperTextProps}>
        <span>{getErrorMessage(errors, field)}</span>
    </FlowbiteHelperText>
}

interface GenericFormTextInputComponent extends FC<GenericFormInputProps<any, any>> {
    TextInput: typeof TextInput;
    Label: typeof Label;
    HelperText: typeof HelperText;
}

GenericFormTextInputComponent.TextInput = TextInput;
GenericFormTextInputComponent.Label = Label;
GenericFormTextInputComponent.HelperText = HelperText;

const GenericFormTextInput: GenericFormTextInputComponent = GenericFormTextInputComponent;

export {GenericFormTextInput}