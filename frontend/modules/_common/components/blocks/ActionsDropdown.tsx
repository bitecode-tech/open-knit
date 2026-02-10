import React from "react";
import {Dropdown, DropdownDivider, DropdownItem} from "flowbite-react";
import {twMerge} from "tailwind-merge";

export interface ActionsDropdownProps {
    children?: React.ReactNode
}

export function ActionsDropdown({children}: ActionsDropdownProps) {
    return (
        <Dropdown
            inline
            label={
                <>
                    <span className="sr-only">Edit user</span>
                    <svg
                        className="cursor-pointer h-5 w-5"
                        aria-hidden
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z"/>
                    </svg>
                </>
            }
            theme={{
                arrowIcon: "hidden",
                floating: {
                    base: twMerge("w-40"),
                },
            }}
        >
            {children ??
                <>
                    <DropdownItem>Show</DropdownItem>
                    <DropdownItem>Edit</DropdownItem>
                    <DropdownDivider/>
                    <DropdownItem>Delete</DropdownItem>
                </>
            }
        </Dropdown>
    );
}