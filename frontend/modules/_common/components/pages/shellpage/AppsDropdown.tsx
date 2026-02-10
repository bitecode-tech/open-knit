import {
    HiOutlineArchive,
    HiOutlineCog,
    HiOutlineCurrencyDollar,
    HiOutlineInbox,
    HiOutlineLogout,
    HiOutlineShoppingBag,
    HiOutlineTicket,
    HiOutlineUserCircle,
    HiOutlineUsers,
    HiOutlineViewGrid
} from "react-icons/hi";
import {Dropdown} from "flowbite-react";
import React from "react";

export function AppsDropdown() {
    return (
        <Dropdown
            className="rounded-xl"
            arrowIcon={false}
            inline
            label={
                <span
                    className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 cursor-pointer">
                      <span className="sr-only">Apps</span>
                      <HiOutlineViewGrid className="h-6 w-6"/>
                    </span>
            }
            theme={{content: "py-0"}}
        >
            <div
                className="block rounded-t-xl border-b border-gray-100 bg-gray-50 px-4 py-2 text-center text-base font-medium text-gray-700">
                Apps
            </div>
            <div className="grid grid-cols-3 gap-4 p-4">
                <a
                    href="#"
                    className="block rounded-lg p-4 text-center hover:bg-gray-100"
                >
                    <HiOutlineShoppingBag className="mx-auto mb-1 h-7 w-7 text-gray-500"/>
                    <div className="text-sm font-medium text-gray-900">
                        Sales
                    </div>
                </a>
                <a
                    href="#"
                    className="block rounded-lg p-4 text-center hover:bg-gray-100"
                >
                    <HiOutlineUsers className="mx-auto mb-1 h-7 w-7 text-gray-500"/>
                    <div className="text-sm font-medium text-gray-900">
                        Users
                    </div>
                </a>
                <a
                    href="#"
                    className="block rounded-lg p-4 text-center hover:bg-gray-100"
                >
                    <HiOutlineInbox className="mx-auto mb-1 h-7 w-7 text-gray-500"/>
                    <div className="text-sm font-medium text-gray-900">
                        Inbox
                    </div>
                </a>
                <a
                    href="#"
                    className="block rounded-lg p-4 text-center hover:bg-gray-100"
                >
                    <HiOutlineUserCircle className="mx-auto mb-1 h-7 w-7 text-gray-500"/>
                    <div className="text-sm font-medium text-gray-900">
                        Profile
                    </div>
                </a>
                <a
                    href="#"
                    className="block rounded-lg p-4 text-center hover:bg-gray-100"
                >
                    <HiOutlineCog className="mx-auto mb-1 h-7 w-7 text-gray-500"/>
                    <div className="text-sm font-medium text-gray-900">
                        Settings
                    </div>
                </a>
                <a
                    href="#"
                    className="block rounded-lg p-4 text-center hover:bg-gray-100"
                >
                    <HiOutlineArchive className="mx-auto mb-1 h-7 w-7 text-gray-500"/>
                    <div className="text-sm font-medium text-gray-900">
                        Products
                    </div>
                </a>
                <a
                    href="#"
                    className="block rounded-lg p-4 text-center hover:bg-gray-100"
                >
                    <HiOutlineCurrencyDollar className="mx-auto mb-1 h-7 w-7 text-gray-500"/>
                    <div className="text-sm font-medium text-gray-900">
                        Pricing
                    </div>
                </a>
                <a
                    href="#"
                    className="block rounded-lg p-4 text-center hover:bg-gray-100"
                >
                    <HiOutlineTicket className="mx-auto mb-1 h-7 w-7 text-gray-500"/>
                    <div className="text-sm font-medium text-gray-900">
                        Billing
                    </div>
                </a>
                <a
                    href="#"
                    className="block rounded-lg p-4 text-center hover:bg-gray-100"
                >
                    <HiOutlineLogout className="mx-auto mb-1 h-7 w-7 text-gray-500"/>
                    <div className="text-sm font-medium text-gray-900">
                        Logout
                    </div>
                </a>
            </div>
        </Dropdown>
    )
}