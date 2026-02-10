import "@common/components/tables/filters/datepicker.css";
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import CirclePlusIcon from "@common/assets/tables/circle-plus-icon.svg?react"

import React from "react";

const GenericTableMockFilter = () => {
    return (
        <div className="relative bg-gray-50 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-300 inline-flex justify-center items-center cursor-pointer group"
        >
            <div className={`flex items-center pr-2 hover:bg-gray-100 pl-2 rounded-r-lg`}
            >
                <div className="flex items-center px-1 text-sm text-gray-700 font-semibold py-1">
                    Filter by name
                </div>
                <CirclePlusIcon className="size-4 text-gray-500 group-hover:text-green-700 "/>
            </div>
        </div>
    );
}

export default GenericTableMockFilter;

