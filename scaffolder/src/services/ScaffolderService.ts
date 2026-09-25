import fs from "fs";
import path from "path";
import appScaffolderService from "@/services/AppScaffolderService";
import {ScaffolderRunContext} from "@/types/ScaffolderRunContext";
import {PathsConfig} from "@/types/PathsConfig";
import {
    getSupportedModuleIds,
    getProjectOptionCatalog,
    type ProjectOptionCatalog
} from "@/projectSpec/projectOptions";
import {
    validateProjectSpec as validateProjectSpecInput,
    type ProjectSpec,
    type ProjectSpecValidationResult
} from "@/projectSpec/projectSpec";
import {ProjectSpecValidationError} from "@/projectSpec/ProjectSpecValidationError";

class ScaffolderService {
    private quietLogs = false;

    getRuntimeConfig(): { availableModules: string[]; moduleAliases: Record<string, string> } {
        const resolvedPaths = this.resolvePaths();
        const envValues = this.readEnvValues(resolvedPaths.scaffolderRoot);
        return {
            availableModules: this.parseAvailableModules(envValues),
            moduleAliases: this.parseModuleAliases(envValues)
        };
    }

    getProjectOptionCatalog(): ProjectOptionCatalog {
        const runtimeConfig = this.getRuntimeConfig();
        return getProjectOptionCatalog(
            getSupportedModuleIds().filter((moduleId) => runtimeConfig.availableModules.includes(moduleId)),
            runtimeConfig.moduleAliases
        );
    }

    validateProjectSpec(projectSpec: unknown): ProjectSpecValidationResult {
        const runtimeConfig = this.getRuntimeConfig();
        const supportedModuleIds = getSupportedModuleIds().filter((moduleId) => {
            return runtimeConfig.availableModules.includes(moduleId);
        });
        return validateProjectSpecInput(projectSpec, {
            supportedModuleIds,
            moduleAliases: runtimeConfig.moduleAliases
        });
    }

    async run(
        args: string[],
        options: {
            cacheMode?: "rebuild" | "reuse";
            outputIdentifier?: string;
        } = {}
    ): Promise<string> {
        const {applicationName, isApplicationNameProvided} = this.parseApplicationName(args);
        const demoInsertsArgument = this.findArgumentValue(args, "demoInsertsEnabled");
        const targetPlatformArgument = this.findArgumentValue(args, "targetPlatform");
        const projectSpec: Record<string, unknown> = {
            schemaVersion: 1,
            projectName: applicationName,
            modules: this.parseRequestedModules(args, false),
            targetPlatform: targetPlatformArgument ?? "linux",
            demoInsertsEnabled: demoInsertsArgument === undefined
                ? true
                : demoInsertsArgument === "true"
                    ? true
                    : demoInsertsArgument === "false"
                        ? false
                        : demoInsertsArgument
        };
        const templateId = this.findArgumentValue(args, "templateId");
        if (templateId !== undefined) {
            projectSpec.templateId = templateId;
        }

        return this.generateProject(projectSpec, {
            ...options,
            isProjectNameProvided: isApplicationNameProvided
        });
    }

    async generateProject(
        projectSpecInput: unknown,
        options: {
            cacheMode?: "rebuild" | "reuse";
            outputIdentifier?: string;
            isProjectNameProvided?: boolean;
        } = {}
    ): Promise<string> {
        const validation = this.validateProjectSpec(projectSpecInput);
        if (!validation.valid || validation.normalizedProjectSpec === null) {
            throw new ProjectSpecValidationError(validation.errors);
        }

        const startTime = process.hrtime.bigint();
        console.log("[scaffolder] Starting scaffolder run");
        const runContext = this.createRunContext(validation.normalizedProjectSpec, {
            cacheMode: options.cacheMode ?? "rebuild",
            isProjectNameProvided: options.isProjectNameProvided ?? true,
            outputIdentifier: options.outputIdentifier
        });

        const runHelpers = {
            readRequiredFile: this.readRequiredFile.bind(this),
            runStep: this.runStep.bind(this)
        };

        const zipFilePath = await appScaffolderService.run(runContext, runHelpers);

        this.logTotalTime(startTime);
        return zipFilePath;
    }

