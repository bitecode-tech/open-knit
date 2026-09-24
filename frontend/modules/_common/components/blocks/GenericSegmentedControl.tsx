import React from "react";

export interface GenericSegmentedControlOption<T extends string> {
    value: T;
    label: string;
}

interface GenericSegmentedControlProps<T extends string> {
    value: T;
    options: GenericSegmentedControlOption<T>[];
    onChange: (value: T) => void;
    className?: string;
}

export function GenericSegmentedControl<T extends string>({
    value,
    options,
    onChange,
    className = "",
}: GenericSegmentedControlProps<T>) {
    return (
        <div className={`inline-flex rounded-[12px] border border-gray-200 bg-gray-50 p-1 ${className}`.trim()}>
            {options.map((option) => {
                const isActive = option.value === value;

                return (
                    <button
                        key={option.value}
                        type="button"
                        className={`cursor-pointer rounded-[10px] px-4 py-2 text-[14px] font-semibold transition ${
                            isActive ? "bg-white text-primary-600 shadow-sm" : "text-gray-500"
                        }`}
                        onClick={() => onChange(option.value)}
                    >
                        {option.label}
                    </button>
                );
            })}
        </div>
    );
}
