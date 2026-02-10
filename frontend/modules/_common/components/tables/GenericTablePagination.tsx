import React from "react";
import {Label, Pagination as FlowbitePagination, Select, theme} from "flowbite-react";
import {twMerge} from "tailwind-merge";

interface GenericTablePaginationProps {
    currentPage: number;
    pageSize: number;
    totalPages: number;
    totalElements?: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (pageSize: number) => void;
    mobile?: boolean
}

const pageSizeOptions = [10, 25, 50, 100];

function GenericTablePagination(
    {
        currentPage,
        pageSize,
        totalPages,
        totalElements,
        onPageChange,
        onPageSizeChange,
        mobile
    }: GenericTablePaginationProps) {

    const getCurrentRange = () => {
        if (typeof totalElements === "number") {
            const start = (currentPage - 1) * pageSize + 1;
            const end = Math.min(currentPage * pageSize, totalElements);
            return `${start} - ${end}`;
        }
        return 0;
    };

    const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const size = Number(e.target.value);
        onPageSizeChange(size);
    };

    const TableRangePicker = () => {
        return <>
            <Label
                htmlFor="rows"
                className={twMerge("text-xs font-normal text-gray-500")}
            >
                Showing
            </Label>
            <Select
                id="rows"
                name="rows"
                value={pageSize}
                onChange={handlePageSizeChange}
                className="[&_select]:py-1 [&_select]:pr-8"
            >
                {pageSizeOptions.map((size) => (
                    <option key={size} value={size}>
                        {size}
                    </option>
                ))}
            </Select>
        </>
    }

    const TableRangeElementCounter = () => {
        return (
            <div className="text-sm font-normal text-gray-500">
                        <span className="font-semibold text-gray-900">
                          {getCurrentRange()}
                        </span>
                &nbsp;of&nbsp;
                <span className="font-semibold text-gray-900">{totalElements ?? ""}</span>
            </div>
        )
    }

    return (
        <>
            <nav
                className={twMerge("flex flex-col items-start justify-between space-y-3 p-4 md:flex-row md:items-center md:space-y-0", mobile && "hidden md:flex")}
                aria-label="Table navigation"
            >
                <div className="flex items-center space-x-3">
                    <TableRangePicker/>
                    <TableRangeElementCounter/>
                </div>
                <FlowbitePagination
                    currentPage={currentPage}
                    layout="pagination"
                    onPageChange={onPageChange}
                    totalPages={totalPages}
                    nextLabel=""
                    previousLabel=""
                    showIcons
                    className="mt-2 md:mt-0"
                    theme={{
                        layout: {
                            table: {
                                base: "hidden",
                                span: "hidden",
                            },
                        },
                        pages: {
                            next: {
                                base: twMerge(theme.pagination.pages.next.base, "text-sm text-gray-500 font-medium py-1.5 px-3 h-[36px] items-center"),
                                icon: "size-4"
                            },
                            previous: {
                                base: twMerge(theme.pagination.pages.previous.base, "text-sm text-gray-500 font-medium py-2 px-3 h-[36px] items-center"),
                                icon: "size-4"
                            },
                            selector: {
                                base: twMerge(theme.pagination.pages.selector.base, "text-sm text-gray-500 font-medium py-1.5 px-3 h-[36px] items-center"),
                                active: twMerge(theme.pagination.pages.selector.base, "text-gray-900 bg-gray-100")
                            }
                        },
                    }}
                />
            </nav>

            <nav
                className={twMerge("flex justify-between space-y-3 md:flex-row md:items-center md:space-y-0 py-2 px-4", mobile && "md:hidden")}
                aria-label="Table navigation"
            >
                <span className="pt-4">
                    <TableRangeElementCounter/>
                </span>
                <FlowbitePagination
                    currentPage={currentPage}
                    layout="navigation"
                    onPageChange={onPageChange}
                    totalPages={totalPages}
                    nextLabel="Next"
                    previousLabel="Previous"
                    showIcons
                    theme={{
                        layout: {
                            table: {
                                base: "hidden",
                                span: "hidden",
                            },
                        },
                        pages: {
                            next: {
                                base: twMerge(theme.pagination.pages.next.base, "text-sm text-gray-500 font-medium py-1.5 px-3 h-[36px] items-center"),
                                icon: "size-4"
                            },
                            previous: {
                                base: twMerge(theme.pagination.pages.previous.base, "text-sm text-gray-500 font-medium py-2 px-3 h-[36px] items-center"),
                                icon: "size-4"
                            },
                            selector: {
                                base: twMerge(theme.pagination.pages.selector.base, "text-sm text-gray-500 font-medium py-1.5 px-3 h-[36px] items-center"),
                                active: twMerge(theme.pagination.pages.selector.base, "text-gray-900 bg-gray-100")
                            }
                        },
                    }}
                />
            </nav>

        </>
    );
}

export default GenericTablePagination;
