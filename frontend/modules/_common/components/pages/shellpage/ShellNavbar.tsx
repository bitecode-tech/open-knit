import {HiMenuAlt1, HiSearch} from "react-icons/hi";
import {Label, Navbar, TextInput} from "flowbite-react";
import {NotificationsDropdown} from "@common/components/pages/shellpage/NotificationsDropdown.tsx";
import {AppsDropdown} from "@common/components/pages/shellpage/AppsDropdown.tsx";
import {ProfileCircleDropdown} from "@common/components/pages/shellpage/ProfileCircleDropdown.tsx";
import React, {ComponentProps, Dispatch, SetStateAction, useState} from "react";
import {twMerge} from "tailwind-merge";

interface NavbarProps extends ComponentProps<typeof Navbar> {
    isSidebarOpen: boolean,
    setSidebarOpen: Dispatch<SetStateAction<boolean>>;
}

export const NAVBAR_ID = "__app-navbar__";

export default function ShellNavbar({setSidebarOpen, isSidebarOpen, ...rest}: NavbarProps) {
    const [searchValue, setSearchValue] = useState("");

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
    };

    return (
        <>
            <Navbar
                id={NAVBAR_ID}
                fluid
                className={twMerge("w-full bg-white p-0 sm:p-0", rest.className)}
            >
                <div className="w-full py-3 px-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <button
                                onClick={() => setSidebarOpen(!isSidebarOpen)}
                                className="mr-3 cursor-pointer rounded p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 md:hidden"
                            >
                                <span className="sr-only">Toggle sidebar</span>
                                <div className="lg:hidden">
                                    <HiMenuAlt1 className="h-6 w-6"/>
                                </div>
                                <div className="hidden lg:block">
                                    <HiMenuAlt1 className="h-6 w-6"/>
                                </div>
                            </button>
                            <form className="hidden lg:block" onSubmit={handleSearchSubmit}>
                                <Label htmlFor="search" className="sr-only">
                                    Search
                                </Label>
                                <TextInput
                                    className="w-full lg:w-96"
                                    icon={HiSearch}
                                    id="search"
                                    name="search"
                                    required
                                    sizing="sm"
                                    placeholder="Search"
                                    type="search"
                                    value={searchValue}
                                    onChange={e => setSearchValue(e.target.value)}
                                />
                            </form>
                        </div>
                        <div className="flex items-center lg:gap-3">
                            <div className="flex items-center cursor-pointer">
                                <NotificationsDropdown/>
                                <AppsDropdown/>
                                <div className="ml-3 flex items-center">
                                    <ProfileCircleDropdown/>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Navbar>
        </>
    )
}