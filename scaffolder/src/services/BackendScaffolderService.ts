import fs from "fs";
import path from "path";
import envFileService from "@/services/files/EnvFileService";
import backendModuleResolver from "@/services/modules/backend/ModuleResolver";
import dockerComposeFileUpdater from "@/services/files/backend/DockerComposeFileUpdater";
import buildGradleFileUpdater from "@/services/files/backend/BuildGradleFileUpdater";
import settingsGradleFileUpdater from "@/services/files/backend/SettingsGradleFileUpdater";
import applicationYamlFileUpdater from "@/services/files/backend/ApplicationYamlFileUpdater";
import javaFileUpdater from "@/services/files/backend/JavaFileUpdater";
import mainAppPackageNameUpdater from "@/services/files/backend/MainAppPackageNameUpdater";
import type {Archiver} from "archiver";
import {ModuleSelectionResult} from "@/types/ModuleSelectionResult";
import {ScaffolderRunContext} from "@/types/ScaffolderRunContext";
import {ScaffolderRunHelpers} from "@/types/ScaffolderRunHelpers";
import {PathsConfig} from "@/types/PathsConfig";

export type BackendPayload = {
    requestedModules: string[];
    selectedModules: string[];
    updatedSettingsGradle: string;
    updatedDockerCompose: string;
    updatedBuildGradle: string;
    updatedApplicationYaml: string | null;
    updatedApplicationTestYaml: string | null;
    appPackageName: string;
    sourcePackageName: string | null;
    envContents: string;
};

class BackendScaffolderService {
    async prepareBackendPayload(
        runContext: ScaffolderRunContext,
        runHelpers: ScaffolderRunHelpers
    ): Promise<BackendPayload> {
        const {
            resolvedPaths,
            backendRootItems,
            moduleAliases,
            availableModules,
            requestedModules,
            applicationName
        } = runContext;
        const {readRequiredFile, runStep} = runHelpers;
        const appPackageName = mainAppPackageNameUpdater.buildTargetPackageName(applicationName);
        const databaseName = this.buildDatabaseName(applicationName);
        const backendSelectionResult = await runStep("Selecting backend modules", () => {
            return this.selectBackendModules(
                requestedModules,
                resolvedPaths,
                moduleAliases,
                availableModules
            );
        });
        const sourcePackageName = await runStep("Preparing app package rename", () => {
            if (!backendRootItems.has("src")) {
                return null;
            }
            const mainJavaRoot = path.join(resolvedPaths.backendRoot, "src", "main", "java");
            return mainAppPackageNameUpdater.resolveSourcePackageName(mainJavaRoot);
        });
        const containerName = this.buildContainerName(applicationName, runContext.isApplicationNameProvided);
        const updatedSettingsGradle = await runStep("Preparing settings.gradle", () => {
            const settingsContents = readRequiredFile(
                path.join(resolvedPaths.backendRoot, "settings.gradle"),
                "settings.gradle"
            );
            return settingsGradleFileUpdater.updateSettingsContents(
                settingsContents,
                backendSelectionResult.selectedModules,
                applicationName
            );
        });
        const updatedDockerCompose = await runStep("Preparing docker-compose.yml", () => {
            const composeContents = readRequiredFile(
                path.join(resolvedPaths.backendRoot, "docker-compose.yml"),
                "docker-compose.yml"
            );
            return dockerComposeFileUpdater.updateContents(
                composeContents,
                containerName,
                databaseName
            );
        });
        const updatedBuildGradle = await runStep("Preparing build.gradle", () => {
            const buildGradleContents = readRequiredFile(
                path.join(resolvedPaths.backendRoot, "build.gradle"),
                "build.gradle"
            );
            return buildGradleFileUpdater.updateDependenciesContents(
                buildGradleContents,
                backendSelectionResult.selectedModules
            );
        });
        const {updatedApplicationYaml, updatedApplicationTestYaml} = await runStep(
            "Preparing application yaml",
            () => {
                if (!backendRootItems.has("src")) {
                    return {updatedApplicationYaml: null, updatedApplicationTestYaml: null};
                }
                const applicationYamlPath = path.join(
                    resolvedPaths.backendRoot,
                    "src",
                    "main",
                    "resources",
                    "application.yaml"
                );
                const applicationYamlContents = readRequiredFile(
                    applicationYamlPath,
                    "application.yaml"
                );
                const updatedApplicationYamlLocal = applicationYamlFileUpdater.updateContents(
                    applicationYamlContents,
                    backendSelectionResult.selectedModules,
                    applicationName,
                    databaseName
                );

                const applicationTestYamlPath = path.join(
                    resolvedPaths.backendRoot,
                    "src",
                    "test",
                    "resources",
                    "application-test.yaml"
                );
                if (!fs.existsSync(applicationTestYamlPath)) {
                    return {
                        updatedApplicationYaml: updatedApplicationYamlLocal,
                        updatedApplicationTestYaml: null
                    };
                }

                const applicationTestYamlContents = fs.readFileSync(
                    applicationTestYamlPath,
                    "utf8"
                );
                const updatedApplicationTestYamlLocal = applicationYamlFileUpdater.updateContents(
                    applicationTestYamlContents,
                    backendSelectionResult.selectedModules,
                    applicationName,
                    databaseName
                );

                return {
                    updatedApplicationYaml: updatedApplicationYamlLocal,
                    updatedApplicationTestYaml: updatedApplicationTestYamlLocal
                };
            }
        );
        const envContents = await runStep("Preparing .env from .env-template", () => {
            const templateContents = readRequiredFile(
                path.join(resolvedPaths.backendRoot, ".env-template"),
                ".env-template"
            );
            return envFileService.buildFromTemplate(templateContents);
        });

        return {
            requestedModules: backendSelectionResult.requestedModules,
            selectedModules: backendSelectionResult.selectedModules,
            updatedSettingsGradle,
            updatedDockerCompose,
            updatedBuildGradle,
            updatedApplicationYaml,
            updatedApplicationTestYaml,
            appPackageName,
            sourcePackageName,
            envContents
        };
    }

