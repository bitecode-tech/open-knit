package bitecode.modules.payment.payment;

import bitecode.modules._common.model.annotation.AdminAccess;
import bitecode.modules.payment.payment.model.data.details.PaymentDetails;
import bitecode.modules.payment.payment.model.mapper.PaymentMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PagedModel;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.HttpClientErrorException;

import java.util.UUID;

@Slf4j
@RestController
@AdminAccess
@RequestMapping("/admin/payments")
@RequiredArgsConstructor
public class AdminPaymentController {
    private final PaymentService paymentService;
    private final PaymentMapper paymentMapper;

    @GetMapping
    public PagedModel<PaymentDetails> getPayments(Pageable pageable, @RequestParam(defaultValue = "false") boolean includeEvents) {
        return new PagedModel<>(
                paymentService.findAll(pageable, includeEvents)
                        .map(paymentMapper::toPaymentDetails)
        );
    }

    @GetMapping("/{id}")
    public PaymentDetails getPayment(@PathVariable UUID id, @RequestParam(defaultValue = "false") boolean includeEvents) {
        return paymentService.findByUuid(id, includeEvents)
                .map(paymentMapper::toPaymentDetails)
                .orElseThrow(() -> new HttpClientErrorException(HttpStatus.NOT_FOUND));
    }
}
