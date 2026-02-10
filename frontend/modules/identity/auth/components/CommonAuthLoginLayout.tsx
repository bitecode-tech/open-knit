import React, {ReactNode} from "react";
import {ToastManager} from "@common/components/blocks/ToastManager.tsx";

export function CommonAuthLoginLayout({children}: { children: ReactNode }) {
    const border = "border-dashed border border-gray-200 border-t-0 border-r-0 border-l-0";
    return (
        <div className="grid grid-cols-6 grid-rows-[72px_1fr] md:grid-rows-[85px_1fr] h-dvh">
            {/* Row 1 */}
            <div className={`col-span-2 ${border}`}/>
            <div className={`flex items-center justify-center col-span-2 ${border}`}>
                <img src="/Logo.svg"/>
            </div>
            <div className={`col-span-2 ${border}`}/>

            {/* Row 2 */}
            <div className="col-span-2"/>
            <section className={`col-span-2 self-start h-full relative`}>
                <div className={`absolute md:top-10 left-1/2`}>
                    {children}
                </div>
            </section>
            <div className="col-span-2"/>

            <ToastManager/>
        </div>
    );
}