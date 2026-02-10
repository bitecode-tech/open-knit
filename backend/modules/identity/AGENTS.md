## Identity Module

### What this module is

Identity is the authentication and user-account boundary. It owns login/session lifecycle, refresh/access tokens, user registration and verification, password recovery, MFA setup,
OAuth2 identity linking, and admin user/account operations.

### Domain scope

- Owned capabilities:
    - authentication (`/oauth` login/logout/refresh)
    - user account lifecycle (sign up, email confirmation, profile update, password change/reset)
    - MFA setup and verification (email and TOTP)
    - OAuth2 provider sign-in linking
    - admin user management and refresh-token revocation
- Owned entities/value objects:
    - `auth.user`, `auth.user_data`, `auth.user_roles`, `auth.role`
    - `auth.user_refresh_token`, `auth.user_totp_secret`, `auth.oauth_identity`
- Non-owned areas:
    - payment/transaction/wallet/ai business domains
- Boundary rules:
    - exposes user-read facade via `_common` `UserServiceFacade`
    - other modules should use user UUID/contracts, not auth internals
    - security/auth logic stays inside this module

### Core flows

1. Sign-in and token issue
    - Trigger: `POST /oauth/login`
    - Steps: validate credentials, enforce email verification and MFA, mint refresh token, mint access token, set refresh cookie.
    - Output: `SignInResponse` with access token and user details.
    - Failure/edge cases: unverified email, invalid MFA code, unsupported MFA method, auth failure.
2. Access token refresh
    - Trigger: `POST /oauth/tokens/access` with `refreshTokenId` cookie.
    - Steps: validate refresh token UUID and expiry/revocation, load user, mint access token.
    - Output: `RefreshTokenResponse`.
    - Failure/edge cases: missing cookie, revoked/expired token, missing user.
3. User registration and email verification
    - Trigger: `POST /users` then `POST /users/confirmations/{verificationCode}`.
    - Steps: create user+default role+userData, send verification email with code, confirm and mark `emailConfirmed=true`.
    - Output: registered/confirmed user account.
    - Failure/edge cases: existing account, rate-limited verification requests, invalid confirmation code.
4. MFA setup and login verification
    - Trigger: `PUT /users/mfa` and login with MFA-enabled account.
    - Steps: configure EMAIL/QR TOTP method, issue verification challenge on login, validate code.
    - Output: MFA-enabled sign-in.
    - Failure/edge cases: bad code, unsupported method, QR generation errors.
5. Forgotten password recovery
    - Trigger: `POST /users/passwords/recovery/{username}` and `POST /users/passwords/recovery`.
    - Steps: generate one-time verification token, email reset link, verify token, update hashed password.
    - Output: password reset completed.
    - Failure/edge cases: unknown user, invalid/expired code, email send failure.
6. OAuth2 sign-in and account linking
    - Trigger: OAuth2 success callback.
    - Steps: resolve provider identity, link to existing user or create new confirmed user, issue refresh cookie, redirect with access token.
    - Output: authenticated user session.
    - Failure/edge cases: unsupported provider, malformed provider attributes.
7. Admin user management
    - Trigger: `/admin/users` endpoints.
    - Steps: search/filter users, fetch statistics, invite/create user with role and temp password.
    - Output: admin-managed account lifecycle.
    - Failure/edge cases: duplicate email, unknown role.

### Data ownership

- Schema(s): `auth`.
- Main tables/entities:
    - `auth."user"` (`User`)
    - `auth.user_data` (`UserData`)
    - `auth.user_roles` (`UserRole`)
    - `auth.role` (`Role`)
    - `auth.user_refresh_token` (`RefreshToken`)
    - `auth.user_totp_secret` (`TOTPSecret`)
    - `auth.oauth_identity` (`OauthIdentity`)
- Audit/event tables:
    - none as dedicated event-sourcing tables; token and oauth tables act as security state/history records.

### Public API surface

- Controllers/routes:
    - `AuthController`: `/oauth`
        - `POST /login`, `POST /logout`, `POST /tokens/access`
    - `AdminAuthController`: `/admin/oauth`
        - `DELETE /tokens/refresh?username=...`
    - `UserController`: `/users`
        - `GET /self`, `POST /`, `POST /confirmations`, `POST /confirmations/{verificationCode}`
        - `PUT /mfa`, `GET /data`, `PATCH /data`
        - `POST /passwords/recovery/{username}`, `POST /passwords/recovery`, `PUT /passwords`
    - `AdminUserController`: `/admin/users`
        - `GET /statistics`, `GET /`, `POST /invite`
- Consumed events/commands:
    - none from other modules.
- Emitted events/commands:
    - none as `_common` `ModuleEvent` contracts.
- Exposed facades/interfaces:
    - `_common` `UserServiceFacade` implemented by `UserServiceFacadeImpl`.

### Integrations and dependencies

- Internal module dependencies:
    - `_common` cache, email, base entities, security annotations, shared identity DTO/facade contracts.
- External integrations:
    - Spring Security (JWT filter + method security)
    - OAuth2/OIDC providers (Google implementation)
    - JavaMail + Thymeleaf templates for transactional emails
    - TOTP library for QR/secret verification
- Communication style (event-driven or direct facade):
    - direct HTTP API for identity operations
    - direct facade for cross-module user lookups

### Class and Type Catalog

#### config

