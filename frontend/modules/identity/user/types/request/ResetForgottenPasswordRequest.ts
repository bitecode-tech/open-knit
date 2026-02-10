export interface ResetForgottenPasswordRequest {
    verificationCode: string;
    newPassword: string;
}