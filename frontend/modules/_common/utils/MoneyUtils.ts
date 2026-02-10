type NumberFormat = "usd";

export const formatMoney = (amount: number, precision = 2, symbol?: string, numberFormat?: NumberFormat) => {
    if (numberFormat) {
        return new Intl.NumberFormat("en-US", {style: "currency", currency: "USD"}).format(amount);
    }
    return `${symbol ?? ""}${amount.toFixed(precision)}`
}


export function calculateMonthlyEstimate(
    price: number,
    amount: number,
    paymentFrequency: number,
    frequencyType: "DAYS" | "WEEKS" | "MONTHS" | "YEARS",
): number {
    const AVG_DAYS_PER_MONTH = 365 / 12;          // ~30.4167
    const AVG_WEEKS_PER_MONTH = AVG_DAYS_PER_MONTH / 7; // ~4.3452

    switch (frequencyType) {
        case "DAYS":
            return (price * amount * AVG_DAYS_PER_MONTH) / paymentFrequency;
        case "WEEKS":
            return (price * amount * AVG_WEEKS_PER_MONTH) / paymentFrequency;

        case "MONTHS":
            return price * amount / paymentFrequency;

        case "YEARS":
            return price * amount / (paymentFrequency * 12);
    }
}