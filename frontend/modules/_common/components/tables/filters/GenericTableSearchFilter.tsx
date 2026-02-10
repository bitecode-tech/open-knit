import {Label, TextInput} from "flowbite-react";
import {HiSearch} from "react-icons/hi";
import React, {Dispatch, SetStateAction, useEffect, useState} from "react";
import {useDebounce} from "@common/hooks/useDebounce"; // path as you like

interface GenericTableSearchFilterProps {
    valueState: [string, Dispatch<SetStateAction<string>>];
    debounceMs?: number;
}

export default function GenericTableSearchFilter({valueState, debounceMs = 500}: GenericTableSearchFilterProps) {
    const [value, setValue] = valueState;
    const [localValue, setLocalValue] = useState(value);

    const debouncedValue = useDebounce(localValue, debounceMs);

    // Sync debounced value into parent state
    useEffect(() => {
        setValue(debouncedValue);
    }, [debouncedValue, setValue]);

    return (
        <div>
            <Label className="sr-only">Search</Label>
            <TextInput
                className="w-full lg:w-96"
                icon={HiSearch}
                sizing="sm"
                placeholder="Search"
                type="search"
                value={localValue}
                onChange={e => setLocalValue(e.target.value)}
            />
        </div>
    );
}
