package bitecode.modules.auth.user.admin.model.response;

public record AdminUserStatistics(
        long all,
        long registrationCompleted,
        long registrationIncomplete
) {
}
