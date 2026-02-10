import React, {Dispatch, SetStateAction, useState} from "react";
import {ColumnDef, flexRender, getCoreRowModel, RowSelectionState, useReactTable,} from "@tanstack/react-table";
import {twMerge} from "tailwind-merge";
import FileExportIcon from "@common/assets/tables/file-export-icon.svg?react"
import ActionButton from "@common/components/tables/filters/GenericTableActionButton.tsx";
import {exportToCsv} from "@common/utils/CsvUtils.ts";
import {NestedKeyOf} from "@common/utils/TypeUtils.ts";
import {PagedResponse} from "@common/model/PagedResponse.ts";
import {showToast} from "@common/components/blocks/ToastManager.tsx";
import {MobileRowTemplate} from "@common/components/tables/types/MobileRowTemplate.ts";
import {MobileRowTemplateConfig} from "@common/components/tables/types/MobileRowTemplateConfig.ts";
import DefaultMobileRowTemplateRenderer from "@common/components/tables/renderers/DefaultMobileRowTemplateRenderer.tsx";
import GenericTablePagination from "@common/components/tables/GenericTablePagination.tsx";


interface GenericTableProps<T, CsvType, MobileTemplate extends keyof MobileRowTemplateConfig> {
    columns: ColumnDef<T>[]
    mobileRowTemplate?: MobileRowTemplate<MobileTemplate>
    data?: PagedResponse<T>;
    exportFilename?: string,
    headerSection?: React.ReactNode | string,
    tileFilters?: React.ReactNode,
    filters?: React.ReactNode,
    csvExportKeys?: CsvType[];
    currentPageState: [number, Dispatch<SetStateAction<number>>],
    pageSizeState: [number, Dispatch<SetStateAction<number>>],
    rowSelectionState: [RowSelectionState, Dispatch<SetStateAction<RowSelectionState>>],
    onRowClick?: (row: T) => void;
}

export function useGenericTablePagination(initialPage = 1, initialPageSize = 10) {
    const [currentPage, setCurrentPage] = useState(initialPage);
    const [pageSize, setPageSize] = useState(initialPageSize);
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

    return {
        currentPageState: [currentPage, setCurrentPage] as [number, Dispatch<SetStateAction<number>>],
        pageSizeState: [pageSize, setPageSize] as [number, Dispatch<SetStateAction<number>>],
        rowSelectionState: [rowSelection, setRowSelection] as [RowSelectionState, Dispatch<SetStateAction<RowSelectionState>>],
    };
}


const SmallFilter = ({text, number, isSelected = false}: { text: string, number: string, isSelected?: boolean }) => {
    return (
        <div
            className={`flex flex-col justify-center items-start p-2.5 rounded-lg gap-2 w-[235px] h-[66px] ${isSelected ? "outline outline-2 outline-offset-[-2px] outline-primary-500" : "outline outline-gray-200"}   `}>
            <div className={`self-stretch justify-center text-sm ${isSelected ? "text-primary-500 font-semibold" : "text-gray-500"} leading-tight`}>{text}</div>
            <div className={`justify-center ${isSelected ? "text-primary-500" : "text-gray-900"} text-sm font-semibold leading-tight`}>{number}</div>
        </div>
    );
}


