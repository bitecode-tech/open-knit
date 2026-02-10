import {PagedRequest} from "@common/model/PagedRequest.ts";
import AdminTransactionClient from "@transaction/clients/http/TransactionClient.ts";

class AdminTransactionService {
    public QUERY_KEYS = {
        GET_TRANSACTION: (id: string) => ['admin-transaction', id] as const,
        GET_TRANSACTIONS: (page: number, pageSize: number, filter?: {}) => ['admin-transactions', page, pageSize, JSON.stringify(filter)] as const,
        FILTER_STATISTICS: () => ['admin-filter-statistics'] as const,
    }

    public async getFilterStatistics() {
        const resp = await AdminTransactionClient.getFilterStatistics();
        return resp.data;
    }

    public async getTransactions(page: PagedRequest<void>) {
        const resp = await AdminTransactionClient.getTransactions(page);
        return resp.data;
    }

    public async getTransaction(id: string) {
        const resp = await AdminTransactionClient.getTransaction(id, true);
        return resp.data;
    }
}

export default new AdminTransactionService();