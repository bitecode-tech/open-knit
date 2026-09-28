import type {ChoiceOption} from "@app/pages/index/types";

export type ModuleSlug = "identity" | "payment" | "wallet" | "transaction" | "ai" | "ocr" | "documents";

export type ModuleSummary = {
    optionId: string;
    slug: ModuleSlug;
    backendName: string;
    title: string;
    shortDescription: string;
    heroDescription: string;
    imagePath: string;
    imageAlt: string;
    capabilities: string[];
    configurationHighlights: string[];
    frontendModulePath: string | null;
    frontendReadmePath: string | null;
    backendModulePath: string;
    backendGuidePath: string;
    isLocked: boolean;
};

export type BundleDefinition = ChoiceOption & {
    includedModuleSlugs: ModuleSlug[];
};

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
        title: "Planned system templates",
        description: "Choose a preconfigured system for the interest list. These templates are not downloadable yet."
    }
];

export const moduleSummaries: ModuleSummary[] = [
    {
        optionId: "identity-module",
        slug: "identity",
        backendName: "identity",
        title: "Identity module",
        shortDescription: "Auth, users, roles, and access control.",
        heroDescription: "Authentication and account lifecycle foundation for apps that need secure sign-in, user management, and access rules.",
        imagePath: "/module-screens/identity.jpg",
        imageAlt: "OpenKnit identity module users management screen",
        capabilities: [
            "Login, logout, refresh tokens, and session lifecycle",
            "User registration, verification, password reset, and profile flows",
            "MFA, OAuth2 sign-in, and admin user management"
        ],
        configurationHighlights: [
            "JWT and auth security settings under `bitecode.security.jwt.*`",
            "Frontend/backend app URLs used for redirects and email flows",
            "User invite, confirmation, and reset URL path settings"
        ],
        frontendModulePath: "frontend/modules/identity",
        frontendReadmePath: "frontend/modules/identity/_scaffolder/README.md",
        backendModulePath: "backend/modules/identity",
        backendGuidePath: "backend/modules/identity/AGENTS.md",
        isLocked: true
    },
    {
        optionId: "payments-module",
        slug: "payment",
        backendName: "payment",
        title: "Payment",
        shortDescription: "Payment/Subscription processing connector (currently only Stripe).",
        heroDescription: "Payment and subscription orchestration for plans, checkout flows, provider execution, and billing lifecycle management.",
        imagePath: "/module-screens/transaction-details.jpg",
        imageAlt: "OpenKnit payment transaction details screen",
        capabilities: [
            "Payment records, status updates, and audit history",
            "Subscription plans, checkout setup, and recurring billing lifecycle",
            "Provider integrations with Stripe webhook processing"
        ],
        configurationHighlights: [
            "Stripe provider settings under `bitecode.app.payment.provider.stripe.*`",
            "Frontend base URL used for checkout redirects",
            "Optional demo inserts for plans and payment flows"
        ],
        frontendModulePath: "frontend/modules/payment",
        frontendReadmePath: "frontend/modules/payment/_scaffolder/README.md",
        backendModulePath: "backend/modules/payment",
        backendGuidePath: "backend/modules/payment/AGENTS.md",
        isLocked: false
    },
    {
        optionId: "wallet-module",
        slug: "wallet",
        backendName: "wallet",
        title: "Wallet",
        shortDescription: "Flexible ledger for multi-currency accounting and balances.",
        heroDescription: "Internal balance and asset accounting module for systems that need wallet totals, balance mutations, and audited asset events.",
        imagePath: "/module-screens/wallet.jpg",
        imageAlt: "OpenKnit dashboard screenshot representing the wallet module context",
        capabilities: [
            "Per-user wallet and asset balance ownership",
            "Command-driven balance changes with before/after auditing",
            "Multi-currency or multi-asset accounting primitives"
        ],
        configurationHighlights: [
            "Flyway migrations under the `wallet` schema",
            "Command/event-style balance mutation handlers",
            "No public HTTP controller yet, intended as internal infrastructure"
        ],
        frontendModulePath: null,
        frontendReadmePath: null,
        backendModulePath: "backend/modules/wallet",
        backendGuidePath: "backend/modules/wallet/AGENTS.md",
        isLocked: false
    },
    {
        optionId: "transaction-module",
        slug: "transaction",
        backendName: "transaction",
        title: "Transaction",
        shortDescription: "Transaction history, status tracking, and audit-ready records.",
        heroDescription: "Ledger-style transaction tracking for admin views, payment-driven state transitions, and audit-ready command history.",
        imagePath: "/module-screens/transaction.jpg",
        imageAlt: "OpenKnit transaction history screen",
        capabilities: [
            "Transaction creation and status updates from payment events",
            "Persistent event history for command handling",
            "Admin list, statistics, and detail endpoints"
        ],
        configurationHighlights: [
            "Flyway migration path under the `transaction` schema",
            "Event-driven integration with the payment module",
            "Optional demo inserts for transaction seed data"
        ],
        frontendModulePath: "frontend/modules/transaction",
        frontendReadmePath: "frontend/modules/transaction/_scaffolder/README.md",
        backendModulePath: "backend/modules/transaction",
        backendGuidePath: "backend/modules/transaction/AGENTS.md",
        isLocked: false
    },
    {
        optionId: "ai-module",
        slug: "ai",
        backendName: "ai",
        title: "AI module",
        shortDescription: "Multi-modal assistant, prompts, and knowledge base (provider-agnostic).",
        heroDescription: "Configurable AI agents, chat workflows, provider settings, and knowledge ingestion for AI-enabled products.",
        imagePath: "/module-screens/ai.jpg",
        imageAlt: "OpenKnit AI assistant interface",
        capabilities: [
            "AI agent configuration, prompts, and access controls",
            "Chat sessions, streaming, uploads, and transcription",
            "Knowledge ingestion, vector references, and provider management"
        ],
        configurationHighlights: [
            "Provider configuration for OpenAI, Ollama, and Azure paths",
            "RAG/vector-store setup and knowledge document flow",
            "ChatKit and public/open endpoint configuration for agent access"
        ],
        frontendModulePath: "frontend/modules/ai",
        frontendReadmePath: "frontend/modules/ai/_scaffolder/README.md",
        backendModulePath: "backend/modules/ai",
        backendGuidePath: "backend/modules/ai/AGENTS.md",
        isLocked: false
    },
    {
        optionId: "ocr-module",
        slug: "ocr",
        backendName: "ocr",
        title: "OCR module",
        shortDescription: "Extract structured text from uploaded files with configurable OCR instructions.",
        heroDescription: "OCR execution, provider configuration, saved extraction instructions, and persisted result history for document-processing workflows.",
        imagePath: "/module-screens/ai.jpg",
        imageAlt: "OpenKnit OCR processing interface",
        capabilities: [
            "User-owned OCR instructions with reusable extraction prompts",
            "OCR execution against uploaded files with provider validation",
            "Persisted OCR results plus admin-level provider configuration and oversight"
        ],
        configurationHighlights: [
            "OpenAI OCR model selection under `bitecode.ocr.open-ai.model`",
            "Provider configuration and API key management through the OCR admin endpoints",
            "OCR result persistence in the dedicated `ocr` schema"
        ],
        frontendModulePath: "frontend/modules/ocr",
        frontendReadmePath: null,
        backendModulePath: "backend/modules/ocr",
        backendGuidePath: "backend/modules/ocr/AGENTS.md",
        isLocked: false
    },
    {
        optionId: "documents-module",
        slug: "documents",
        backendName: "document",
        title: "Documents module",
        shortDescription: "Upload, store, list, download, and delete user-owned documents.",
        heroDescription: "Document storage and retrieval module with pluggable adapters, owner scoping, metadata persistence, and admin document management.",
        imagePath: "/module-screens/payment.jpg",
        imageAlt: "OpenKnit documents management interface",
        capabilities: [
            "Upload documents with metadata persistence and checksum tracking",
            "Owner-scoped list, details, download, and delete flows",
            "Pluggable local or S3-compatible storage adapters with admin oversight"
        ],
        configurationHighlights: [
            "Default storage adapter under `bitecode.document.storage.default-storage-type`",
            "Local filesystem storage base path or S3-compatible bucket settings",
            "Document metadata persistence in the dedicated `document` schema"
        ],
        frontendModulePath: "frontend/modules/document",
        frontendReadmePath: null,
        backendModulePath: "backend/modules/document",
        backendGuidePath: "backend/modules/document/AGENTS.md",
        isLocked: false
    }
];

