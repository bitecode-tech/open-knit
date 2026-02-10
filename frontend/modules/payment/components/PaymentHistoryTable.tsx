import React, {useState} from "react";
import {ColumnDef,} from "@tanstack/react-table";
import {twMerge} from "tailwind-merge";
import GenericTable, {useGenericTablePagination} from "@common/components/tables/GenericTable.tsx";
import {FooterDivider} from "flowbite-react";
import {PaymentHistory} from "@payment/types/model/PaymentHistory.ts";
import {PagedResponse} from "@common/model/PagedResponse.ts";

interface PaymentHistoryTableProps {
    paymentHistory?: PagedResponse<PaymentHistory>;
}

const columns: ColumnDef<PaymentHistory>[] = [
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
        header: "Update type",
        accessorKey: "updateType",
        cell: ({getValue}) => {
            return (
                <div className="flex items-center">
                    <span className="font-medium text-gray-900">{getValue() as string}</span>
                </div>
            );
        },
    },
    {
        header: "Event content",
        accessorKey: "updateData",
        cell: ({getValue}) => {
            const [expanded, setExpanded] = useState(false);
            const jsonString = JSON.stringify(JSON.parse(getValue() as string), null, 2);
            const lines = jsonString.split("\n");

            // Number of lines to show when collapsed
            const previewLineCount = 2;

            // Show truncated content or full content based on state
            const displayLines = expanded ? lines : lines.slice(0, previewLineCount);
            const displayText = displayLines.join("\n");

            return (
                <div>
          <pre
              className={twMerge(
                  "text-xs font-mono whitespace-pre-wrap break-words",
                  !expanded && "max-h-[3rem] overflow-hidden"
              )}
          >
            {displayText}
          </pre>
                    {lines.length > previewLineCount && (
                        <button
                            onClick={() => setExpanded(!expanded)}
                            className="text-blue-600 hover:underline text-xs mt-1"
                            type="button"
                        >
                            {expanded ? "Show less" : "Show more"}
                        </button>
                    )}
                </div>
            );
        },
    },
];

function PaymentHistoryTable({paymentHistory: data}: PaymentHistoryTableProps) {
    const tablePaginationState = useGenericTablePagination();

    return (
        <div>
            <FooterDivider/>
            <GenericTable columns={columns}
                          exportFilename="Payment history"
                          data={data}
                          {...tablePaginationState}></GenericTable>
        </div>
    );
}

export default PaymentHistoryTable;