function GenericTable<
    T extends object,
    CsvKeys extends NestedKeyOf<T> = never,
    MobileTemplate extends keyof MobileRowTemplateConfig = never>(
    {
        data,
        columns,
        mobileRowTemplate,
        exportFilename,
        tileFilters,
        filters,
        headerSection,
        csvExportKeys,
        currentPageState,
        pageSizeState,
        rowSelectionState,
        onRowClick
    }: GenericTableProps<T, CsvKeys, MobileTemplate>) {
    const [currentPage, setCurrentPage] = currentPageState;
    const [pageSize, setPageSize] = pageSizeState;
    const [rowSelection, setRowSelection] = rowSelectionState;
    const isExportEnabled = data && csvExportKeys && csvExportKeys.length !== 0;

    const table = useReactTable({
        data: data?.content ?? [],
        columns,
        state: {
            pagination: {
                pageIndex: currentPage - 1,
                pageSize,
            },
            rowSelection,
        },
        onPaginationChange: (updater) => {
            const newPagination = typeof updater === 'function' ? updater({pageIndex: currentPage - 1, pageSize}) : updater;
            setCurrentPage(newPagination.pageIndex + 1);
        },
        onRowSelectionChange: setRowSelection,
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true,
        pageCount: data?.page?.totalPages ?? 0,
    });

    const totalPages = table.getPageCount();

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        table.setPageIndex(page - 1);
    };

    const handlePageSizeChange = (size: number) => {
        setPageSize(size);
        table.setPageSize(size);
        setCurrentPage(1);
        table.setPageIndex(0);
    };

    function handleCsvExport() {
        if (isExportEnabled) {
            const selected = table.getSelectedRowModel().rows.map(row => row.original);
            if (!selected || selected.length === 0) {
                showToast("warning", "Select at least one row to CSV export")
            } else {
                exportToCsv<T>(selected, csvExportKeys, exportFilename ?? 'export.csv');
            }
        }
    }

    return (
        <div>
            <div className="mx-auto max-w-screen-2xl">
                <div className="relative bg-white">
                    <div className="divide-y">
                        <div className="flex flex-col justify-between gap-y-4">
                            {headerSection && typeof headerSection === 'string'
                                ? <h5 className="text-gray-900 text-xl font-semibold">
                                    {headerSection}
                                </h5>
                                : headerSection
                            }
                            <div className="flex items-start gap-3">
                                {tileFilters}
                            </div>
                            <div className="flex w-full items-center flex-wrap md:flex-nowrap">
                                <div className="flex items-start gap-2">
                                    {filters}
                                </div>
                                <div className="flex md:ml-auto gap-1 mt-3 md:mt-0 w-full md:w-auto">
                                    {isExportEnabled && <ActionButton onClick={handleCsvExport} icon={FileExportIcon}>Export CSV</ActionButton>}
                                    {/*<ActionButton icon={ChevronDownIcon} disabled>Edit columns</ActionButton>*/}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto mt-4">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="hidden md:table-header-group bg-gray-50 text-xs uppercase text-gray-700">
                            {table.getHeaderGroups().map((headerGroup) => (
                                <tr key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <th
                                            key={header.id}
                                            className="px-4 py-3 text-left"
                                        >
                                            {header.isPlaceholder ? null : (
                                                <div>
                                                    {flexRender(
                                                        header.column.columnDef.header,
                                                        header.getContext()
                                                    )}
                                                </div>
                                            )}
                                        </th>
                                    ))}
                                </tr>
                            ))}
                            </thead>
                            <tbody className="bg-white">
                            {table.getRowModel().rows.map((row, idx) => (
                                <tr
                                    key={row.id}
                                    className={twMerge(
                                        "border-b",
                                        onRowClick ? "cursor-pointer hover:bg-gray-100" : "hover:bg-gray-100",
                                        mobileRowTemplate && "block md:table-row md:border-0"
                                    )}
                                    onClick={onRowClick && (() => onRowClick(row.original))}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <td key={cell.id} className={twMerge("px-4 py-2", mobileRowTemplate && "hidden md:table-cell")}>
                                            <span>
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </span>
                                        </td>
                                    ))}

                                    <td className={`${mobileRowTemplate && "md:hidden"}`}>
                                        <DefaultMobileRowTemplateRenderer config={mobileRowTemplate?.config} row={row} rowIdx={idx}/>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>

                    <GenericTablePagination
                        currentPage={currentPage}
                        onPageChange={handlePageChange}
                        onPageSizeChange={handlePageSizeChange}
                        pageSize={pageSize}
                        totalElements={data?.page?.totalElements}
                        totalPages={totalPages}
                        mobile={!!mobileRowTemplate}
                    />
                </div>
            </div>
        </div>
    );
}

export default GenericTable;
