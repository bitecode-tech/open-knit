import React, {useEffect, useMemo, useRef, useState} from "react";
import ChevronDownIcon from "@common/assets/tables/chevron-down.svg?react";
import {twMerge} from "tailwind-merge";

export interface GenericDropdownSelectorOption<T extends string | number> {
    value: T;
    label: string;
}

interface GenericDropdownSelectorProps<T extends string | number> {
    value: T;
    options: GenericDropdownSelectorOption<T>[];
    onChange: (value: T) => void;
    label?: string;
    className?: string;
    menuClassName?: string;
    disabled?: boolean;
    isLoading?: boolean;
}

export function GenericDropdownSelector<T extends string | number>({
    value,
    options,
    onChange,
    label,
    className,
    menuClassName,
    disabled = false,
    isLoading = false,
}: GenericDropdownSelectorProps<T>) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement | null>(null);

    const selectedOption = useMemo(
        () => options.find((option) => option.value === value) ?? options[0],
        [options, value]
    );

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const handlePointerDown = (event: MouseEvent) => {
            if (!containerRef.current?.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handlePointerDown);

        return () => {
            document.removeEventListener("mousedown", handlePointerDown);
        };
    }, [isOpen]);

    return (
        <div ref={containerRef} className={twMerge("relative inline-flex", className)}>
            <button
                type="button"
                className={twMerge(
                    "inline-flex h-9 items-center overflow-hidden rounded-lg bg-gray-50 outline outline-1 outline-offset-[-1px] outline-gray-300",
                    disabled ? "cursor-not-allowed opacity-70" : "cursor-pointer"
                )}
                disabled={disabled}
                onClick={() => {
                    if (disabled) {
                        return;
                    }

                    setIsOpen((currentValue) => !currentValue);
                }}
            >
                {label && (
                    <>
                        <div className="flex items-center gap-1 px-2 py-1 text-sm font-medium text-gray-500">
                            {label}
                        </div>
                        <div className="h-full w-px bg-gray-300"/>
                    </>
                )}
                <div className="flex items-center gap-2 px-3 py-1 text-sm font-semibold text-primary-500">
                    <span>{selectedOption?.label ?? value}</span>
                    {isLoading ? (
                        <span className="size-4 animate-spin rounded-full border-2 border-primary-200 border-t-primary-500"/>
                    ) : (
                        <ChevronDownIcon className="size-4 text-gray-500"/>
                    )}
                </div>
            </button>

            <div className={twMerge(`absolute left-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg ${!isOpen ? "hidden" : ""}`, menuClassName)}>
                <div className="max-h-80 overflow-y-auto py-2">
                    {options.map((option) => {
                        const isActive = option.value === value;

                        return (
                            <button
                                key={String(option.value)}
                                type="button"
                                className={`flex w-full cursor-pointer items-center px-3 py-2 text-left text-sm ${
                                    isActive ? "bg-primary-50 font-semibold text-primary-700" : "text-gray-700 hover:bg-gray-50"
                                }`}
                                disabled={disabled}
                                onClick={() => {
                                    if (disabled) {
                                        return;
                                    }

                                    onChange(option.value);
                                    setIsOpen(false);
                                }}
                            >
                                {option.label}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
