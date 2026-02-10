export const paymentFrequencyTypeValues = [
    "DAYS",
    "WEEKS",
    "MONTHS",
    "YEARS",
] as const;

export type PaymentFrequencyType = typeof paymentFrequencyTypeValues[number];