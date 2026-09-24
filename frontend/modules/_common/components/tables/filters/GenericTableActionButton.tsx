import {GenericButton} from "@common/components/blocks/GenericButton.tsx";
import React, {type ComponentProps, type FC} from "react";
import {Button} from "flowbite-react";

interface GenericTableButtonProps extends ComponentProps<typeof Button> {
    children: React.ReactNode | string,
    icon: FC<ComponentProps<"svg">>,
    activeClassName?: string,
    disabledClassName?: string,
    labelClassName?: string,
    iconClassName?: string
}

const GenericTableActionButton = ({
    children,
    icon: Icon,
    activeClassName,
    disabledClassName,
    labelClassName,
    iconClassName,
    disabled,
    ...rest
}: GenericTableButtonProps) => {
    const buttonClassName = disabled
        ? disabledClassName
        : activeClassName;

    return (
        <GenericButton
            {...rest}
            disabled={disabled}
            color="alternative"
            className={`px-3 py-2 group ${buttonClassName ?? ""}`.trim()}
        >
            <div className="flex items-center gap-2  group-hover:text-primary-500">
                <div className={`text-gray-900 group-hover:text-primary-500 font-medium text-sm ${labelClassName ?? ""}`.trim()}>{children}</div>
                <Icon className={`text-gray-900 group-hover:text-primary-500 ${iconClassName ?? ""}`.trim()}/>
            </div>
        </GenericButton>
    )
}

export default GenericTableActionButton;
