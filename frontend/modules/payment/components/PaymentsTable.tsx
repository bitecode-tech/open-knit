import React from "react";
import {Checkbox, DropdownItem,} from "flowbite-react";
import {ColumnDef,} from "@tanstack/react-table";
import {useQuery} from "@tanstack/react-query";
import {ActionsDropdown} from "@common/components/blocks/ActionsDropdown.tsx";
import {Link} from "react-router-dom";
import GenericTable, {useGenericTablePagination} from "@common/components/tables/GenericTable.tsx";
import {Payment} from "@payment/types/model/Payment.ts";
import AdminPaymentService from "@payment/services/AdminPaymentService.ts";

const columns: ColumnDef<Payment>[] = [
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
        header: "Id",
        accessorKey: "uuid",
        cell: ({getValue}) => {
            return (
                <div className="flex items-center">
                    <span className="font-medium text-gray-900">{getValue() as string}</span>
                </div>
            );
        },
    },
    {
        header: "Type",
        accessorKey: "type",
        cell: ({getValue}) => {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-200 text-gray-800">
          {getValue() as string}
        </span>
            );
        },
    },
    {
        header: "Status",
        accessorKey: "status",
        cell: ({getValue}) => {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-200 text-gray-800">
          {getValue() as string}
        </span>
            );
        },
    },
    {
        header: "Gateway",
        accessorKey: "gateway",
        cell: ({getValue}) => {
            return (
                <div className="flex items-center">
                    <span className="font-medium text-gray-900">{getValue() as string}</span>
                </div>
            );
        },
    },
    {
        header: "Amount",
        cell: ({row}) => {
            const payment = row.original
            return (
                <div className="flex items-center">
                    <span className="font-medium text-gray-900">{`${payment.amount} ${payment.currency}`}</span>
                </div>
            );
        },
    },
    {
        header: "Date",
        accessorKey: "createdDate",
        cell: ({getValue}) => {
            return (
                <div className="flex items-center">
                    <span className="font-medium text-gray-900">{new Date(getValue() as string).toLocaleDateString()}</span>
                </div>
            );
        },
    },
    {
        id: "actions",
        header: "Actions",
        accessorKey: "uuid",
        cell: ({getValue}) => {
            const paymentId = getValue() as string;
            return (
                <ActionsDropdown>
                    <Link to={`/admin/payments/${paymentId}`}><DropdownItem>Show</DropdownItem></Link>
                </ActionsDropdown>
            )
        },
    },
];

function PaymentsTable() {
    const tablePagination = useGenericTablePagination();
    const [currentPage] = tablePagination.currentPageState;
    const [pageSize] = tablePagination.pageSizeState;

    const {data} = useQuery({
        queryKey: AdminPaymentService.QUERY_KEYS.GET_PAYMENTS(currentPage, pageSize),
        queryFn: async () => await AdminPaymentService.getPayments({page: {page: currentPage - 1, size: pageSize}})
    });

    return (
        <GenericTable
            columns={columns}
            data={data}
            exportFilename="Payments"
            {...tablePagination}
        />
    );
}

export default PaymentsTable;