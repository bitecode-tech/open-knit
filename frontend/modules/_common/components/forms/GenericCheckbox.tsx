import {Checkbox, Label} from "flowbite-react";
import {ControllerRenderProps, FieldErrors, FieldValues, Path} from "react-hook-form";
import {ComponentProps, ReactNode} from "react";

export interface GenericFormCheckbox<T extends FieldValues, F extends Path<T>> extends ComponentProps<typeof Checkbox> {
    field: ControllerRenderProps<T, F>;
    errors: FieldErrors<T>;
    fieldName?: F;
    children?: ReactNode;
}

export function GenericFormCheckbox<T extends FieldValues, F extends Path<T>>({field, errors, children, ...checkboxProps}: GenericFormCheckbox<T, F>) {
    const error = errors[field.name];
    return (
        <div>
            <div className="flex items-start">
                <div className="flex h-5 items-center">
                    <Checkbox
                        id={field.name}
                        checked={field.value}
                        {...field}
                        {...checkboxProps}
                        color={error && "failure"}
                    />
                </div>
                <div className="ml-3 text-sm">
                    <Label
                        htmlFor="terms-background"
                        className={`${error ? "text-red-500" : "text-gray-500"}`}
                    >
                        {children}
                    </Label>
                </div>
            </div>
        </div>
    )
}


