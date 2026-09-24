import React, {ComponentProps, FC} from "react";
import {Tooltip} from "flowbite-react";
import {twMerge} from "tailwind-merge";

type GenericStateBadgeTone = "success" | "warning" | "danger" | "neutral";

interface GenericStateBadgeProps {
    label: string;
    tone?: GenericStateBadgeTone;
    tooltip?: string;
    className?: string;
    showDot?: boolean;
    icon?: FC<ComponentProps<"svg">>;
    iconClassName?: string;
}

const toneClassNames: Record<GenericStateBadgeTone, string> = {
    success: "border-emerald-200 bg-emerald-50 text-emerald-700",
    warning: "border-amber-200 bg-amber-50 text-amber-700",
    danger: "border-rose-200 bg-rose-50 text-rose-600",
    neutral: "border-gray-200 bg-gray-100 text-gray-600",
};

export function GenericStateBadge({
    label,
    tone = "neutral",
    tooltip,
    className,
    showDot = false,
    icon: Icon,
    iconClassName,
}: GenericStateBadgeProps) {
    const badge = (
        <span
            className={twMerge(
                "inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border px-2.5 py-[2px] text-[12px] font-medium uppercase tracking-wide",
                toneClassNames[tone],
                tooltip ? "cursor-help" : "",
                className,
            )}
        >
            {Icon && (
                <span className="flex size-4 items-center justify-center rounded-full border border-current/20 bg-white/70">
                    <Icon className={twMerge("size-2.5", iconClassName)}/>
                </span>
            )}
            {showDot && (
                <span
                    className={twMerge(
                        "size-1.5 rounded-full",
                        tone === "warning" ? "bg-amber-500" : tone === "success" ? "bg-emerald-500" : tone === "danger" ? "bg-rose-500" : "bg-gray-500",
                    )}
                />
            )}
            {label}
        </span>
    );

    if (!tooltip) {
        return badge;
    }

    return (
        <Tooltip content={tooltip}>
            {badge}
        </Tooltip>
    );
}
