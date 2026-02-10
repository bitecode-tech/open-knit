import {SignInRequest} from "@identity/auth/types/request/SignInRequest.ts";
import axios, {AxiosInstance} from "axios";
import {addConverters, baseConfig} from "@common/config/AxiosConfig.ts";
import {SignInResponse} from "@identity/auth/types/response/SignInResponse.ts";
import {RefreshTokenResponse} from "@identity/auth/types/response/RefreshTokenResponse.ts";


class AuthClient {
    private axios: AxiosInstance;

    constructor() {
        this.axios = addConverters(axios.create({...baseConfig, baseURL: baseConfig.baseURL + "/oauth"}));
    }

    async login(payload: SignInRequest): Promise<SignInResponse> {
        const response = await this.axios.post<SignInResponse>('/login', payload);
        return response.data;
    }

    async logout(): Promise<void> {
        // removes refresh token from the cookie
        await this.axios.post<SignInResponse>('/logout');
    }

    async refreshAccessToken(): Promise<RefreshTokenResponse> {
        // given that refresh_token is set in the cookie
        return this.axios.post<RefreshTokenResponse>(
            '/tokens/access',
        ).then(resp => resp.data);
    }
}

export default new AuthClient();