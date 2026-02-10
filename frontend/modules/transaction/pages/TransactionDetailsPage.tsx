import {Link, useParams} from "react-router-dom";
import {useQuery} from "@tanstack/react-query";
import AdminTransactionService from "@transaction/services/TransactionService.ts";
import React from "react";
import TransactionEventsTable from "@transaction/components/TransactionEventsTable.tsx";
import {BsArrowRightCircleFill} from "react-icons/bs";
import {pageOf} from "@common/utils/PaginationUtils.ts";
import {Label} from "flowbite-react";
import {ColoredLabel} from "@common/components/elements/ColoredLabel.tsx";
import {formatMoney} from "@common/utils/MoneyUtils.ts";
import {enumToReadableText} from "@common/utils/EnumUtils.ts";

export function TransactionDetailsPage() {
    const {id} = useParams();

    const {data: transaction} = useQuery({
        queryKey: AdminTransactionService.QUERY_KEYS.GET_TRANSACTION(id!),
        queryFn: async () => await AdminTransactionService.getTransaction(id!),
        enabled: !!id,
    });

    const LabeledField = ({label, value, linkPrefix, children}: { label: string, value?: string | number, linkPrefix?: string, children?: React.ReactNode }) => {
        return (
            <div className="flex flex-col justify-center w-[426px] gap-y-0.5">
                <Label>{label}</Label>
                <div className="flex items-center">
                    {children || <div className="text-gray-500 text-sm mr-1.5">{value ?? "-"}</div>}
                    {value && linkPrefix &&
                        <Link to={`${linkPrefix}/${value}`} className="cursor-pointer hover:bg-gray-300 rounded-md text-sm -m-1.5 p-1.5">
                            <BsArrowRightCircleFill color="green"/>
                        </Link>
                    }
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-y-4">

            <h2 className="text-xl font-semibold">Transaction Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <LabeledField label="Transaction ID" value={transaction?.uuid}/>
                <LabeledField label="User ID" value={transaction?.userId}/>
                <LabeledField label="Payment ID" value={transaction?.paymentId} linkPrefix="/payments"/>
                <LabeledField label="Type" value={transaction?.type}/>

                <LabeledField label="Status">
                    <ColoredLabel color="green">{enumToReadableText(transaction?.status, "-")}</ColoredLabel>
                </LabeledField>
            </div>

            <h2 className="text-xl font-semibold">Debit details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <LabeledField label="Total" value={formatMoney(transaction?.debitTotal ?? 0)}/>
                <LabeledField label="Type" value={transaction?.debitType}/>
                <LabeledField label="Subtype" value={transaction?.debitSubtype}/>
                <LabeledField label="Currency" value={transaction?.debitCurrency && transaction?.debitCurrency.toUpperCase()}/>
            </div>

            <h2 className="text-xl font-semibold">Debit details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <LabeledField label="Total" value={formatMoney(transaction?.creditTotal ?? 0)}/>
                <LabeledField label="Type" value={transaction?.creditType}/>
                <LabeledField label="Subtype" value={transaction?.creditSubtype}/>
                <LabeledField label="Currency" value={transaction?.creditCurrency && transaction?.creditCurrency.toUpperCase()}/>
            </div>

            <TransactionEventsTable transactionEvents={pageOf(transaction?.events)}/>
        </div>
    );
}