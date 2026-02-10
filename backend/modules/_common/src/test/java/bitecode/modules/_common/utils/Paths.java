package bitecode.modules._common.utils;

import bitecode.modules.auth.auth.AuthController;
import bitecode.modules.auth.user.UserController;

import static bitecode.modules._common.config.WebConfig.PATH_PREFIX;

public interface Paths {
    // @formatter:off
    interface Auth {
        String basePath = PATH_PREFIX + AuthController.PATH_MAPPING;
        String adminBasePath = PATH_PREFIX + "/admin" + AuthController.PATH_MAPPING;

        interface POST {
            String signIn = basePath + "/login";
            String refreshToken = basePath + "/tokens/access";
        }

        interface DELETE {
            static String adminRevokeToken(String username) { return adminBasePath + "/tokens/refresh?username=" + username; }
        }
    }

    interface User {
        String basePath = PATH_PREFIX + UserController.PATH_MAPPING;

        interface GET {

        }

        interface POST {
            String signUp = basePath;
            String resetForgottenPassword = basePath + "/passwords/recovery";

            static String requestForgottenPassword(String userId) { return basePath + "/passwords/recovery/" + userId; }
            static String confirmEmail(String verificationCode) { return basePath + "/confirmations/" + verificationCode; }
        }

        interface PUT {
            String mfa = basePath + "/mfa";
        }
    }

    interface Payment {
        interface Provider {
            interface Stripe {
                interface POST {
                    String webhook = PATH_PREFIX + "/payments/webhooks/stripe";
                }
            }
        }
    }

    interface Notification {
        String adminBasePath = PATH_PREFIX + "/admin";
        interface Admin {

            interface POST {
                String notification = adminBasePath + "/notifications";
                String bulkNotification = adminBasePath + "/notifications/bulk";
                String notificationGroupsInitiate = adminBasePath + "/notifications/groups";
            }

        }
    }
    // @formatter:on
}