    private selectBackendModules(
        requestedModules: string[],
        resolvedPaths: PathsConfig,
        moduleAliases: Record<string, string>,
        availableModules: string[]
    ): ModuleSelectionResult {
        return backendModuleResolver.resolve(requestedModules, resolvedPaths.backendModulesRoot, {
            moduleAliases,
            availableModules
        });
    }

    appendBackendUpdatesToArchive(
        archive: Archiver,
        runContext: ScaffolderRunContext,
        payload: BackendPayload,
        backendRootItems: Set<string>,
        zipPrefix: string
    ): void {
        if (backendRootItems.has("settings.gradle")) {
            archive.append(payload.updatedSettingsGradle, {
                name: path.posix.join(zipPrefix, "settings.gradle")
            });
        }
        if (backendRootItems.has("build.gradle")) {
            archive.append(payload.updatedBuildGradle, {
                name: path.posix.join(zipPrefix, "build.gradle")
            });
        }
        if (backendRootItems.has("docker-compose.yml")) {
            archive.append(payload.updatedDockerCompose, {
                name: path.posix.join(zipPrefix, "docker-compose.yml")
            });
        }
        if (backendRootItems.has("src")) {
            this.appendBackendSourceToArchive(
                archive,
                runContext.resolvedPaths.backendRoot,
                payload.updatedApplicationYaml,
                payload.updatedApplicationTestYaml,
                payload.appPackageName,
                payload.sourcePackageName,
                zipPrefix
            );
        }
        if (backendRootItems.has("modules")) {
            for (const moduleName of payload.selectedModules) {
                const sourceModulePath = path.join(
                    runContext.resolvedPaths.backendModulesRoot,
                    moduleName
                );
                if (!fs.existsSync(sourceModulePath)) {
                    throw new Error(`Module "${moduleName}" not found at ${sourceModulePath}`);
                }
                archive.directory(
                    sourceModulePath,
                    path.posix.join(zipPrefix, "modules", moduleName)
                );
            }
        }
        archive.append(payload.envContents, {name: path.posix.join(zipPrefix, ".env")});
    }