- `AuthFlywayMigrationConfig`: registers Flyway migrations for `auth` and optional `auth_seed`.
- `IdentityDemoInsertsConfig`: demo inserts runner for identity data and seeded-password override.
- `JpaAuditingConfig`: enables JPA auditing dates for identity entities.
- `SecurityConfig`: configures auth filter chain, CORS/auth rules, and endpoint security.
- `TOTPConfig`: wires TOTP verifier/generator beans from `totp.*` settings.
- `AuthGlobalExceptionHandler`: module-specific auth exception mapping.
- `JwtAuthFilter`: parses JWT from request and sets Spring Security authentication.
- `RequestLoggingFilter`: request-level logging filter for auth endpoints.
- `AuthProperties`: root typed config (`bitecode.*`) for auth/security/app.
- `TOTPProperties`: typed config for TOTP issuer/secret/code/time.
- `IdentityAppProperties`: app URLs and user-path settings for identity links.
- `SecurityProperties`: no-auth URL patterns and JWT-related settings.
- `UserProperties`: user invite/confirmation/reset URL path settings.
- `ResetPasswordProperties`: forgotten-password frontend URL path config.

#### controller

- `AuthController`: login/logout/access-token-refresh HTTP API.
- `AdminAuthController`: admin endpoint for refresh-token revocation by username.
- `UserController`: self-user/profile/MFA/password/verification endpoints.
- `AdminUserController`: admin user listing/statistics/invite endpoints.

#### service

- `AuthService`: authentication orchestration with MFA checks and token issuance.
- `JwtService`: JWT generation/validation and refresh-token persistence/revocation.
- `OAuth2ProvidersService`: OAuth2 user loading, identity linking, success redirect token issuance.
- `TOTPService`: TOTP QR/secret generation and code verification.
- `UserService`: user lifecycle domain logic and `UserDetailsService` implementation.
- `AdminUserService`: admin-level user querying, invitation, and managed account creation.
- `AdminAuthService`: admin auth operations (refresh-token revoke).
- `UserServiceFacadeImpl`: bridge from identity internals to `_common` `UserServiceFacade`.

#### provider

- `OAuth2Provider`: provider abstraction for extracting provider user identity fields.
- `OAuth2GoogleProvider`: Google-specific OAuth2 provider mapping implementation.

#### repository

- `UserRepository`: primary user repository with custom criteria and fetch variants.
- `CustomUserRepository`: custom user query contract.
- `CustomUserRepositoryImpl`: QueryDSL custom repository implementation.
- `RoleRepository`: role lookup/persistence repository.
- `RefreshTokenRepository`: refresh-token lookup and active-token queries.
- `TOTPSecretRepository`: TOTP secret persistence by user.
- `OauthIdentityRepository`: OAuth identity mapping repository.

#### model/entity

- `User`: core account aggregate with credentials, roles, MFA flags, and profile relation.
- `UserData`: profile details entity linked 1:1 to `User`.
- `UserRole`: join entity between user and role.
- `Role`: granted authority entity.
- `RefreshToken`: persisted long-lived token reference.
- `TOTPSecret`: stored per-user TOTP shared secret.
- `OauthIdentity`: provider identity mapping linked to user.
- `MinimalUser`: lightweight user projection container.

#### model/request|response|data|enum

- `SignInRequest`: login credentials + MFA input request.
- `SignInResponse`: login response payload with tokens/user flags.
- `RefreshTokenResponse`: access-token refresh response payload.
- `AuthenticatedUserDetails`: auth service result object used during sign-in flow.
- `MfaMethod`: identity-local MFA enum (`EMAIL`, `QR_CODE`, `DISABLE`).
- `UpdateUserDataRequest`: user profile update request.
- `SignUpRequest`: registration request.
- `SetMfaRequest`: MFA setup request.
- `ChangePasswordRequest`: authenticated password change request.
- `InitForgottenPasswordRequest`: forgotten-password init payload.
- `ResetForgottenPasswordRequest`: forgotten-password completion payload.
- `ResendVerificationEmailRequest`: request to resend verification link.
- `InviteUserRequest`: admin invite/create user payload.
- `FindUsersCriteria`: admin filtering criteria for user listing.
- `SetupMfaMethodDetails`: MFA setup result payload.

#### model/mapper

- `AuthenticatedUserMapper`: maps auth internal data to auth response DTOs.
- `UserMapper`: maps user entities to shared user details contract and back.
- `UserDataMapper`: maps/patches user profile structures.

#### util

- `PasswordUtils`: password hashing and verification helpers.

### Configuration

- `bitecode.security.jwt.*`: secret key and token expirations.
- `bitecode.app.frontend-url` / `bitecode.app.backend-url`: app URLs used for redirects and links.
- `bitecode.app.user.confirm-email-url-path`: email confirmation frontend path.
- `bitecode.app.user.user-invite-url-path`: invite frontend path.
- `bitecode.app.user.password-reset.forgotten-password-link-url-path`: password reset frontend path.
- `totp.*`: MFA TOTP generation/validation settings.
- `flyway.seed.data=true|false`: enables `auth_seed` Flyway migration stream.
- `DEMO_INSERTS_ENABLED=true|false`: enables demo inserts runner.

### Testing notes

- Main test classes:
    - `bitecode/modules/auth/_config/AuthIntegrationTest.java`
    - `bitecode/modules/auth/auth/AuthTest.java`
    - `bitecode/modules/auth/auth/AuthAdminTest.java`
    - `bitecode/modules/auth/user/UserTest.java`
- Must-cover scenarios:
    - login/token refresh and cookie behavior
    - email verification + resend rate limiting
    - forgotten password reset and invalid token handling
    - MFA email/TOTP setup and validation
    - admin user invite and filter endpoints
- Special setup:
    - integration tests rely on common test container setup from `_common`.

### Change log expectations

- Update this file whenever flows/domain/API/integrations/boundaries/classes materially change.
- Treat this update as required for module development.
