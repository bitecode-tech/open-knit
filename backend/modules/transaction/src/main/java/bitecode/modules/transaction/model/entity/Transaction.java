package bitecode.modules.transaction.model.entity;

import bitecode.modules._common.model.entity.UuidBaseEntity;
import bitecode.modules._common.shared.transaction.model.enums.*;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Entity
@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(schema = "transaction")
public class Transaction extends UuidBaseEntity {
    private UUID userId;
    private UUID paymentId;
    @Column(name = "\"type\"")
    @Enumerated(EnumType.STRING)
    private TransactionType type;
    @Enumerated(EnumType.STRING)
    private TransactionStatus status;
    @Enumerated(EnumType.STRING)
    private TransactionSubstatus subStatus;
    private BigDecimal debitTotal;
    @Enumerated(EnumType.STRING)
    private TransactionDebitType debitType;        // ex bank transfer/card/wallet/wallet-transfer
    private String debitSubtype;                   // ex transfer provider or fiat/crypto
    private String debitCurrency;                  // name of the debited thing, ex. PLN
    private String debitReferenceId;               //credited PRODUCT/SERVICE id for reference, i.e TEXT_TO_IMAGE generation uuid
    private BigDecimal creditTotal;
    @Enumerated(EnumType.STRING)
    private TransactionCreditType creditType;
    private String creditSubtype;                   //name of the credited product, 1H_RESERVATION, PLN
    private String creditCurrency;
    private String creditReferenceId;               //credited PRODUCT/SERVICE id for reference, i.e TEXT_TO_IMAGE generation uuid

    @OrderBy("id DESC")
    @OneToMany
    @JoinColumn(name = "transactionId", referencedColumnName = "id")
    private List<TransactionEvent> events;
}