    async buildCache(): Promise<void> {
        const runContext = this.createRunContext(
            {
                schemaVersion: 1,
                projectName: "backend",
                modules: [],
                targetPlatform: "linux",
                demoInsertsEnabled: true
            },
            {
            cacheMode: "rebuild",
                isProjectNameProvided: false
            }
        );
        const runHelpers = {
            readRequiredFile: this.readRequiredFile.bind(this),
            runStep: this.runStep.bind(this)
        };
        await appScaffolderService.prepareBaseTree(runContext, runHelpers);
    }

    private createRunContext(
        projectSpec: ProjectSpec,
        options: {
            cacheMode: "rebuild" | "reuse";
            isProjectNameProvided: boolean;
            outputIdentifier?: string;
        }
    ): ScaffolderRunContext {
        const resolvedPaths = this.resolvePaths();
        const envValues = this.readEnvValues(resolvedPaths.scaffolderRoot);
        this.quietLogs = (envValues.get("SCAFFOLDER_QUIET_LOGS") ?? "").toLowerCase() === "true";
        const backendRootItems = this.parseBackendRootItems(envValues);
        const frontendRootItems = this.parseFrontendRootItems(envValues);
        const repoRootItems = this.parseRepoRootItems(envValues);
        const moduleAliases = this.parseModuleAliases(envValues);
        const availableModules = this.parseAvailableModules(envValues);
        return {
            projectSpec,
            resolvedPaths,
            backendRootItems,
            frontendRootItems,
            repoRootItems,
            moduleAliases,
            availableModules,
            requestedModules: [...projectSpec.modules],
            applicationName: projectSpec.projectName,
            isApplicationNameProvided: options.isProjectNameProvided,
            outputIdentifier: options.outputIdentifier,
            cacheMode: options.cacheMode
        };
    }

    private findArgumentValue(args: string[], name: string): string | undefined {
        const prefixes = [`${name}=`, `--${name}=`];
        const argument = args.find((value) => prefixes.some((prefix) => value.startsWith(prefix)));
        if (!argument) {
            return undefined;
        }
        const prefix = prefixes.find((candidate) => argument.startsWith(candidate));
        return prefix ? argument.slice(prefix.length).trim() : undefined;
    }

    private resolvePaths(): PathsConfig {
        const scriptDirectory = __dirname;
        const scaffolderRoot = path.resolve(scriptDirectory, "..", "..");
        const configuredRepositoryRoot = this.resolveConfiguredPath(process.env.REPOSITORY_ROOT);
        const configuredBackendRoot = this.resolveConfiguredPath(process.env.BACKEND_ROOT);
        const configuredFrontendRoot = this.resolveConfiguredPath(process.env.FRONTEND_ROOT);
        const configuredBackendModulesRoot = this.resolveConfiguredPath(
            process.env.BACKEND_MODULES_ROOT
        );
        const configuredFrontendModulesRoot = this.resolveConfiguredPath(
            process.env.FRONTEND_MODULES_ROOT
        );

        const defaultRepositoryRoot = path.resolve(scaffolderRoot, "..");
        const fallbackRepositoryRoot = this.isDirectory(path.join(scaffolderRoot, "backend")) &&
            this.isDirectory(path.join(scaffolderRoot, "frontend"))
            ? scaffolderRoot
            : defaultRepositoryRoot;
        const repositoryRoot = configuredRepositoryRoot ?? fallbackRepositoryRoot;
        const backendRoot = configuredBackendRoot ?? path.join(repositoryRoot, "backend");
        const frontendRoot = configuredFrontendRoot ?? path.join(repositoryRoot, "frontend");
        const backendModulesRoot = configuredBackendModulesRoot ?? path.join(backendRoot, "modules");
        const frontendModulesRoot =
            configuredFrontendModulesRoot ?? path.join(frontendRoot, "modules");
        const outputRoot = path.join(scaffolderRoot, "output");

        return {
            scaffolderRoot,
            repositoryRoot,
            backendRoot,
            frontendRoot,
            backendModulesRoot,
            frontendModulesRoot,
            outputRoot
        };
    }

