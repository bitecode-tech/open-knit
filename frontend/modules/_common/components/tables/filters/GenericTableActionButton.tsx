import {GenericButton} from "@common/components/blocks/GenericButton.tsx";
import React, {type ComponentProps, type FC} from "react";
import {Button} from "flowbite-react";

interface GenericTableButtonProps extends ComponentProps<typeof Button> {
    children: React.ReactNode | string,
    icon: FC<ComponentProps<"svg">>
}

const GenericTableActionButton = ({children, icon: Icon, ...rest}: GenericTableButtonProps) => {
    return (
        <GenericButton
            {...rest}
            color="alternative"
            className="px-3 py-2 group"
        >
            <div className="flex items-center gap-2  group-hover:text-primary-500">
                <div className="text-gray-900 group-hover:text-primary-500 font-medium text-sm">{children}</div>
                <Icon className="text-gray-900 group-hover:text-primary-500"/>
            </div>
        </GenericButton>
    )
}

export default GenericTableActionButton;