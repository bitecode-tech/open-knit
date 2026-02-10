import {PagedRequest} from "@common/model/PagedRequest.ts";
import AdminPaymentClient from "@payment/clients/http/AdminPaymentClient.ts";

class AdminPaymentsService {
    public QUERY_KEYS = {
        GET_PAYMENTS: (page: number, pageSize: number) => ['admin-payments', page, pageSize] as const,
        GET_PAYMENT: (id: string) => ['admin-payment', id] as const,
    }

    async getPayments(pageable: PagedRequest<void>) {
        return AdminPaymentClient.getPayments(pageable)
            .then(value => value.data);
    }

    async getPayment(id: string) {
        return AdminPaymentClient.getPayment(id, true)
            .then(value => value.data);
    }
}

export default new AdminPaymentsService();