import {MfaMethod} from "@identity/user/types/model/MfaMethod.ts";
import {UserData} from "@identity/user/types/model/UserData.ts";

export interface User {
    uuid: string;
    email: string;
    roles: string[];
    emailConfirmed: boolean;
    mfaEnabled?: boolean;
    mfaMethod?: MfaMethod;
    createdDate: string
    userData?: UserData,
    emptyPassword: boolean;
}