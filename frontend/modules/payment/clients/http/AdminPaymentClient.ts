import {AxiosInstance} from "axios";
import {adminBaseConfig} from "@common/config/AxiosConfig";
import AuthService from "@identity/auth/services/AuthService.ts";
import {PagedRequest} from "@common/model/PagedRequest.ts";
import {PagedResponse} from "@common/model/PagedResponse.ts";
import {Payment} from "@payment/types/model/Payment.ts";

class AdminPaymentClient {
    private axios: AxiosInstance;

    constructor() {
        this.axios = AuthService.createAuthenticatedClientInstance(adminBaseConfig, "/payments");
    }

    async getPayments(pagedRequest: PagedRequest<void>) {
        return this.axios.get<PagedResponse<Payment>>("", {params: {...pagedRequest.page}});
    }

    async getPayment(id: string, includeEvents: boolean) {
        return this.axios.get<Payment>(`/${id}?includeEvents=${includeEvents}`);
    }

}

export default new AdminPaymentClient();
