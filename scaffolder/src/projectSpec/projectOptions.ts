import {defaultProjectSpecValues, targetPlatforms, type TargetPlatform} from "./projectSpec";

interface ModuleOptionDefinition {
    id: string;
    title: string;
    description: string;
    dependencies: readonly string[];
    required?: boolean;
}

interface BundleOptionDefinition {
    id: string;
    title: string;
    description: string;
    modules: readonly string[];
}

const moduleOptionDefinitions: readonly ModuleOptionDefinition[] = [
    {
        id: "identity",
        title: "Identity module",
        description: "Auth, users, roles, and access control.",
        dependencies: [],
        required: true
    },
    {
        id: "payment",
        title: "Payment",
        description: "Payment/Subscription processing connector (currently only Stripe).",
        dependencies: []
    },
    {
        id: "wallet",
        title: "Wallet",
        description: "Flexible ledger for multi-currency accounting and balances.",
        dependencies: []
    },
    {
        id: "transaction",
        title: "Transaction",
        description: "Transaction history, status tracking, and audit-ready records.",
        dependencies: []
    },
    {
        id: "ai",
        title: "AI module",
        description: "Multi-modal assistant, prompts, and knowledge base (provider-agnostic).",
        dependencies: []
    },
    {
        id: "ocr",
        title: "OCR module",
        description: "Extract structured text from uploaded files with configurable OCR instructions.",
        dependencies: []
    },
    {
        id: "document",
        title: "Documents module",
        description: "Upload, store, list, download, and delete user-owned documents.",
        dependencies: []
    }
];

const bundleOptionDefinitions: readonly BundleOptionDefinition[] = [
    {
        id: "subscription-access",
        title: "Subscription Access",
        description: "Create plans, manage subscriptions, and control what users can see or use.",
        modules: ["identity", "wallet", "transaction", "payment"]
    },
    {
        id: "value-ledger",
        title: "Value Ledger",
        description: "Record value movements with clear entries, timestamps, and a complete audit trail.",
        modules: ["identity", "wallet", "transaction"]
    },
    {
        id: "tradebook",
        title: "Tradebook",
        description: "Track transfers and swaps between parties, assets or resources.",
        modules: ["identity", "transaction"]
    },
    {
        id: "ai-assistant",
        title: "AI assistant",
        description: "AI assistant, vector store, ingestion, and admin tooling.",
        modules: ["identity", "ai"]
    }
];

export interface ProjectOptionCatalog {
    schemaVersion: 1;
    requiredFields: readonly string[];
    defaults: {
        projectName: string;
        demoInsertsEnabled: boolean;
    };
    targetPlatforms: readonly {
        id: TargetPlatform;
        description: string;
        composeTemplate: string;
    }[];
    modules: readonly {
        id: string;
        title: string;
        description: string;
        dependencies: readonly string[];
        required: boolean;
        defaultSelected: boolean;
    }[];
    moduleAliases: readonly {
        id: string;
        canonicalModuleId: string;
    }[];
    templates: readonly {
        id: string;
        title: string;
        description: string;
        modules: readonly string[];
    }[];
    automaticallyIncludedModules: readonly string[];
    unsupportedOptions: readonly {
        id: string;
        reason: string;
    }[];
    behavior: {
        remoteGeneration: string;
        demoInserts: string;
        platformSelection: string;
    };
}

const targetPlatformDescriptions: Record<TargetPlatform, {description: string; composeTemplate: string}> = {
    windows: {
        description: "Run Docker Compose from a Windows terminal with Docker Desktop. Compose Watch syncs project files into services.",
        composeTemplate: "docker-compose-windows.yml"
    },
    linux: {
        description: "Run Docker Compose on native Linux or a Linux Docker engine inside WSL. Bind mounts use Linux paths and host UID/GID.",
        composeTemplate: "docker-compose.yml"
    },
    macos: {
        description: "Run Docker Compose with Docker Desktop for macOS. Compose Watch syncs project files into services.",
        composeTemplate: "docker-compose-windows.yml"
    }
};

export function getProjectOptionCatalog(
    supportedModuleIds: readonly string[],
    moduleAliases: Readonly<Record<string, string>> = {}
): ProjectOptionCatalog {
    const supportedModules = new Set(supportedModuleIds.map((moduleId) => moduleId.toLowerCase()));
    const modules = moduleOptionDefinitions
        .filter((moduleOption) => supportedModules.has(moduleOption.id))
        .map((moduleOption) => ({
            ...moduleOption,
            required: moduleOption.required ?? false,
            defaultSelected: moduleOption.required ?? false
        }));
    const availableModuleIds = new Set(modules.map((moduleOption) => moduleOption.id));
    const templates = bundleOptionDefinitions
        .filter((template) => template.modules.every((moduleId) => availableModuleIds.has(moduleId)))
        .map((template) => ({
            ...template,
            modules: [...template.modules]
        }));
    const supportedAliases = Object.entries(moduleAliases)
        .filter(([, target]) => availableModuleIds.has(target.toLowerCase()))
        .map(([alias, target]) => ({alias: alias.toLowerCase(), target: target.toLowerCase()}));

    return {
        schemaVersion: 1,
        requiredFields: ["schemaVersion", "projectName", "modules", "targetPlatform"],
        defaults: {
            projectName: "my-application",
            demoInsertsEnabled: defaultProjectSpecValues.demoInsertsEnabled
        },
        targetPlatforms: targetPlatforms.map((targetPlatform) => ({
            id: targetPlatform,
            ...targetPlatformDescriptions[targetPlatform]
        })),
        modules: modules.map((moduleOption) => ({...moduleOption})),
        moduleAliases: supportedAliases.map(({alias, target}) => ({
            id: alias,
            canonicalModuleId: target
        })),
        templates,
        automaticallyIncludedModules: ["_common"],
        unsupportedOptions: [
            {
                id: "ready-systems",
                reason: "Ready-system concepts do not have complete generator templates yet."
            }
        ],
        behavior: {
            remoteGeneration: "The remote scaffolder returns a ZIP. It does not inspect, install, start, or deploy files on the caller's host.",
            demoInserts: "When enabled, generated backend configuration enables module demo inserts. This is a development seed option; change generated credentials before production use.",
            platformSelection: "Choose the platform where Docker Compose will run. WSL with a Linux Docker engine uses linux; WSL targeting Docker Desktop should run from the Windows project path and use windows."
        }
    };
}

export function isKnownTemplateId(templateId: string): boolean {
    return bundleOptionDefinitions.some((template) => template.id === templateId);
}

export function getTemplateModuleIds(templateId: string): readonly string[] | null {
    return bundleOptionDefinitions.find((template) => template.id === templateId)?.modules ?? null;
}

export function getSupportedModuleIds(): readonly string[] {
    return moduleOptionDefinitions.map((moduleOption) => moduleOption.id);
}
