import {QuestionCircle} from "flowbite-react-icons/outline";
import {Tooltip} from "flowbite-react";
import React, {ComponentProps, ReactNode, useMemo} from "react";


export interface GenericTooltipProps
    extends Omit<ComponentProps<typeof Tooltip>, "content"> {
    children?: ReactNode;
    content?: string;
}

export function GenericTooltip({children, ...tooltipProps}: GenericTooltipProps) {

    const content = useMemo(() => {
        const content = children ?? tooltipProps.content;

        if (typeof content === "string") {
            return <span className="inline-flex max-w-[400px] whitespace-normal break-words">{content}</span>
        }
        return content;
    }, [tooltipProps.content, children])

    return <Tooltip {...tooltipProps} content={content}>
        <QuestionCircle size={16} className="text-gray-500"/>
    </Tooltip>
}