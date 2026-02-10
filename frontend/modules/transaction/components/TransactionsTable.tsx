import React, {useMemo, useState} from "react";
import {Checkbox, DropdownItem,} from "flowbite-react";
import {ColumnDef,} from "@tanstack/react-table";
import {useQuery} from "@tanstack/react-query";
import {ActionsDropdown} from "@common/components/blocks/ActionsDropdown.tsx";
import {TransactionDetails} from "@transaction/types/TransactionDetails.ts";
import AdminTransactionService from "@transaction/services/TransactionService.ts";
import {Link} from "react-router-dom";
import GenericTable, {useGenericTablePagination} from "@common/components/tables/GenericTable.tsx";
import {enumToReadableText} from "@common/utils/EnumUtils.ts";
import {User} from "@identity/user/types/model/User.ts";
import AdminUserService from "@identity/user/services/AdminUserService.ts";
import FilterTile from "@common/components/tables/filters/GenericTableFilterTile.tsx";
import DateFilter from "@common/components/tables/filters/GenericTableDateFilter.tsx";
import ClearFilters from "@common/components/tables/filters/GenericTableClearFilters.tsx";
import {PagedResponse} from "@common/model/PagedResponse.ts";
import {emptyPage} from "@common/utils/PaginationUtils.ts";
import {ColoredLabel} from "@common/components/elements/ColoredLabel.tsx";
import {formatDate} from "@common/utils/DateFormatterUtils.ts";
import GenericTableClipboardCopy from "@common/components/tables/elements/GenericTableClipboardCopy.tsx";
import {getFullName} from "@common/utils/StringUtils.ts";
import GenericTableCurrencyCell from "@common/components/tables/elements/GenericTableCurrencyCell.tsx";
import {MobileRowTemplate} from "@common/components/tables/types/MobileRowTemplate.ts";

type TransactionColumnDefinition = TransactionDetails & { userDetails?: User };

const columns: ColumnDef<TransactionColumnDefinition>[] = [
    {
        id: "selection",
        header: ({table}) => (
            <Checkbox
                {...{
                    checked: table.getIsAllPageRowsSelected(),
                    indeterminate: table.getIsSomePageRowsSelected(),
                    onChange: table.getToggleAllPageRowsSelectedHandler(),
                }}
            />
        ),
        cell: ({row}) => (
            <Checkbox
                {...{
                    checked: row.getIsSelected(),
                    disabled: !row.getCanSelect(),
                    indeterminate: row.getIsSomeSelected(),
                    onChange: row.getToggleSelectedHandler(),
                }}
            />
        ),
    },
    {
        header: "Amount",
        accessorFn: ({debitTotal, debitCurrency}) => [debitTotal, debitCurrency],
        cell: ({getValue}) => {
            const [debitTotal, currency] = getValue() as [number, string];
            return <>
                <GenericTableCurrencyCell amount={debitTotal} currency={currency} className="hidden md:flex"/>
                <GenericTableCurrencyCell amount={debitTotal} currency={currency} variant="mobile-bold" className="md:hidden"/>
            </>
        },
    },
    {
        header: "Type",
        accessorKey: "type",
        cell: ({getValue}) => <ColoredLabel>{enumToReadableText(getValue() as string, "-")}</ColoredLabel>,
    },
    {
        header: "Status",
        accessorKey: "status",
        cell: ({getValue}) => {
            const status = getValue() as TransactionDetails["status"];
            const getColor = () => {
                switch (status) {
                    case "COMPLETED":
                        return "green";
                    case "CANCELLED":
                    case "ERROR":
                        return "red";
                    default:
                        return "yellow";
                }
            }

            return (
                <ColoredLabel color={getColor()}>{enumToReadableText(status, "-")}</ColoredLabel>
            );
        },
    },
    {
        header: () => <span className="whitespace-nowrap">Payment method</span>,
        accessorKey: "debitType",
        cell: ({getValue}) => <ColoredLabel>{enumToReadableText(getValue() as string, "-")}</ColoredLabel>,
    },
    {
        header: "Customer",
        accessorKey: "userDetails",
        cell: ({getValue}) => {
            const user = getValue() as User | undefined;
            const userData = user?.userData;
            return (
                <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
                    {getFullName(userData?.name, userData?.surname) || user?.email}
                </span>
            );
        },
    },
    {
        header: "Id transaction",
        accessorKey: "uuid",
        cell: ({getValue}) => (
            <>
                <div className="text-gray-700 text-xs font-medium truncate md:hidden">{getValue() as string}</div>
                <GenericTableClipboardCopy className="hidden md:flex" value={getValue() as string}/>
            </>
        ),
    },
    {
        header: "Date",
        accessorKey: "createdDate",
        cell: ({getValue}) => {
            return (
                <div className="flex items-center">
                    <span className="text-sm text-gray-900 whitespace-nowrap">{formatDate(getValue() as string)}</span>
                </div>
            );
        },
    },
    {
        id: "actions",
        header: "Actions",
        accessorKey: "uuid",
        cell: ({getValue}) => {
            const txnId = getValue() as string;
            return (
                <ActionsDropdown>
                    <Link to={`/admin/transactions/${txnId}`}><DropdownItem>Show</DropdownItem></Link>
                </ActionsDropdown>
            )
        },
    },
];

