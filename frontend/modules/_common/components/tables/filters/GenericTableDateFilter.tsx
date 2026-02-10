import "@common/components/tables/filters/datepicker.css";
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

import React, {Dispatch, SetStateAction, useState} from "react";
import CirclePlusIcon from "@common/assets/tables/circle-plus-icon.svg?react"
import ChevronDownIcon from "@common/assets/tables/chevron-down.svg?react"
import CircleXIcon from "@common/assets/tables/circle-x.svg?react"
import {DateRangePicker} from 'react-date-range';
import {GenericButton} from "@common/components/blocks/GenericButton.tsx";

export interface GenericTableDateFilterProps {
    startDateState: [Date | null, Dispatch<SetStateAction<Date | null>>],
    endDateState: [Date | null, Dispatch<SetStateAction<Date | null>>]
}

const GenericTableDateFilter = ({startDateState, endDateState}: GenericTableDateFilterProps) => {
    const [startDate, setStartDate] = startDateState;
    const [endDate, setEndDate] = endDateState;
    const [showDatePicker, setShowDatePicker] = useState(false)
    const showDates = !!startDate || !!endDate

    function formatDate(date: Date) {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        return `${day}.${month}`;
    }

    const selectionRange = {
        startDate: startDate ?? new Date(),
        endDate: endDate ?? new Date(),
        key: 'selection',
    }

    const handleSelect = (ranges: any) => {
        const range = ranges.selection
        setStartDate(range.startDate)
        setEndDate(range.endDate)
    }

    const resetDates = () => {
        setStartDate(null);
        setEndDate(null);
    }

    return (
        <div className="relative bg-gray-50 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-300 inline-flex justify-center items-center cursor-pointer"
        >
            {showDates ? (
                <>
                    <div className="flex gap-1 hover:bg-gray-100 pl-2 rounded-l-lg pr-2 group" onClick={() => resetDates()}>
                        <div className="flex items-center py-1">
                            <CircleXIcon className="size-4 text-gray-500 group-hover:text-red-700"/>
                        </div>
                        <div className="flex items-center text-sm text-gray-500 font-medium py-1">
                            Date
                        </div>
                    </div>
                    <div className="w-px bg-gray-300 self-stretch py-1"/>
                    <div className={`flex items-center pr-2 hover:bg-gray-100 pl-2 rounded-r-lg ${showDatePicker && "bg-gray-100"}`}
                         onClick={() => setShowDatePicker(v => !v)}
                    >
                        <div className="flex items-center px-1 text-sm text-primary-500 font-semibold py-1">
                            {`${startDate && formatDate(startDate)} - ${endDate && formatDate(endDate)}`}
                        </div>
                        <ChevronDownIcon className="text-gray-500"/>
                    </div>
                </>
            ) : (
                <div className={`flex gap-1 px-2 hover:bg-gray-100 ${showDatePicker && "bg-gray-100"} rounded-l-lg rounded-r-lg group`}
                     onClick={() => setShowDatePicker(true)}
                >
                    <div className="flex items-center py-1.5">
                        <CirclePlusIcon className="size-4 text-gray-500 group-hover:text-green-700"/>
                    </div>
                    <div className="flex items-center text-gray-500 text-sm font-medium leading-tight py-1">
                        Select date
                    </div>
                </div>
            )}
            <div className={`absolute translate-y-[55%] border border-gray-200 rounded-md overflow-hidden z-50 flex flex-col ${!showDatePicker && "hidden"} bg-white`}>
                <DateRangePicker
                    ranges={[selectionRange]}
                    showMonthAndYearPickers={false}
                    showDateDisplay={false}
                    onChange={handleSelect}
                />
                <div className="flex gap-x-1 mb-[10px]">
                    <GenericButton color="alternative" className="w-full ml-5" onClick={() => {
                        resetDates();
                        setShowDatePicker(false)
                    }}>Clear</GenericButton>
                    <GenericButton className="w-full mr-[0.8333em]" onClick={() => setShowDatePicker(false)}>Ok</GenericButton>
                </div>
            </div>
        </div>
    );
}

export default GenericTableDateFilter;

