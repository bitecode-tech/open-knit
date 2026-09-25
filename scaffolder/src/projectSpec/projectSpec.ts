import {getTemplateModuleIds, isKnownTemplateId} from "./projectOptions";

export type TargetPlatform = "windows" | "linux" | "macos";

export interface ProjectSpec {
    schemaVersion: 1;
    projectName: string;
    modules: string[];
    targetPlatform: TargetPlatform;
    demoInsertsEnabled: boolean;
    templateId?: string;
}

export interface ProjectSpecIssue {
    field: string;
    code: string;
    message: string;
}

export interface ProjectSpecValidationResult {
    valid: boolean;
    normalizedProjectSpec: ProjectSpec | null;
    errors: ProjectSpecIssue[];
}

export interface ProjectSpecValidationOptions {
    supportedModuleIds: readonly string[];
    moduleAliases?: Readonly<Record<string, string>>;
}

export const targetPlatforms: readonly TargetPlatform[] = ["windows", "linux", "macos"];

export const defaultProjectSpecValues = {
    demoInsertsEnabled: true
} as const;

const projectSpecFields = new Set([
    "schemaVersion",
    "projectName",
    "modules",
    "targetPlatform",
    "demoInsertsEnabled",
    "templateId"
]);

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function addIssue(errors: ProjectSpecIssue[], field: string, code: string, message: string): void {
    errors.push({field, code, message});
}

export function validateProjectSpec(
    input: unknown,
    options: ProjectSpecValidationOptions
): ProjectSpecValidationResult {
    const errors: ProjectSpecIssue[] = [];
    if (!isRecord(input)) {
        addIssue(errors, "projectSpec", "invalid_type", "Project spec must be an object.");
        return {valid: false, normalizedProjectSpec: null, errors};
    }

    for (const key of Object.keys(input)) {
        if (!projectSpecFields.has(key)) {
            addIssue(errors, key, "unknown_field", `Unknown project spec field: ${key}.`);
        }
    }

    if (input.schemaVersion !== 1) {
        addIssue(errors, "schemaVersion", "invalid_value", "schemaVersion must be 1.");
    }

    let projectName = "";
    if (typeof input.projectName !== "string") {
        addIssue(errors, "projectName", "invalid_type", "projectName must be a string.");
    } else {
        projectName = input.projectName.trim();
        if (projectName.length < 2 || projectName.length > 48) {
            addIssue(errors, "projectName", "invalid_length", "projectName must contain 2 to 48 characters.");
        } else if (!/^[A-Za-z0-9][A-Za-z0-9 _-]*$/.test(projectName)) {
            addIssue(
                errors,
                "projectName",
                "invalid_format",
                "projectName must start with a letter or number and use only letters, numbers, spaces, underscores, or hyphens."
            );
        }
    }

    const moduleAliases = options.moduleAliases ?? {};
    const supportedModules = new Set(options.supportedModuleIds.map((moduleId) => moduleId.toLowerCase()));
    const modules: string[] = [];
    if (!Array.isArray(input.modules)) {
        addIssue(errors, "modules", "invalid_type", "modules must be an array of module IDs.");
    } else {
        if (input.modules.length === 0) {
            addIssue(errors, "modules", "too_small", "Select at least one module.");
        }
        const seenModules = new Set<string>();
        input.modules.forEach((moduleValue, index) => {
            const field = `modules[${index}]`;
            if (typeof moduleValue !== "string") {
                addIssue(errors, field, "invalid_type", "Module IDs must be strings.");
                return;
            }

            const requestedModuleId = moduleValue.trim().toLowerCase();
            const canonicalModuleId = moduleAliases[requestedModuleId]?.toLowerCase() ?? requestedModuleId;
            if (!supportedModules.has(canonicalModuleId)) {
                addIssue(errors, field, "unsupported_module", `Unsupported module ID: ${moduleValue}.`);
                return;
            }
            if (seenModules.has(canonicalModuleId)) {
                addIssue(errors, field, "duplicate_module", `Module ${canonicalModuleId} was selected more than once.`);
                return;
            }
            seenModules.add(canonicalModuleId);
            modules.push(canonicalModuleId);
        });
    }

    if (supportedModules.has("identity") && !modules.includes("identity")) {
        addIssue(errors, "modules", "missing_required_module", "The Identity module is required.");
    }

    let targetPlatform: TargetPlatform | null = null;
    if (typeof input.targetPlatform !== "string" || !targetPlatforms.includes(input.targetPlatform as TargetPlatform)) {
        addIssue(
            errors,
            "targetPlatform",
            "invalid_value",
            "targetPlatform must be windows, linux, or macos."
        );
    } else {
        targetPlatform = input.targetPlatform as TargetPlatform;
    }

    let demoInsertsEnabled: boolean = defaultProjectSpecValues.demoInsertsEnabled;
    if (input.demoInsertsEnabled !== undefined) {
        if (typeof input.demoInsertsEnabled !== "boolean") {
            addIssue(errors, "demoInsertsEnabled", "invalid_type", "demoInsertsEnabled must be a boolean.");
        } else {
            demoInsertsEnabled = input.demoInsertsEnabled;
        }
    }

    let templateId: string | undefined;
    if (input.templateId !== undefined) {
        if (typeof input.templateId !== "string") {
            addIssue(errors, "templateId", "invalid_type", "templateId must be a string when provided.");
        } else {
            templateId = input.templateId.trim();
            if (!templateId) {
                addIssue(errors, "templateId", "invalid_value", "templateId cannot be empty.");
            } else if (!isKnownTemplateId(templateId)) {
                addIssue(errors, "templateId", "unsupported_template", `Unsupported template ID: ${templateId}.`);
            } else {
                const templateModuleIds = getTemplateModuleIds(templateId) ?? [];
                const selectedModuleIds = new Set(modules);
                const hasSameModules =
                    selectedModuleIds.size === templateModuleIds.length &&
                    templateModuleIds.every((moduleId) => selectedModuleIds.has(moduleId));
                if (hasSameModules && templateModuleIds.some((moduleId) => !supportedModules.has(moduleId))) {
                    addIssue(
                        errors,
                        "templateId",
                        "unsupported_template",
                        `Template ${templateId} includes a module that is unavailable in this service.`
                    );
                } else if (!hasSameModules && modules.length > 0) {
                    addIssue(
                        errors,
                        "modules",
                        "template_mismatch",
                        `modules must match the module list for template ${templateId}.`
                    );
                }
            }
        }
    }

    if (errors.length > 0 || targetPlatform === null) {
        return {valid: false, normalizedProjectSpec: null, errors};
    }

    return {
        valid: true,
        normalizedProjectSpec: {
            schemaVersion: 1,
            projectName,
            modules: [...modules].sort(),
            targetPlatform,
            demoInsertsEnabled,
            ...(templateId ? {templateId} : {})
        },
        errors: []
    };
}
