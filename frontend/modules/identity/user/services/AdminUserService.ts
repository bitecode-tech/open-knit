import AdminUserClient from "@identity/user/clients/http/AdminUserClient.ts";
import {PagedResponse} from "@common/model/PagedResponse.ts";
import {User} from "@identity/user/types/model/User.ts";
import {InviteUserRequest} from "@identity/user/types/admin/InviteUserRequest.ts";

class AdminUserService {

    public QUERY_KEYS = {
        GET_USERS: (ids: string[]) => ['admin-users', ids] as const,
        GET_FILTER_STATISTICS: () => ['admin-users-statistics'] as const,
        GET_USERS_INVALIDATE: () => ['admin-users'] as const,
    }

    async inviteNewUser(req: InviteUserRequest) {
        return AdminUserClient.inviteUser(req);
    }

    public async getUserDetails(page: number, pageSize: number, includeUserData?: boolean, params?: {}): Promise<PagedResponse<User>> {
        return AdminUserClient.getUserDetails({page: {page, size: pageSize}, params: {...params, includeUserData}});
    }

    async getUsers(userIds: string[], includeUserData?: boolean) {
        return AdminUserClient.getUsers({userIds, includeUserData});
    }

    async getFilterStatistics() {
        return AdminUserClient.getFilterStatistics();
    }
}

export default new AdminUserService();
