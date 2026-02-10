import {MfaMethod} from "@identity/user/types/model/MfaMethod.ts";

export interface SetupMfaMethodDetails {
    mfaMethod: MfaMethod,
    completed: boolean,
    requiresConfirmation?: boolean,
    qrCodeImageUri?: string
}