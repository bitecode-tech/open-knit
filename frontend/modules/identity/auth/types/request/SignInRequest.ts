export interface SignInRequest {
    username: string;
    password: string;
    rememberDevice: boolean,
    mfaCode?: string;
}