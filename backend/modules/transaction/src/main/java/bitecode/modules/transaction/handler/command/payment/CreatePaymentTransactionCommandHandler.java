package bitecode.modules.transaction.handler.command.payment;

import bitecode.modules._common.eventsourcing.exception.UnappliedCommandException;
import bitecode.modules._common.model.event.ModuleEvent;
import bitecode.modules._common.shared.payment.model.enums.PaymentStatus;
import bitecode.modules._common.shared.payment.model.enums.PaymentType;
import bitecode.modules._common.shared.transaction.model.enums.*;
import bitecode.modules.transaction.handler.command.AbstractTransactionCommandHandler;
import bitecode.modules.transaction.model.command.payment.CreatePaymentTransactionCommand;
import bitecode.modules.transaction.model.entity.Transaction;
import bitecode.modules.transaction.model.mapper.TransactionMapper;
import bitecode.modules.transaction.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
@RequiredArgsConstructor
public class CreatePaymentTransactionCommandHandler extends AbstractTransactionCommandHandler<CreatePaymentTransactionCommand> {
    private final TransactionRepository repository;
    private final TransactionMapper mapper;

    @Override
    public Transaction handle(CreatePaymentTransactionCommand command, Map<String, Object> params) throws UnappliedCommandException {
        var newTxn = Transaction.builder()
                .userId(command.userId())
                .paymentId(command.paymentId())
                .status(command.paymentStatus() == PaymentStatus.CONFIRMED ? TransactionStatus.COMPLETED : TransactionStatus.PENDING)
                .subStatus(command.paymentStatus() == PaymentStatus.CONFIRMED ? TransactionSubstatus.DONE : TransactionSubstatus.AWAITS_PAYMENT_GATEWAY_UPDATE)
                .type(command.paymentType() == PaymentType.ONE_TIME ? TransactionType.PAYMENT : TransactionType.SUBSCRIPTION_PAYMENT)
                .debitTotal(command.amount())
                .debitType(TransactionDebitType.CARD)
                .debitCurrency(command.currency())
                .creditTotal(command.amount())
                .creditType(TransactionCreditType.PROVIDER_WALLET)
                .creditSubtype(command.paymentGateway().toString())
                .creditCurrency(command.currency())
                .build();
        return repository.save(newTxn);
    }

    @Override
    public ModuleEvent toModuleEvent(CreatePaymentTransactionCommand command, Transaction object, Map<String, Object> params) {
        return mapper.toNewTransactionCreatedCommand(object);
    }

    @Override
    public Class<CreatePaymentTransactionCommand> getCommandClass() {
        return CreatePaymentTransactionCommand.class;
    }
}
