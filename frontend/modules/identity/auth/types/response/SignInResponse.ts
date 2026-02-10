import {MfaMethod} from "@identity/user/types/model/MfaMethod.ts";
import {User} from "@identity/user/types/model/User.ts";

export interface SignInResponse {
    user?: User;
    accessToken?: string;
    mfaRequired?: boolean;
    mfaMethod?: MfaMethod;
    emailVerificationRequired?: boolean
}
