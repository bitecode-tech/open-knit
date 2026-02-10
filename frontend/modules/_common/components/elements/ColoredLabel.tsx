import React, {ReactNode} from "react";
import {twMerge} from "tailwind-merge";

const colors = {
    "green": "bg-green-100 text-green-700",
    "red": "bg-red-100 text-red-700",
    "yellow": "bg-yellow-100 text-yellow-700",
    "gray": "bg-gray-200 text-gray-800",
} as const;

type Color = keyof typeof colors;

interface ColoredLabelProps extends React.ComponentPropsWithoutRef<'span'> {
    color?: Color;
    children: ReactNode;
}

export const ColoredLabel: React.FC<ColoredLabelProps> = ({color = "gray", children, ...restProps}) => {
    return (
        <span
            className={twMerge(`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${colors[color]}`, restProps.className)}
            {...restProps}
        >
            {children}
        </span>
    );
};