    private appendBackendSourceToArchive(
        archive: Archiver,
        backendRoot: string,
        updatedApplicationYaml: string | null,
        updatedApplicationTestYaml: string | null,
        appPackageName: string,
        sourcePackageName: string | null,
        zipPrefix: string
    ): void {
        const sourceRoot = path.join(backendRoot, "src");
        const sourcePackagePath = sourcePackageName
            ? mainAppPackageNameUpdater.buildPackagePath(sourcePackageName).split(path.sep).join("/")
            : null;
        const targetPackagePath = mainAppPackageNameUpdater
            .buildPackagePath(appPackageName)
            .split(path.sep)
            .join("/");
        const zipSourceRoot = path.posix.join(zipPrefix, "src");
        const mainJavaPrefix = path.posix.join(zipSourceRoot, "main", "java");
        const testJavaPrefix = path.posix.join(zipSourceRoot, "test", "java");

        const skipPaths = new Set<string>();
        if (updatedApplicationYaml) {
            skipPaths.add(path.posix.join(zipSourceRoot, "main", "resources", "application.yaml"));
        }
        if (updatedApplicationTestYaml) {
            skipPaths.add(
                path.posix.join(zipSourceRoot, "test", "resources", "application-test.yaml")
            );
        }

        const walk = (currentSourcePath: string, currentZipPath: string) => {
            const entries = fs.readdirSync(currentSourcePath);
            for (const entry of entries) {
                const entrySourcePath = path.join(currentSourcePath, entry);
                const stats = fs.lstatSync(entrySourcePath);
                if (stats.isSymbolicLink()) {
                    continue;
                }

                const entryZipPath = path.posix.join(currentZipPath, entry);
                if (skipPaths.has(entryZipPath)) {
                    continue;
                }

                if (stats.isDirectory()) {
                    walk(entrySourcePath, entryZipPath);
                    continue;
                }

                if (!stats.isFile()) {
                    continue;
                }

                if (entryZipPath.endsWith(".java") && sourcePackageName && sourcePackagePath) {
                    const inMainPackage = entryZipPath.startsWith(
                        `${mainJavaPrefix}/${sourcePackagePath}/`
                    );
                    const inTestPackage = entryZipPath.startsWith(
                        `${testJavaPrefix}/${sourcePackagePath}/`
                    );
                    if (inMainPackage || inTestPackage) {
                        const javaContents = fs.readFileSync(entrySourcePath, "utf8");
                        const updatedContents = javaFileUpdater.updateAppPackageReferences(
                            javaContents,
                            sourcePackageName,
                            appPackageName
                        );
                        const updatedZipPath = entryZipPath.replace(
                            `${inMainPackage ? mainJavaPrefix : testJavaPrefix}/${sourcePackagePath}`,
                            `${inMainPackage ? mainJavaPrefix : testJavaPrefix}/${targetPackagePath}`
                        );
                        archive.append(updatedContents, {name: updatedZipPath});
                        continue;
                    }
                }

                archive.file(entrySourcePath, {name: entryZipPath});
            }
        };

        walk(sourceRoot, zipSourceRoot);

        if (updatedApplicationYaml) {
            archive.append(updatedApplicationYaml, {
                name: path.posix.join(zipPrefix, "src/main/resources/application.yaml")
            });
        }
        if (updatedApplicationTestYaml) {
            archive.append(updatedApplicationTestYaml, {
                name: path.posix.join(zipPrefix, "src/test/resources/application-test.yaml")
            });
        }
    }


    private buildContainerName(applicationName: string, isApplicationNameProvided: boolean): string {
        const trimmedName = applicationName.trim();
        if (!isApplicationNameProvided || !trimmedName) {
            return "modules-app";
        }
        return trimmedName;
    }

    private buildDatabaseName(applicationName: string): string {
        const trimmedName = applicationName.trim();
        if (!trimmedName) {
            return "modules";
        }
        return this.toKebabCase(trimmedName);
    }

    private toKebabCase(value: string): string {
        const parts = value
            .split(/[^a-zA-Z0-9]+/)
            .filter((part) => part.length > 0)
            .map((part) => part.toLowerCase());
        return parts.join("-");
    }
}

const backendScaffolderService = new BackendScaffolderService();
export default backendScaffolderService;
