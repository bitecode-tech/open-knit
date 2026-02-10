import {Link, LinkProps} from "react-router-dom";
import {twMerge} from "tailwind-merge";
import {ReactNode} from "react";

interface GenericLinkProps extends LinkProps {
    children: ReactNode
}

export default function GenericLink({children, ...props}: GenericLinkProps) {
    return (<Link
        {...props}
        className={twMerge("font-medium text-primary-500 hover:text-gray-900 text-sm", props.className)}
    >
        {children}
    </Link>)
}