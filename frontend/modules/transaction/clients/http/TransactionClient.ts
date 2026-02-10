import {AxiosInstance, AxiosResponse} from "axios";
import {adminBaseConfig} from "@common/config/AxiosConfig.ts";
import {PagedRequest} from "@common/model/PagedRequest.ts";
import {PagedResponse} from "@common/model/PagedResponse.ts";
import {TransactionDetails} from "@transaction/types/TransactionDetails.ts";
import AuthService from "@identity/auth/services/AuthService.ts";
import {axiosRequestConfigOf} from "@common/utils/PaginationUtils.ts";


class AdminTransactionClient {
    private axios: AxiosInstance;

    constructor() {
        this.axios = AuthService.createAuthenticatedClientInstance(adminBaseConfig, "/transactions");
    }

    async getFilterStatistics() {
        return await this.axios.get<any>('/statistics');
    }

    async getTransactions(page: PagedRequest<void>): Promise<AxiosResponse<PagedResponse<TransactionDetails>>> {
        return await this.axios.get<PagedResponse<TransactionDetails>>('', axiosRequestConfigOf(page));
    }

    async getTransaction(id: string, includeEvents: boolean): Promise<AxiosResponse<TransactionDetails>> {
        return await this.axios.get<TransactionDetails>(`/${id}?includeEvents=${includeEvents}`);
    }
}

export default new AdminTransactionClient();