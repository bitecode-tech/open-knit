import React from "react";
import {twMerge} from "tailwind-merge";

const variants = {
    "default": {amount: "text-sm font-medium text-gray-900", currency: "text-sm font-medium text-gray-500"},
    "mobile-bold": {amount: "text-sm font-semibold text-gray-900", currency: "text-sm font-semibold text-gray-900"},
    "mobile": {amount: "text-xs font-medium text-gray-700", currency: "text-xs font-medium text-gray-700"},
    "custom": {amount: "", currency: ""}
} as const;

type Variant = keyof typeof variants

interface GenericTableCurrencyCellCommonProps {
    amount: number
    currency: string
    className?: string
}

type GenericTableCurrencyCellProps = GenericTableCurrencyCellCommonProps & {
    variant?: Exclude<Variant, "custom">
    customVariant?: never
} | GenericTableCurrencyCellCommonProps & {
    variant: "custom"
    customVariant: {
        amount: string
        currency: string
    }
}

const GenericTableCurrencyCell = ({amount, currency, className, variant = "default", customVariant}: GenericTableCurrencyCellProps) => {
    let styles;
    if (variant !== "custom") {
        styles = variants[variant];
    } else {
        styles = customVariant;
    }

    return (
        <div className={twMerge("flex items-center", className)}>
            <span className={styles!.amount}>{amount.toFixed(2)}</span>
            &nbsp;
            <span className={styles!.currency}>{currency?.toUpperCase()}</span>
        </div>
    )
}

export default GenericTableCurrencyCell;