    private resolveConfiguredPath(rawPath: string | undefined): string | null {
        if (!rawPath) {
            return null;
        }
        const trimmedPath = rawPath.trim();
        if (!trimmedPath) {
            return null;
        }
        if (path.isAbsolute(trimmedPath)) {
            return trimmedPath;
        }
        return path.resolve(trimmedPath);
    }

    private isDirectory(directoryPath: string): boolean {
        if (!fs.existsSync(directoryPath)) {
            return false;
        }
        const stats = fs.statSync(directoryPath);
        return stats.isDirectory();
    }

    private parseRequestedModules(args: string[], allowEmpty: boolean): string[] {
        const modulesArgumentPrefix = "modules=";
        const modulesArgument = args.find((arg) => arg.startsWith(modulesArgumentPrefix));

        if (!modulesArgument) {
            if (allowEmpty) {
                return [];
            }
            throw new Error(
                "Missing modules argument. Example: node script.js modules=identity,payment,transaction"
            );
        }

        const rawModulesValue = modulesArgument.slice(modulesArgumentPrefix.length);
        const requestedModules = rawModulesValue
            .split(",")
            .map((value) => value.trim().toLowerCase())
            .filter((value) => value.length > 0);

        if (requestedModules.length === 0) {
            if (allowEmpty) {
                return [];
            }
            throw new Error(
                "No modules provided. Example: node script.js modules=identity,payment,transaction"
            );
        }

        return requestedModules;
    }

    private parseApplicationName(
        args: string[]
    ): { applicationName: string; isApplicationNameProvided: boolean } {
        const nameArgumentPrefix = "name=";
        const nameArgument = args.find((arg) => {
            return arg.startsWith(nameArgumentPrefix) || arg.startsWith(`--${nameArgumentPrefix}`);
        });

        if (!nameArgument) {
            return {applicationName: "backend", isApplicationNameProvided: false};
        }

        const rawNameValue = nameArgument.replace(/^--/, "").slice(nameArgumentPrefix.length);
        const trimmedName = rawNameValue.trim();
        if (!trimmedName) {
            return {applicationName: "backend", isApplicationNameProvided: false};
        }

        return {applicationName: trimmedName, isApplicationNameProvided: true};
    }

    private readEnvValues(scaffolderRoot: string): Map<string, string> {
        const envPath = path.join(scaffolderRoot, ".env");
        const envValues = new Map<string, string>();

        if (fs.existsSync(envPath)) {
            const envContents = fs.readFileSync(envPath, "utf8");
            const envLines = envContents.split(/\r?\n/);
            for (const line of envLines) {
                const trimmedLine = line.trim();
                if (!trimmedLine || trimmedLine.startsWith("#")) {
                    continue;
                }
                const separatorIndex = trimmedLine.indexOf("=");
                if (separatorIndex === -1) {
                    continue;
                }
                const key = trimmedLine.slice(0, separatorIndex).trim();
                const value = trimmedLine.slice(separatorIndex + 1).trim();
                envValues.set(key, value);
            }
        }

        const configKeys = [
            "BACKEND_ROOT_ITEMS",
            "FRONTEND_ROOT_ITEMS",
            "REPO_ROOT_ITEMS",
            "MODULE_ALIASES",
            "AVAILABLE_MODULES",
            "SCAFFOLDER_QUIET_LOGS"
        ];

        for (const configKey of configKeys) {
            const processValue = process.env[configKey];
            if (processValue !== undefined) {
                envValues.set(configKey, processValue);
            }
        }

        const requiredConfigKeys = ["BACKEND_ROOT_ITEMS", "FRONTEND_ROOT_ITEMS", "REPO_ROOT_ITEMS"];
        const missingConfigKeys = requiredConfigKeys.filter((requiredConfigKey) => {
            const configValue = envValues.get(requiredConfigKey);
            return !configValue || configValue.toLowerCase() === "null";
        });

        if (missingConfigKeys.length > 0) {
            throw new Error(
                `Missing required configuration: ${missingConfigKeys.join(", ")}. Provide via environment variables or .env file.`
            );
        }

        return envValues;
    }

