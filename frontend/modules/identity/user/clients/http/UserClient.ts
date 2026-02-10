import axios, {AxiosInstance, AxiosResponse} from "axios";
import {SignUpRequest} from "@identity/user/types/request/SignUpRequest.ts";
import {User} from "@identity/user/types/model/User.ts";
import {SetMfaRequest} from "@identity/user/types/request/SetMfaRequest.ts";
import {ResetForgottenPasswordRequest} from "@identity/user/types/request/ResetForgottenPasswordRequest.ts";
import {addConverters, baseConfig} from "@common/config/AxiosConfig";
import AuthService from "@identity/auth/services/AuthService.ts";
import {ChangePasswordRequest} from "@identity/user/types/request/ChangePasswordRequest.ts";
import {UpdateUserDataRequest} from "@identity/user/types/request/UpdateUserDataRequest.ts";
import {SetupMfaMethodDetails} from "@identity/user/types/model/SetupMfaMethodDetails.ts";
import {UserData} from "@identity/user/types/model/UserData.ts";
import {axiosCallWrapper} from "@common/config/AxiosUtil.ts";

class UserClient {
    private axios: AxiosInstance;
    private noAuthAxios: AxiosInstance;

    constructor() {
        this.noAuthAxios = addConverters(axios.create({...baseConfig, baseURL: baseConfig.baseURL + "/users"}));
        this.axios = AuthService.createAuthenticatedClientInstance(baseConfig, "/users");

    }

    async confirmEmail(verificationCode: string) {
        return this.noAuthAxios.post<void>(`/confirmations/${verificationCode}`).then(resp => resp.data);
    }

    async resendAccountConfirmationEmail(email: string) {
        return axiosCallWrapper(() => this.noAuthAxios.post<void>(`/confirmations`, {email}));
    }

    async signUp(payload: SignUpRequest) {
        return axiosCallWrapper(() => this.noAuthAxios.post<User>("", payload));
    }

    async getSelf() {
        return this.axios.get<User>("/self")
            .then(resp => resp.data);
    }

    async setMfaMethod(payload: SetMfaRequest): Promise<SetupMfaMethodDetails> {
        return await this.axios.put<SetupMfaMethodDetails>('/mfa', payload)
            .then(resp => resp.data);
    }

    async requestForgottenPasswordReset(username: string): Promise<void> {
        await this.noAuthAxios.post(`/passwords/recovery/${username}`);
    }

    async resetForgottenPassword(payload: ResetForgottenPasswordRequest): Promise<void> {
        await this.noAuthAxios.post('/passwords/recovery', payload);
    }

    async changePassword(payload: ChangePasswordRequest): Promise<AxiosResponse> {
        return await this.axios.post('/passwords/recovery', payload);
    }

    async getUserData(): Promise<UserData> {
        return await this.axios.get<UserData>('/data')
            .then(resp => resp.data);
    }

    async updateUserData(payload: UpdateUserDataRequest): Promise<void> {
        return await this.axios.patch('/data', payload);
    }
}

export default new UserClient();
