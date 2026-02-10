import React from "react";

export interface CommonAuthLoginCardProps {
    children?: React.ReactNode;
}

export function CommonAuthLoginCard({children}: CommonAuthLoginCardProps) {
    const childrenArray = React.Children.toArray(children);

    const body = childrenArray.find(
        (child): child is React.ReactElement =>
            React.isValidElement(child) && typeof child.type === 'function' && 'displayName' in child.type && child.type.displayName === 'CardBody'
    )

    const footer = childrenArray.find(
        (child): child is React.ReactElement =>
            React.isValidElement(child) && typeof child.type === 'function' && 'displayName' in child.type && child.type.displayName === 'CardFooter'
    )

    return (
        <div className="absolute left-1/2 transform -translate-x-1/2 top-0 z-10 w-dvw md:w-[540px] flex flex-col items-start px-4 md:px-0">
            <div className="rounded-2xl shadow-lg bg-white overflow-hidden w-full">
                <div className="p-6 md:px-16 md:py-8">
                    {body}
                </div>
                {footer && <div className="bg-gray-50 py-6 w-full">
                    {footer}
                </div>}
            </div>
        </div>
    );
}

export const CardBody = ({children}: { children: React.ReactNode }) => <>{children}</>;
CardBody.displayName = "CardBody";

export const CardFooter = ({children}: { children: React.ReactNode }) => <>{children}</>;
CardFooter.displayName = "CardFooter";