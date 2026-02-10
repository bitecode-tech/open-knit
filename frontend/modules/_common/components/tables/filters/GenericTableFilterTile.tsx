import React, {Dispatch, SetStateAction} from "react";

export interface GenericTableFilterTileProps<T> extends React.HTMLAttributes<HTMLDivElement> {
    text: string,
    amount?: string | number,
    filterKey: T,
    activeFilterState: [T, Dispatch<SetStateAction<T>>]
    isSelected?: boolean
}

const GenericTableFilterTile = <T, >({text, amount = 0, filterKey, activeFilterState, ...rest}: GenericTableFilterTileProps<T>) => {
    const [activeFilter, setActiveFilter] = activeFilterState;
    const isSelected = activeFilter === filterKey;
    return (
        <div
            className={`flex flex-col justify-center items-start p-2.5 rounded-lg gap-2 w-[235px] h-[66px] cursor-pointer ${isSelected ? "outline outline-2 outline-offset-[-2px] outline-primary-500" : "outline outline-gray-200 hover:outline-primary-500"}`}
            onClick={() => setActiveFilter(filterKey)}
            {...rest}>
            <div className={`self-stretch justify-center text-sm ${isSelected ? "text-primary-500 font-semibold" : "text-gray-500"} leading-tight`}>{text}</div>
            <div className={`justify-center ${isSelected ? "text-primary-500" : "text-gray-900"} text-sm font-semibold leading-tight`}>{amount}</div>
        </div>
    );
}

export default GenericTableFilterTile;