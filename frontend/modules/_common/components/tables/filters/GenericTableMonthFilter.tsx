import React, {Dispatch, SetStateAction, useEffect, useMemo, useRef, useState} from "react";
import ChevronDownIcon from "@common/assets/tables/chevron-down.svg?react";

interface GenericTableMonthFilterProps {
    monthState: [Date, Dispatch<SetStateAction<Date>>];
    label?: string;
    monthsBack?: number;
}

interface MonthOption {
    key: string;
    label: string;
    value: Date;
}

function formatMonthLabel(date: Date) {
    return new Intl.DateTimeFormat("en-GB", {
        month: "short",
        year: "numeric",
    }).format(date);
}

function buildMonthOptions(monthsBack: number) {
    const options: MonthOption[] = [];
    const currentMonthStart = new Date();
    currentMonthStart.setDate(1);
    currentMonthStart.setHours(0, 0, 0, 0);

    for (let index = 0; index < monthsBack; index += 1) {
        const optionDate = new Date(
            currentMonthStart.getFullYear(),
            currentMonthStart.getMonth() - index,
            1
        );

        options.push({
            key: `${optionDate.getFullYear()}-${optionDate.getMonth() + 1}`,
            label: formatMonthLabel(optionDate),
            value: optionDate,
        });
    }

    return options;
}

const GenericTableMonthFilter = ({
    monthState,
    label = "Date",
    monthsBack = 24,
}: GenericTableMonthFilterProps) => {
    const [selectedMonth, setSelectedMonth] = monthState;
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement | null>(null);

    const monthOptions = useMemo(() => buildMonthOptions(monthsBack), [monthsBack]);

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
        <div ref={containerRef} className="relative inline-flex">
            <button
                type="button"
                className="inline-flex cursor-pointer items-center overflow-hidden rounded-lg bg-gray-50 outline outline-1 outline-offset-[-1px] outline-gray-300"
                onClick={() => setIsOpen((currentValue) => !currentValue)}
            >
                <div className="flex items-center gap-1 px-2 py-1 text-sm font-medium text-gray-500">
                    {label}
                </div>
                <div className="h-full w-px bg-gray-300" />
                <div className="flex items-center gap-2 px-2 py-1 text-sm font-semibold text-primary-500">
                    <span>{formatMonthLabel(selectedMonth)}</span>
                    <ChevronDownIcon className="size-4 text-gray-500" />
                </div>
            </button>

            <div className={`absolute left-0 top-[calc(100%+8px)] z-50 w-[220px] overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg ${!isOpen ? "hidden" : ""}`}>
                <div className="max-h-80 overflow-y-auto py-2">
                    {monthOptions.map((monthOption) => {
                        const isActive = monthOption.value.getFullYear() === selectedMonth.getFullYear()
                            && monthOption.value.getMonth() === selectedMonth.getMonth();

                        return (
                            <button
                                key={monthOption.key}
                                type="button"
                                className={`flex w-full cursor-pointer items-center px-3 py-2 text-left text-sm ${
                                    isActive ? "bg-primary-50 font-semibold text-primary-700" : "text-gray-700 hover:bg-gray-50"
                                }`}
                                onClick={() => {
                                    setSelectedMonth(monthOption.value);
                                    setIsOpen(false);
                                }}
                            >
                                {monthOption.label}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default GenericTableMonthFilter;
