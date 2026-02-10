import {User} from "@identity/user/types/model/User.ts";

export interface RefreshTokenResponse {
    user: User;
    accessToken: string;
}
