import React from "react";

const GenericTableClearFilters = ({onClick}: { onClick: () => void }) => {
    return (
        <div className="px-2 py-1 text-primary-500 text-sm font-semibold cursor-pointer hover:text-gray-900"
             onClick={onClick}>
            Clear filters
        </div>
    );
}

export default GenericTableClearFilters;
