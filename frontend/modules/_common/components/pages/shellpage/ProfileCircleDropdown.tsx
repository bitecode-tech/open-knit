import {Avatar, Dropdown, DropdownDivider, DropdownHeader, DropdownItem} from "flowbite-react";
import React, {useMemo} from "react";
import {useAuth} from "@identity/auth/contexts/AuthContext.tsx";
import {Heart, RectangleList} from "flowbite-react-icons/outline";

const TAILWIND_COLOR_HEX: string[] = [
    '#EF4444', // red-500
    '#F97316', // orange-500
    '#F59E0B', // amber-500
    '#EAB308', // yellow-500
    '#84CC16', // lime-500
    '#22C55E', // green-500
    '#10B981', // emerald-500
    '#14B8A6', // teal-500
    '#06B6D4', // cyan-500
    '#0EA5E9', // sky-500
    '#3B82F6', // blue-500
    '#6366F1', // indigo-500
    '#8B5CF6', // violet-500
    '#A855F7', // purple-500
    '#D946EF', // fuchsia-500
    '#EC4899', // pink-500
    '#F43F5E', // rose-500
    '#FB7185', // pink-400
    '#F87171', // red-400
    '#FBBF24', // amber-400
];

function getHexColorForEmail(email: string): string {
    if (!email) return TAILWIND_COLOR_HEX[0];
    const char = email.trim().charAt(0).toLowerCase();
    const code = char.charCodeAt(0);
    if (code >= 97 && code <= 122) {
        return TAILWIND_COLOR_HEX[(code - 97) % TAILWIND_COLOR_HEX.length];
    }
    return TAILWIND_COLOR_HEX[0];
}

function createAvatarDataUri(email: string): string {
    const bgColor = getHexColorForEmail(email);
    const initialChar = email.trim().charAt(0).toUpperCase().match(/[A-Z]/)
        ? email.trim().charAt(0).toUpperCase()
        : '?';

    const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
            <rect width="100" height="100" fill="${bgColor}" />
            <text x="50" y="50" dy=".35em" text-anchor="middle" font-family="sans-serif" font-size="50" fill="white">${initialChar}</text>
        </svg>`;

    const encoded = encodeURIComponent(svg)
        .replace(/'/g, '%27')
        .replace(/"/g, '%22');

    return `data:image/svg+xml,${encoded}`;
}


export function ProfileCircleDropdown() {
    const {logout, user} = useAuth();

    const dataUri = useMemo(() => createAvatarDataUri(user!.email), [user!.email]);

    return (
        <Dropdown
            className="w-56 rounded-lg"
            arrowIcon={false}
            inline
            label={
                <span>
                        <span className="sr-only">User menu</span>
                        <Avatar
                            placeholderInitials={user!.email.slice(0, 1).toUpperCase()}
                            rounded
                            color="success"
                            img={dataUri}
                            className="cursor-pointer"
                            size="sm"
                        />
                      </span>
            }
        >
            <DropdownHeader className="px-4 py-3">
                <span className="block w-full text-sm font-bold truncate">
                {user?.email}
                </span>
            </DropdownHeader>
            <DropdownItem className="hover:bg-gray-100">
                My profile
            </DropdownItem>
            <DropdownItem className="hover:bg-gray-100">
                Account settings
            </DropdownItem>
            <DropdownDivider/>
            <DropdownItem className="flex items-center px-4 py-2 text-sm hover:bg-gray-100">
                <Heart className="mr-2 h-5 w-5 text-gray-400"/>
                My likes
            </DropdownItem>
            <DropdownItem className="flex items-center px-4 py-2 text-sm hover:bg-gray-100">
                <RectangleList className="mr-2 h-5 w-5 text-gray-400"/>
                Collections
            </DropdownItem>
            <DropdownItem
                className="flex items-center justify-between px-4 py-2 text-sm hover:bg-gray-100">
                      <span className="flex items-center">
                        <svg
                            aria-hidden
                            className="mr-2 h-5 w-5 text-primary-600"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                              fill-rule="evenodd"
                              d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z"
                              clip-rule="evenodd"
                          ></path>
                        </svg>
                        Pro version
                      </span>
                <svg
                    aria-hidden
                    className="h-5 w-5 text-gray-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        fill-rule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clip-rule="evenodd"
                    ></path>
                </svg>
            </DropdownItem>
            <DropdownDivider/>
            <DropdownItem onClick={() => logout()} className="hover:bg-gray-100">
                Sign out
            </DropdownItem>
        </Dropdown>
    )
}