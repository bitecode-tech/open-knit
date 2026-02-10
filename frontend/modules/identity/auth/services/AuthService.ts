import AuthClient from "@identity/auth/clients/http/AuthClient.ts";
import {jwtDecode} from "jwt-decode";
import axios, {AxiosInstance, CreateAxiosDefaults} from "axios";
import {SignInState} from "@identity/auth/types/enums/SignInState.ts";
import {addConverters} from "@common/config/AxiosConfig.ts";
import {MfaMethod} from "@identity/user/types/model/MfaMethod.ts";
import {User} from "@identity/user/types/model/User.ts";

class AuthService {
    private user: User | null = null;
    private accessToken: string | null = null;
    private accessTokenExpDate: Date | null = null;

    get isLoggedIn(): boolean {
        return this.user !== null && this.accessToken !== null && this.accessTokenExpDate !== null;
    }

    getUser(): User | null {
        return this.user;
    }

    public async login(username: string, password: string, rememberDevice: boolean, mfaCode?: string): Promise<SignInState> {
        try {
            const resp = await AuthClient.login({username, password, rememberDevice, mfaCode});
            if (!resp.accessToken) {
                if (resp.emailVerificationRequired) {
                    return SignInState.EMAIL_VALIDATION_REQUIRED;
                } else if (resp.mfaRequired) {
                    if (resp.mfaMethod === MfaMethod.QR_CODE) {
                        return SignInState.MFA_REQUIRED_APP;
                    } else if (resp.mfaMethod === MfaMethod.EMAIL) {
                        return SignInState.MFA_REQUIRED_EMAIL;
                    } else {
                        throw new Error("Unhandled MFA method")
                    }
                }
                throw new Error("Unhandled login response")
            }
            this.user = resp.user ?? null;
            this.accessToken = resp.accessToken;
            this.setAccessTokenExpTime();
            return SignInState.SUCCESS;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 401) {
                    return SignInState.INVALID_LOGIN_DETAILS
                }
            }
            throw error;
        }
    }

    public async refreshAccessToken(): Promise<boolean> {
        try {
            const resp = await AuthClient.refreshAccessToken();
            this.accessToken = resp.accessToken;
            this.user = resp.user;
            this.setAccessTokenExpTime();
            return true;
        } catch (error) {
            console.error('Token refresh failed:', error);
            return false;
        }
    }

    public createAuthenticatedClientInstance(config: CreateAxiosDefaults, endpoint: string) {
        const axiosInstance = axios.create({...config, baseURL: config.baseURL + endpoint});
        return this.addAuthorizationInterceptor(axiosInstance);
    }

    public addAuthorizationInterceptor(axios: AxiosInstance) {
        axios.interceptors.request.use(async (config) => {
            if (this.accessToken && this.accessTokenExpDate) {
                const currentTime = Date.now();
                if (this.accessTokenExpDate.getTime() - currentTime >= 10 * 1000) {
                    config.headers.Authorization = `Bearer ${this.accessToken}`;
                    return config;
                }
            }
            try {
                await this.refreshAccessToken();
            } catch (error) {
                void this.logout();
                throw error;
            }
            if (this.accessToken) {
                config.headers.Authorization = `Bearer ${this.accessToken}`;
            }
            return config;
        })
        addConverters(axios);
        return axios;
    }

    private setAccessTokenExpTime() {
        if (!this.accessToken) {
            throw new Error("AuthService: Access token cannot be null");
        }
        const decoded = jwtDecode(this.accessToken)
        if (!decoded.exp) {
            throw new Error("Token expired without exp!!!");
        }
        this.accessTokenExpDate = new Date(decoded.exp * 1000);
    }

    public async logout(): Promise<void> {
        return AuthClient.logout()
            .then(() => {
                this.user = null;
                this.accessToken = null;
                this.accessTokenExpDate = null;
            })
    }
}

export default new AuthService();