    private parseBackendRootItems(envValues: Map<string, string>): Set<string> {
        const rootItemsValue = envValues.get("BACKEND_ROOT_ITEMS");
        if (!rootItemsValue || rootItemsValue.toLowerCase() === "null") {
            throw new Error("BACKEND_ROOT_ITEMS is missing or empty in configuration.");
        }

        const rootItems = rootItemsValue
            .split(",")
            .map((value) => value.trim())
            .filter((value) => value.length > 0);

        if (rootItems.length === 0) {
            throw new Error("BACKEND_ROOT_ITEMS is missing or empty in configuration.");
        }

        return new Set(rootItems);
    }

    private parseRepoRootItems(envValues: Map<string, string>): Set<string> {
        const rootItemsValue = envValues.get("REPO_ROOT_ITEMS");
        if (!rootItemsValue || rootItemsValue.toLowerCase() === "null") {
            throw new Error("REPO_ROOT_ITEMS is missing or empty in configuration.");
        }

        const rootItems = rootItemsValue
            .split(",")
            .map((value) => value.trim())
            .filter((value) => value.length > 0);

        if (rootItems.length === 0) {
            throw new Error("REPO_ROOT_ITEMS is missing or empty in configuration.");
        }

        return new Set(rootItems);
    }

    private parseFrontendRootItems(envValues: Map<string, string>): Set<string> {
        const rootItemsValue = envValues.get("FRONTEND_ROOT_ITEMS");
        if (!rootItemsValue || rootItemsValue.toLowerCase() === "null") {
            throw new Error("FRONTEND_ROOT_ITEMS is missing or empty in configuration.");
        }

        const rootItems = rootItemsValue
            .split(",")
            .map((value) => value.trim())
            .filter((value) => value.length > 0);

        if (rootItems.length === 0) {
            throw new Error("FRONTEND_ROOT_ITEMS is missing or empty in configuration.");
        }

        return new Set(rootItems);
    }

    private parseModuleAliases(envValues: Map<string, string>): Record<string, string> {
        const moduleAliasesValue = envValues.get("MODULE_ALIASES");
        if (!moduleAliasesValue || moduleAliasesValue.toLowerCase() === "null") {
            return {};
        }

        const aliasEntries = moduleAliasesValue
            .split(",")
            .map((entry) => entry.trim())
            .filter((entry) => entry.length > 0);

        const moduleAliases: Record<string, string> = {};
        for (const entry of aliasEntries) {
            const [sourceAlias, targetAlias] = entry.split(":").map((value) => value.trim());
            if (!sourceAlias || !targetAlias) {
                throw new Error(
                    `Invalid MODULE_ALIASES entry \"${entry}\". Use alias:target format.`
                );
            }
            moduleAliases[sourceAlias] = targetAlias;
        }

        return moduleAliases;
    }

    private parseAvailableModules(envValues: Map<string, string>): string[] {
        const availableModulesValue = envValues.get("AVAILABLE_MODULES");
        if (!availableModulesValue || availableModulesValue.toLowerCase() === "null") {
            throw new Error("AVAILABLE_MODULES is missing or empty in configuration.");
        }

        const availableModules = availableModulesValue
            .split(",")
            .map((value) => value.trim().toLowerCase())
            .filter((value) => value.length > 0);

        if (availableModules.length === 0) {
            throw new Error("AVAILABLE_MODULES is missing or empty in configuration.");
        }

        return availableModules;
    }

    private readRequiredFile(filePath: string, displayName: string): string {
        if (!fs.existsSync(filePath)) {
            throw new Error(`${displayName} not found at ${filePath}`);
        }
        return fs.readFileSync(filePath, "utf8");
    }

    private async runStep<T>(message: string, action: () => T | Promise<T>): Promise<T> {
        if (this.quietLogs) {
            return await action();
        }
        const stepStart = process.hrtime.bigint();
        const result = await action();
        const elapsedMs = Number((process.hrtime.bigint() - stepStart) / 1_000_000n);
        console.log(`[scaffolder] ${message} (+${elapsedMs}ms)`);
        return result;
    }

    private logTotalTime(startTime: bigint): void {
        const durationMs = Number((process.hrtime.bigint() - startTime) / 1_000_000n);
        console.log(`[scaffolder] Completed in ${durationMs} ms`);
    }
}

const scaffolderService = new ScaffolderService();
export default scaffolderService;
