"use client";

import {Drawer} from "flowbite-react";
import React, {Dispatch, SetStateAction, useCallback, useEffect, useState} from "react";
import {Breadcrumbs} from "@common/components/blocks/Breadcrumbs.tsx";
import ShellNavbar, {NAVBAR_ID} from "@common/components/pages/shellpage/ShellNavbar.tsx";
import {twMerge} from "tailwind-merge";
import {ToastManager} from "@common/components/blocks/ToastManager.tsx";
import {Close} from "flowbite-react-icons/outline";

interface ApplicationShellProps {
    children: React.ReactNode,
    routes: React.ReactNode,
    isSidebarOpen: boolean,
    setSidebarOpen: Dispatch<SetStateAction<boolean>>
}

export default function ApplicationShell({children, routes, isSidebarOpen, setSidebarOpen}: ApplicationShellProps) {
    const [isMobile, setMobile] = useState(false);
    const maxHeight = useNavbarAdjustedHeight(NAVBAR_ID);

    function hideSidebarOnResize() {
        const isMobileNow = window.innerWidth < 768;
        setMobile(isMobileNow);
        setSidebarOpen(!isMobileNow);
    }

    useEffect(() => {
        hideSidebarOnResize();

        window.addEventListener("resize", hideSidebarOnResize);

        return () => window.removeEventListener("resize", hideSidebarOnResize);
    }, []);

    return (
        <div className="relative h-dvh md:grid md:grid-cols-[16rem_1fr] md:grid-rows-[auto_1fr]">
            <div className="md:col-start-1 md:row-start-1 md:row-span-2 md:border-r md:border-gray-100">
                <Drawer
                    backdrop={isMobile}
                    open={isSidebarOpen}
                    onClose={() => isMobile && setSidebarOpen(false)}
                    className={twMerge(
                        "hide-scrollbar p-3",
                        isMobile ? "w-[90vw] max-w-[300px] h-dvh overflow-y-auto" : "static w-full h-full"
                    )}
                    style={isMobile ? {height: "100dvh", maxHeight: "100dvh"} : {maxHeight}}
                >
                    <div className="flex items-center justify-between">
                        <img
                            className="px-2 py-1.5 h-8"
                            alt="Bitecode logo"
                            src="/Logo.svg"
                        />
                        <Close onClick={() => setSidebarOpen(false)} className="md:hidden text-gray-500 hover:bg-gray-200 rounded-md cursor-pointer size-6"/>
                    </div>
                    <hr className="md:hidden border-gray-200 mt-2"/>
                    {children}
                </Drawer>
            </div>

            <div className="flex flex-col flex-1 md:col-start-2 md:row-span-2">
                <div className="w-full max-w-[1512px] 2xl:max-w-[1700px] mx-auto">
                    <ShellNavbar setSidebarOpen={setSidebarOpen} isSidebarOpen={isSidebarOpen}/>
                    <hr className="border-gray-200 mx-4"/>
                </div>

                <div className="flex flex-col flex-1 max-w-[1256px] 2xl:max-w-[1700px] pt-4 px-4 space-y-4 mx-auto w-full min-h-0 overflow-y-auto">
                    <Breadcrumbs/>
                    {routes}
                </div>
            </div>

            <ToastManager/>
        </div>
    );
}

export function useNavbarAdjustedHeight(navbarId: string) {
    const [maxHeight, setMaxHeight] = useState("100dvh");

    const calculate = useCallback(() => {
        const navbar = document.getElementById(navbarId);
        const navbarHeight = navbar?.offsetHeight ?? 0;
        setMaxHeight(`calc(100% - ${navbarHeight}px)`);
    }, [navbarId]);

    useEffect(() => {
        calculate();

        const resizeObserver = new ResizeObserver(() => calculate());
        const navbar = document.getElementById(navbarId);
        if (navbar) {
            resizeObserver.observe(navbar);
        }

        window.addEventListener("resize", calculate);

        return () => {
            resizeObserver.disconnect();
            window.removeEventListener("resize", calculate);
        };
    }, [calculate, navbarId]);

    return maxHeight;
}
