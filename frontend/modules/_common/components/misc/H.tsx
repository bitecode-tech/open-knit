import {JSX} from "react";

const mapping = {
    "h1": "text-5xl font-extrabold",
    "h2": "text-4xl font-bold",
    "h3": "text-3xl font-bold",
    "h4": "text-2xl font-bold",
    "h5": "text-xl font-bold",
}

type HeadingLevel = keyof typeof mapping;

export function H({
                      children,
                      level = "h5",
                      className = "",
                  }: {
    children: JSX.Element | string;
    level?: HeadingLevel;
    className?: string;
}) {
    const Tag = level;
    const baseClass = mapping[level];
    return (
        <Tag className={`${baseClass} text-gray-900 ${className}`}>
            {children}
        </Tag>
    );
}
