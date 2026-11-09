package bitecode.modules.transaction.model.data;

public record TransactionStatistics(
        long all,
        long completed,
        long incomplete
) {
}
