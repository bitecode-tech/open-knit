import {Card} from "flowbite-react";
import {Link, useParams} from "react-router-dom";
import {useQuery} from "@tanstack/react-query";
import React from "react";
import AdminPaymentService from "@payment/services/AdminPaymentService.ts";
import PaymentHistoryTable from "@payment/components/PaymentHistoryTable.tsx";
import {BsArrowRightCircleFill} from "react-icons/bs";
import {pageOf} from "@common/utils/PaginationUtils.ts";

export function PaymentDetailsPage() {
    const {id} = useParams();

    const {data: payment} = useQuery({
        queryKey: AdminPaymentService.QUERY_KEYS.GET_PAYMENT(id!),
        queryFn: async () => await AdminPaymentService.getPayment(id!),
        enabled: !!id,
    });

    return (
        <div className="max-w-7xl mx-auto p-4">
            <Card className="p-1">
                <h2 className="text-2xl font-semibold mb-4">Payment Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-800">
                    <div>
                        <span className="font-medium">Payment ID:</span>
                        <div className="break-all">{payment?.uuid ?? "-"}</div>
                    </div>
                    <div>
                        <span className="font-medium">User ID:</span>
                        <div className="break-all">{payment?.userId ?? "-"}</div>
                    </div>
                    <div>
                        <span className="font-medium">Transaction ID:</span>
                        <div className="flex items-center break-all">{payment?.transactionId ?? "-"}
                            {payment?.transactionId &&
                                <Link to={`/admin/transactions/${payment.transactionId}`} className="cursor-pointer hover:bg-gray-300 p-2 rounded-md">
                                    <BsArrowRightCircleFill color="green"/>
                                </Link>}
                        </div>
                    </div>
                    <div>
                        <span className="font-medium">Amount:</span> {payment?.amount ?? "-"}
                    </div>
                    <div>
                        <span className="font-medium">Currency:</span> {payment?.currency ?? "-"}
                    </div>
                    <div>
                        <span className="font-medium">Gateway ID:</span>
                        <div className="break-all">{payment?.gatewayId ?? "-"}</div>
                    </div>
                    <div>
                        <span className="font-medium">Gateway:</span> {payment?.gateway ?? "-"}
                    </div>
                    <div>
                        <span className="font-medium">Status:</span> {payment?.status ?? "-"}
                    </div>
                    <div>
                        <span className="font-medium">Type:</span> {payment?.type ?? "-"}
                    </div>
                    <div>
                        <span className="font-medium">Created Date:</span> {payment?.createdDate ?? "-"}
                    </div>
                </div>
            </Card>
            <PaymentHistoryTable paymentHistory={pageOf(payment?.history)}/>
        </div>
    );
}