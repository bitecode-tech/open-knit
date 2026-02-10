import {AxiosInstance} from "axios";
import {adminBaseConfig} from "@common/config/AxiosConfig";
import AuthService from "@identity/auth/services/AuthService.ts";
import {User} from "@identity/user/types/model/User.ts";
import {PagedResponse} from "@common/model/PagedResponse.ts";
import {PagedRequest} from "@common/model/PagedRequest.ts";
import {InviteUserRequest} from "@identity/user/types/admin/InviteUserRequest.ts";
import {axiosCallWrapper} from "@common/config/AxiosUtil.ts";

class AdminUserClient {
    private axios: AxiosInstance;

    constructor() {
        this.axios = AuthService.createAuthenticatedClientInstance(adminBaseConfig, "/users");
    }

    async getUsers(params: {}) {
        return this.axios.get<PagedResponse<User>>('', {params});
    }

    async inviteUser(req: InviteUserRequest) {
        return axiosCallWrapper<void>(() => this.axios.post('/invite', req));
    }

    async getFilterStatistics() {
        return this.axios.get('/statistics');
    }

    async getUserDetails(request: PagedRequest<void>) {
        return this.axios.get<PagedResponse<User>>("", {
            params: {
                ...request.page,
                ...request.params,
            }
        }).then(resp => resp.data);
    }

}

export default new AdminUserClient();
