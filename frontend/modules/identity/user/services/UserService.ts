import UserClient from "@identity/user/clients/http/UserClient.ts";
import {SignUpState} from "@identity/auth/types/enums/SignUpState.ts";
import {ChangePasswordState} from "@identity/auth/types/enums/ChangePasswordState.ts";
import {MfaMethod} from "@identity/user/types/model/MfaMethod.ts";
import {SetupMfaMethodDetails} from "@identity/user/types/model/SetupMfaMethodDetails.ts";
import {User} from "@identity/user/types/model/User.ts";
import {UserData} from "@identity/user/types/model/UserData.ts";

class UserService {
    public QUERY_KEYS = {
        GET_USER: (id: number | string) => ['users', id] as const,
        GET_USER_DATA: (id: number | string) => ['users_data', id] as const,
    }

    public async signUp(email: string, password: string): Promise<SignUpState | null> {
        const {response, error} = await UserClient.signUp({email, password})
        if (response) {
            return response.data.emailConfirmed ? SignUpState.SUCCESS : SignUpState.EMAIL_VALIDATION_REQUIRED
        }
        const errResp = error!.response!;
        if (errResp?.status === 409) {
            return SignUpState.USER_ALREADY_EXISTS;
        }
        return null;
    }

    public async resendAccountConfirmationEmail(email: string) {
        return await UserClient.resendAccountConfirmationEmail(email);
    }

    public async confirmEmail(verificationCode: string): Promise<void> {
        return await UserClient.confirmEmail(verificationCode);
    }

    public async getSelf(): Promise<User> {
        return await UserClient.getSelf();
    }

    public async setMfaMethod(mfaMethod: MfaMethod, code?: string): Promise<SetupMfaMethodDetails> {
        return await UserClient.setMfaMethod({mfaMethod, code});
    }

    public async requestForgotPasswordLink(email: string): Promise<void> {
        void await UserClient.requestForgottenPasswordReset(email);
    }

    public async resetForgotPassword(verificationCode: string, newPassword: string): Promise<void> {
        void await UserClient.resetForgottenPassword({newPassword, verificationCode});
    }

    public async changePassword(newPassword: string, oldPassword?: string): Promise<ChangePasswordState> {
        const resp = await UserClient.changePassword({oldPassword, newPassword});
        if (resp.status === 400) {
            return ChangePasswordState.PASSWORDS_MUST_BE_EQUAL;
        }
        return ChangePasswordState.SUCCESS;
    }

    public async getUserData(): Promise<UserData> {
        return UserClient.getUserData()
    }

    public async changeUserData(name?: string, surname?: string): Promise<void> {
        return UserClient.updateUserData({name, surname})
    }
}

export default new UserService();