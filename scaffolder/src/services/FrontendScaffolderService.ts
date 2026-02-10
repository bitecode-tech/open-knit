import fs from "fs";
import path from "path";
import frontendModuleResolver from "@/services/modules/frontend/ModuleResolver";
import dockerComposeFileUpdater from "@/services/files/frontend/DockerComposeFileUpdater";
import packageJsonFileUpdater from "@/services/files/frontend/PackageJsonFileUpdater";
import adminLayoutFileUpdater from "@/services/files/frontend/AdminLayoutFileUpdater";
import envFileService from "@/services/files/EnvFileService";
import {ModuleSelectionResult} from "@/types/ModuleSelectionResult";
import {ScaffolderRunContext} from "@/types/ScaffolderRunContext";
import {ScaffolderRunHelpers} from "@/types/ScaffolderRunHelpers";
import {PathsConfig} from "@/types/PathsConfig";

export type FrontendPayload = {
    requestedModules: string[];
    selectedModules: string[];
    updatedDockerCompose: string;
    updatedPackageJson: string;
    updatedAdminLayout: string;
    envContents: string;
};

class FrontendScaffolderService {
    async prepareFrontendPayload(
        runContext: ScaffolderRunContext,
        runHelpers: ScaffolderRunHelpers
    ): Promise<FrontendPayload> {
        const {
            resolvedPaths,
            moduleAliases,
            availableModules,
            requestedModules,
            applicationName,
            isApplicationNameProvided
        } = runContext;
        const {readRequiredFile, runStep} = runHelpers;
        const frontendAppName = this.buildFrontendAppName(
            applicationName,
            isApplicationNameProvided
        );
        const frontendSelectionResult = await runStep("Selecting frontend modules", () => {
            return this.selectFrontendModules(
                requestedModules,
                resolvedPaths,
                moduleAliases,
                availableModules
            );
        });
        const updatedDockerCompose = await runStep("Preparing frontend docker-compose.yml", () => {
            const composeContents = readRequiredFile(
                path.join(resolvedPaths.frontendRoot, "docker-compose.yml"),
                "frontend docker-compose.yml"
            );
            return dockerComposeFileUpdater.updateContents(composeContents, frontendAppName);
        });
        const updatedPackageJson = await runStep("Preparing frontend package.json", () => {
            const packageJsonContents = readRequiredFile(
                path.join(resolvedPaths.frontendRoot, "package.json"),
                "frontend package.json"
            );
            return packageJsonFileUpdater.updateContents(packageJsonContents, frontendAppName);
        });
        const updatedAdminLayout = await runStep("Preparing AdminLayout module configs", () => {
            const adminLayoutContents = readRequiredFile(
                path.join(
                    resolvedPaths.frontendRoot,
                    "src",
                    "components",
                    "admin",
                    "AdminLayout.tsx"
                ),
                "frontend AdminLayout.tsx"
            );
            return adminLayoutFileUpdater.updateContents(
                adminLayoutContents,
                frontendSelectionResult.selectedModules
            );
        });
        const envContents = await runStep("Preparing frontend .env from .env-template", () => {
            const templateContents = readRequiredFile(
                path.join(resolvedPaths.frontendRoot, ".env-template"),
                ".env-template"
            );
            return envFileService.buildFromTemplate(templateContents, {includeJwtSecret: false});
        });

        return {
            requestedModules: frontendSelectionResult.requestedModules,
            selectedModules: frontendSelectionResult.selectedModules,
            updatedDockerCompose,
            updatedPackageJson,
            updatedAdminLayout,
            envContents
        };
    }

    private selectFrontendModules(
        requestedModules: string[],
        resolvedPaths: PathsConfig,
        moduleAliases: Record<string, string>,
        availableModules: string[]
    ): ModuleSelectionResult {
        const availableOnDisk = this.loadAvailableModulesFromDisk(resolvedPaths.frontendModulesRoot);
        const filteredRequestedModules = requestedModules.filter((moduleName) => {
            const normalizedModule = moduleAliases[moduleName] ?? moduleName;
            return availableOnDisk.includes(normalizedModule);
        });

        return frontendModuleResolver.resolve(filteredRequestedModules, resolvedPaths.frontendModulesRoot, {
            moduleAliases,
            availableModules: availableOnDisk
        });
    }

    private loadAvailableModulesFromDisk(root: string): string[] {
        return fs
            .readdirSync(root, {withFileTypes: true})
            .filter((entry) => entry.isDirectory())
            .map((entry) => entry.name.toLowerCase());
    }

    private buildFrontendAppName(applicationName: string, isApplicationNameProvided: boolean): string {
        const trimmedName = applicationName.trim();
        if (!isApplicationNameProvided || !trimmedName) {
            return "frontend";
        }
        return `${this.toKebabCase(trimmedName)}-frontend`;
    }

    private toKebabCase(value: string): string {
        const parts = value
            .split(/[^a-zA-Z0-9]+/)
            .filter((part) => part.length > 0)
            .map((part) => part.toLowerCase());
        return parts.join("-");
    }


}

const frontendScaffolderService = new FrontendScaffolderService();
export default frontendScaffolderService;
