import type {ChoiceOption} from "@app/pages/index/types";

export const configurationOptions: ChoiceOption[] = [
    {
        id: "bundles",
        title: "Bundles (recommended)",
        description: "Choose a prebuilt system template"
    },
    {
        id: "modules",
        title: "Modules",
        description: "Pick individual modules and build your stack from scratch."
    },
    {
        id: "ready-systems",
        title: "Ready systems",
        description: "White-label systems—70% complete, with your core logic on top."
    }
];

export const systemOptionsByConfiguration: Record<string, ChoiceOption[]> = {
    bundles: [
        {
            id: "subscription-access",
            title: "Subscription Access",
            description: "Create plans, manage subscriptions, and control what users can see or use."
        },
        {
            id: "value-ledger",
            title: "Value Ledger",
            description: "Record value movements with clear entries, timestamps, and a complete audit trail."
        },
        {
            id: "tradebook",
            title: "Tradebook",
            description: "Track transfers and swaps between parties, assets or resources."
        },
        {
            id: "ai-assistant",
            title: "AI assistant",
            description: "AI assistant, vector store, ingestion, and admin tooling."
        }
    ],
    modules: [
        {
            id: "identity-module",
            title: "Identity module",
            description: "Auth, users, roles, and access control."
        },
        {
            id: "payments-module",
            title: "Payment",
            description: "Payment/Subscription processing connector (currently only Stripe)."
        },
        {
            id: "wallet-module",
            title: "Wallet",
            description: "Flexible ledger for multi-currency accounting and balances."
        },
        {
            id: "transaction-module",
            title: "Transaction",
            description: "Transaction history, status tracking, and audit-ready records."
        },
        {
            id: "ai-module",
            title: "AI module",
            description: "Multi-modal assistant, prompts, and knowledge base (provider-agnostic)."
        }
    ],
    "ready-systems": [
        {
            id: "smart-invoicing",
            title: "Smart Invoicing",
            description: "AI-powered OCR and invoice processing with custom categorization for clear income/expense tracking."
        },
        {
            id: "membership-platform",
            title: "Membership Platform",
            description: "Gate content and features behind subscriptions, with full customer and subscription management."
        }
    ]
};

export const lockedModuleIds = ["identity-module"];

export const moduleIdToBackendName: Record<string, string> = {
    "identity-module": "identity",
    "payments-module": "payment",
    "wallet-module": "wallet",
    "transaction-module": "transaction",
    "ai-module": "ai"
};

export const bundleModules: Record<string, string[]> = {
    "subscription-access": ["identity", "wallet", "transaction", "payment"],
    "value-ledger": ["identity", "wallet", "transaction"],
    "tradebook": ["identity", "transaction"],
    "ai-assistant": ["identity", "ai"]
};
