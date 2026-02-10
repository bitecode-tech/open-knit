import React from "react";
import {twMerge} from "tailwind-merge";
import {NetVolumeChart} from "@app/components/admin/dashboard/NetVolumeChart.tsx";
import {ChevronDownIcon} from "flowbite-react";
import {format} from "date-fns";
import GenericLink from "@common/components/elements/GenericLink.tsx";
import {SlotAnimatedNumber} from "@common/components/misc/SlotAnimatedNumber.tsx";

export function DashboardPage() {
    const StatisticsTile = ({text = "", amount = 0, precision = 0, className}: { text?: string, amount?: number, precision?: number, className?: string }) => {
        return (
            <div className={twMerge("flex flex-col pt-4 pb-8 pl-4 gap-2 border-t border-r border-gray-200", className)}>
                <div className="text-gray-700 text-sm font-medium">{text}</div>
                <SlotAnimatedNumber value={amount} duration={1000} precision={precision}/>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-y-3 md:gap-y-4">
            <>
                <h5 className="text-gray-900 font-semibold text-xl">Dashboard</h5>
                <div className="grid grid-cols-2 md:grid-cols-4 md:mb-4 w-full">
                    <StatisticsTile text="Customers" amount={1530} className="pl-0"/>
                    <StatisticsTile text="Merchants" amount={24} className="border-r-0 md:border-r-1"/>
                    <StatisticsTile text="Transactions" amount={7231} className="max-md:pl-0"/>
                    <StatisticsTile text="Products" amount={14} className="border-r-0"/>
                </div>
            </>

            <>
                <h5 className="text-gray-700 text-3xl font-bold leading-10">Today</h5>
                <div className="flex flex-col md:grid md:grid-cols-[60%_40%] border-t border-gray-200 w-full">
                    <div className="flex flex-col gap-2 w-full mt-4">
                        <div>
                            <span className="text-gray-700 text-sm font-medium mr-1">Net volume</span>
                            <ChevronDownIcon className="inline"/>
                        </div>
                        <SlotAnimatedNumber value={1435.32} duration={1000} numberFormat="usd"/>
                        <p className="text-gray-700 text-xs">{format(new Date(), "HH:mm")}</p>
                        <NetVolumeChart duration={1000}/>
                    </div>
                    <div className="grid grid-rows-2 w-full">
                        <div className="flex flex-col gap-2 md:pl-5 pt-4">
                            <div className="flex items-center justify-between">
                                <span className="text-gray-700 text-sm font-medium">USD total balance</span>
                                <GenericLink to="">View</GenericLink>
                            </div>
                            <SlotAnimatedNumber value={3582.31} duration={1000} numberFormat="usd"/>
                        </div>

                        <div className="flex flex-col pt-5 pb-4 md:pl-5 gap-2 border-t border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="text-gray-700 text-sm font-medium">Payouts</div>
                                <GenericLink to="">View</GenericLink>
                            </div>
                            <span className="text-gray-900 text-xl">-</span>
                        </div>

                    </div>
                </div>
            </>
        </div>
    )
}