export const bundleDefinitions: BundleDefinition[] = [
    {
        id: "subscription-access",
        title: "Subscription Access",
        description: "Create plans, manage subscriptions, and control what users can see or use.",
        includedModuleSlugs: ["identity", "wallet", "transaction", "payment"]
    },
    {
        id: "value-ledger",
        title: "Value Ledger",
        description: "Record value movements with clear entries, timestamps, and a complete audit trail.",
        includedModuleSlugs: ["identity", "wallet", "transaction"]
    },
    {
        id: "tradebook",
        title: "Tradebook",
        description: "Track transfers and swaps between parties, assets or resources.",
        includedModuleSlugs: ["identity", "transaction"]
    },
    {
        id: "ai-assistant",
        title: "AI assistant",
        description: "AI assistant, vector store, ingestion, and admin tooling.",
        includedModuleSlugs: ["identity", "ai"]
    }
];

export const readySystemOptions: ChoiceOption[] = [
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
];

export const lockedModuleIds = moduleSummaries.filter((moduleSummary) => moduleSummary.isLocked).map((moduleSummary) => moduleSummary.optionId);

export const moduleIdToBackendName: Record<string, string> = Object.fromEntries(
    moduleSummaries.map((moduleSummary) => [moduleSummary.optionId, moduleSummary.backendName])
);

export const bundleModules: Record<string, string[]> = Object.fromEntries(
    bundleDefinitions.map((bundleDefinition) => [
        bundleDefinition.id,
        bundleDefinition.includedModuleSlugs.map((slug) => getModuleSummaryBySlug(slug)?.backendName).filter((backendName): backendName is string => Boolean(backendName))
    ])
);

export const systemOptionsByConfiguration: Record<string, ChoiceOption[]> = {
    bundles: bundleDefinitions,
    modules: moduleSummaries.map((moduleSummary) => ({
        id: moduleSummary.optionId,
        title: moduleSummary.title,
        description: moduleSummary.shortDescription
    })),
    "ready-systems": readySystemOptions
};

export function getModuleSummaryBySlug(slug: string): ModuleSummary | undefined {
    return moduleSummaries.find((moduleSummary) => moduleSummary.slug === slug);
}

export function getBundlesForModule(slug: ModuleSlug): BundleDefinition[] {
    return bundleDefinitions.filter((bundleDefinition) => bundleDefinition.includedModuleSlugs.includes(slug));
}
