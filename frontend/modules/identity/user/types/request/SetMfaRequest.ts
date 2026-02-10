import {MfaMethod} from "@identity/user/types/model/MfaMethod.ts";

export interface SetMfaRequest {
    mfaMethod: MfaMethod;
    code?: string;
}