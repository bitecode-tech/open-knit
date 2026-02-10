import React from "react";
import clsx from "clsx";

type RibbonUnderlineProps = {
    as?: keyof React.JSX.IntrinsicElements;
    className?: string;
    color?: string;
    thicknessEm?: number;
    offsetEm?: number;
    children: React.ReactNode;
};

export default function RibbonUnderline({
                                            as: Tag = "span",
                                            className,
                                            color = "#16EA6A",
                                            thicknessEm = 0.22,
                                            offsetEm = 0.06,
                                            children,
                                        }: RibbonUnderlineProps) {
    return (
        <Tag className={clsx("relative", className)}>
            <span className="relative z-10">{children}</span>
            <div className="pointer-events-none absolute inset-x-0"
                 style={{bottom: `${offsetEm}em`, height: `${thicknessEm}em`}}>
                <div className="relative h-full mx-[0.28em]" style={{background: color}}>
                    <div className="absolute top-0 -left-[0.28em] h-full w-[0.56em]"
                         style={{background: color, clipPath: "polygon(0% 100%, 100% 0%, 100% 100%)"}}/>
                    <div className="absolute top-0 -right-[0.28em] h-full w-[0.56em]"
                         style={{background: color, clipPath: "polygon(0% 0%, 100% 0%, 0% 100%)"}}/>
                </div>
            </div>
        </Tag>
    );
}
