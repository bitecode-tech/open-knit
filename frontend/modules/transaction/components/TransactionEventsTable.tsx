import React, {useState} from "react";
import {ColumnDef,} from "@tanstack/react-table";
import {twMerge} from "tailwind-merge";
import {TransactionEventDetails} from "@transaction/types/TransactionEventDetails.ts";
import GenericTable, {useGenericTablePagination} from "@common/components/tables/GenericTable.tsx";
import {FooterDivider} from "flowbite-react";
import {PagedResponse} from "@common/model/PagedResponse.ts";
import {formatDate} from "@common/utils/DateFormatterUtils.ts";
import GenericTableClipboardCopy from "@common/components/tables/elements/GenericTableClipboardCopy.tsx";
import {showToast} from "@common/components/blocks/ToastManager.tsx";
import {FileCopy} from "flowbite-react-icons/outline";

interface TransactionEventsTableProps {
    transactionEvents?: PagedResponse<TransactionEventDetails>;
}

const columns: ColumnDef<TransactionEventDetails>[] = [
    {
        header: "Date",
        accessorKey: "createdDate",
        cell: ({getValue}) => {
            return (
                <div className="flex items-center">
                    <span className="text-sm text-gray-700 whitespace-nowrap">{formatDate(getValue() as string)}</span>
                </div>
            );
        },
    },
    {
        header: "Even name",
        accessorKey: "eventName",
        cell: ({getValue}) => <GenericTableClipboardCopy value={getValue() as string}/>,
    },
    {
        header: "Event content",
        accessorKey: "eventData",
        cell: ({getValue}) => {
            const [expanded, setExpanded] = useState(false);
            const jsonString = JSON.stringify(getValue(), null, 2);
            const lines = jsonString.split("\n");

            const previewLineCount = 0;

            // Show truncated content or full content based on state
            const displayLines = expanded ? lines : lines.slice(0, previewLineCount);
            const displayText = displayLines.join("\n");

            return (
                <div>
                    {expanded && <FileCopy className="pr-1 text-gray-500 hover:text-primary-500 cursor-pointer"
                                           onClick={() => {
                                               navigator.clipboard.writeText(displayText)
                                                   .then(() => showToast("success", "Copied event content!"));
                                           }}
                    />}
                    <pre
                        className={twMerge(
                            "text-xs font-mono whitespace-pre-wrap break-words",
                            expanded ? "font-mono" : "max-h-[3rem] overflow-hidden"
                        )}
                    >
                    {displayText}
                  </pre>
                    {lines.length > previewLineCount && (
                        <button
                            onClick={() => setExpanded(!expanded)}
                            className="text-primary-500 hover:text-gray-900 text-xs mt-1 cursor-pointer"
                            type="button"
                        >
                            {expanded ? "Show less" : "Show"}
                        </button>
                    )}
                </div>
            );
        },
    },
];

function TransactionEventsTable({transactionEvents: data}: TransactionEventsTableProps) {
    const tablePaginationState = useGenericTablePagination();

    return (
        <div>
            <FooterDivider className="p-0 m-0"/>
            <GenericTable columns={columns}
                          exportFilename="Transaction events"
                          data={data}
                          {...tablePaginationState}></GenericTable>
        </div>
    );
}

export default TransactionEventsTable;