package bitecode.modules.payment.payment.provider.stripe.model;

import com.stripe.model.Customer;

public record CustomerPair(Customer customer, StripeCustomer customerEntity) {
}