const mobileRowTemplate: MobileRowTemplate<"default"> = {
    version: "default",
    config: {
        header: {
            headerColumnId: "Amount",
            rightColumnId: "status"
        },
        cellsColumnIds: ["debitType", "uuid"]
    }
}

const activeFiltersConf = {
    0: {},
    1: {"status": "COMPLETED"},
    2: {"status": "INCOMPLETE"},
};

type ActiveFilterKey = keyof typeof activeFiltersConf;

function TransactionsTable() {
    const tablePagination = useGenericTablePagination();
    const [currentPage] = tablePagination.currentPageState;
    const [pageSize] = tablePagination.pageSizeState;
    const [startDate, setStartDate] = useState<Date | null>(null)
    const [endDate, setEndDate] = useState<Date | null>(null)
    const [activeFilter, setActiveFilter] = useState<ActiveFilterKey>(0)

    const filterParams = useMemo(() => ({...activeFiltersConf[activeFilter], startDate, endDate}),
        [startDate, endDate, activeFilter]
    );

    const {data: statistics} = useQuery({
        queryKey: AdminTransactionService.QUERY_KEYS.FILTER_STATISTICS(),
        queryFn: async () => await AdminTransactionService.getFilterStatistics()
    });

    const {data: transactionsPage} = useQuery({
        queryKey: AdminTransactionService.QUERY_KEYS.GET_TRANSACTIONS(currentPage, pageSize, filterParams),
        queryFn: async () => await AdminTransactionService.getTransactions({
            page: {
                page: currentPage - 1,
                size: pageSize,
                sort: [{property: "createdDate", direction: "DESC"}]
            },
            params: filterParams
        })
    });

    const userIds = useMemo(
        () => transactionsPage?.content?.map(({userId}) => userId) ?? [],
        [transactionsPage]
    );

    const {data: userDetailsList} = useQuery({
        queryKey: AdminUserService.QUERY_KEYS.GET_USERS(userIds),
        queryFn: async () => await AdminUserService.getUsers(userIds, true).then(resp => resp.data.content),
        enabled: userIds.length > 0
    });

    const transactions: PagedResponse<TransactionColumnDefinition> = useMemo(() => {
        if (!transactionsPage || !userDetailsList) {
            return emptyPage();
        }

        const map = new Map<string, User>();
        for (const user of userDetailsList) {
            map.set(user.uuid, user);
        }

        const content = transactionsPage?.content.map(txn => ({
            ...txn,
            userDetails: map.get(txn.userId),
        }));

        return {content, page: transactionsPage.page};
    }, [transactionsPage, userDetailsList]);

    const clearFilters = () => {
        setActiveFilter(0);
        setStartDate(null);
        setEndDate(null);
    }

    return (
        <GenericTable
            columns={columns}
            data={transactions}
            headerSection="Transactions"
            mobileRowTemplate={mobileRowTemplate}
            csvExportKeys={["debitTotal", "debitCurrency", "type", "status", "debitType", "userDetails.userData.name", "userDetails.userData.surname"]}
            tileFilters={
                <>
                    <FilterTile text="All" amount={statistics?.all ?? ""} filterKey={0} activeFilterState={[activeFilter, setActiveFilter]}/>
                    <FilterTile text="Completed" amount={statistics?.completed ?? ""} filterKey={1} activeFilterState={[activeFilter, setActiveFilter]}/>
                    <FilterTile text="Incomplete" amount={statistics?.incomplete ?? ""} filterKey={2} activeFilterState={[activeFilter, setActiveFilter]}/>
                </>
            }
            filters={
                <>
                    <DateFilter startDateState={[startDate, setStartDate]} endDateState={[endDate, setEndDate]}/>
                    <ClearFilters onClick={clearFilters}/>
                </>
            }
            exportFilename="Transactions"
            {...tablePagination}
        />
    );
}

export default TransactionsTable;