import {MobileRowTemplateConfig} from "@common/components/tables/types/MobileRowTemplateConfig.ts";
import {flexRender, Row} from "@tanstack/react-table";
import React from "react";

export default function DefaultMobileRowTemplateRenderer({
                                                             config,
                                                             row,
                                                             rowIdx
                                                         }: {
    config?: MobileRowTemplateConfig["default"];
    row: Row<unknown>;
    rowIdx: number
}) {
    if (!config) {
        return null;
    }

    const cellMap = Object.fromEntries(
        row.getVisibleCells().map((cell) => [cell.column.id, cell])
    );

    const RenderValue = ({headerId}: { headerId?: string }) => {
        if (!headerId) {
            return null;
        }
        const cell = cellMap[headerId];
        if (!cell) {
            return null;
        }
        return flexRender(cell.column.columnDef.cell, cell.getContext());
    };

    return (
        <div className={`flex flex-col gap-3 rounded-lg pt-2 pb-1 ${rowIdx === 0 && "border-t border-t-gray-200 border-solid md:hidden"}`}>
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    <RenderValue headerId="selection"/>
                    <RenderValue headerId={config.header.headerColumnId}/>
                </div>

                <div className="flex items-center gap-2">
                    <RenderValue headerId={config.header.rightColumnId}/>
                    <RenderValue headerId="actions"/>
                </div>
            </div>

            <div className="flex flex-col gap-1">
                {config.cellsColumnIds.map((headerId) => {
                    const cell = cellMap[headerId];
                    if (!cell) {
                        return null;
                    }
                    const cellHeader = cell.column.columnDef.header;
                    return (
                        <div
                            key={headerId + row.id}
                            className="grid grid-cols-[120px_1fr] gap-3"
                        >
                              <span className="text-gray-500 text-xs font-medium">
                                 {typeof cellHeader === "function" ? (cellHeader as () => React.ReactElement)() : cellHeader}
                              </span>

                            <span className="text-gray-700 text-xs font-medium truncate">
                                {flexRender(
                                    cell.column.columnDef.cell,
                                    cell.getContext()
                                )}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
