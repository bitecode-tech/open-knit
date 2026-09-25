import path from "path";
import {parse, stringify} from "yaml";
import type {ScaffolderRunContext} from "@/types/ScaffolderRunContext";

type ComposeMapping = Record<string, unknown>;

class ProjectComposeStackBuilder {
    buildRootCompose(
        runContext: ScaffolderRunContext,
        backendComposeContents: string,
        frontendComposeContents: string
    ): string {
        const backendCompose = this.parseCompose(backendComposeContents, "backend");
        const frontendCompose = this.parseCompose(frontendComposeContents, "frontend");
        const backendServices = this.requireMapping(backendCompose.services, "backend services");
        const frontendServices = this.requireMapping(frontendCompose.services, "frontend services");
        const backendApp = this.requireMapping(backendServices.app, "backend services.app");
        const postgres = this.requireMapping(backendServices.postgres, "backend services.postgres");
        const frontendApp = this.requireMapping(frontendServices.app, "frontend services.app");

        const stack: ComposeMapping = {
            name: this.toComposeProjectName(runContext.projectSpec.projectName),
            services: {
                backend: this.rebaseService(backendApp, "backend"),
                postgres: this.rebaseService(postgres, "backend"),
                frontend: this.rebaseService(frontendApp, "frontend")
            }
        };

        this.mergeTopLevelConfiguration(stack, backendCompose, frontendCompose, "volumes");
        this.mergeTopLevelConfiguration(stack, backendCompose, frontendCompose, "networks");

        return stringify(stack, {lineWidth: 100});
    }

    private parseCompose(contents: string, sourceName: string): ComposeMapping {
        const parsed: unknown = parse(contents);
        if (!this.isMapping(parsed)) {
            throw new Error(`The ${sourceName} Compose template must contain a YAML object.`);
        }
        return parsed;
    }

    private requireMapping(value: unknown, label: string): ComposeMapping {
        if (!this.isMapping(value)) {
            throw new Error(`The ${label} Compose section is missing or malformed.`);
        }
        return value;
    }

    private isMapping(value: unknown): value is ComposeMapping {
        return typeof value === "object" && value !== null && !Array.isArray(value);
    }

    private rebaseService(service: ComposeMapping, baseDirectory: string): ComposeMapping {
        const rebased: ComposeMapping = {...service};
        if (typeof service.build === "string") {
            rebased.build = this.rebaseProjectRelativePath(baseDirectory, service.build);
        } else if (this.isMapping(service.build)) {
            const build = {...service.build};
            if (typeof build.context === "string") {
                build.context = this.rebaseProjectRelativePath(baseDirectory, build.context);
            }
            rebased.build = build;
        }

        if (typeof service.env_file === "string") {
            rebased.env_file = this.rebaseProjectRelativePath(baseDirectory, service.env_file);
        } else if (Array.isArray(service.env_file)) {
            rebased.env_file = service.env_file.map((entry) => {
                if (typeof entry === "string") {
                    return this.rebaseProjectRelativePath(baseDirectory, entry);
                }
                if (this.isMapping(entry) && typeof entry.path === "string") {
                    return {
                        ...entry,
                        path: this.rebaseProjectRelativePath(baseDirectory, entry.path)
                    };
                }
                return entry;
            });
        }

        if (Array.isArray(service.volumes)) {
            rebased.volumes = service.volumes.map((volume) => {
                if (typeof volume !== "string") {
                    return volume;
                }
                return this.rebaseShortVolumeSyntax(baseDirectory, volume);
            });
        }

        if (this.isMapping(service.develop) && Array.isArray(service.develop.watch)) {
            const develop = {...service.develop};
            develop.watch = service.develop.watch.map((watchEntry) => {
                if (!this.isMapping(watchEntry) || typeof watchEntry.path !== "string") {
                    return watchEntry;
                }
                return {
                    ...watchEntry,
                    path: this.rebaseProjectRelativePath(baseDirectory, watchEntry.path)
                };
            });
            rebased.develop = develop;
        }

        return rebased;
    }

    private rebaseShortVolumeSyntax(baseDirectory: string, volume: string): string {
        const hostPathSeparator = volume.indexOf(":");
        if (hostPathSeparator < 0) {
            return volume;
        }
        const sourcePath = volume.slice(0, hostPathSeparator);
        if (!sourcePath.startsWith(".") && !sourcePath.startsWith("/")) {
            return volume;
        }
        return `${this.rebaseProjectRelativePath(baseDirectory, sourcePath)}${volume.slice(hostPathSeparator)}`;
    }

    private rebaseProjectRelativePath(baseDirectory: string, projectRelativePath: string): string {
        if (path.posix.isAbsolute(projectRelativePath)) {
            return projectRelativePath;
        }
        const normalizedPath = path.posix.normalize(path.posix.join(baseDirectory, projectRelativePath));
        return normalizedPath.startsWith(".") ? normalizedPath : `./${normalizedPath}`;
    }

    private mergeTopLevelConfiguration(
        destination: ComposeMapping,
        backendCompose: ComposeMapping,
        frontendCompose: ComposeMapping,
        key: "volumes" | "networks"
    ): void {
        const backendValue = backendCompose[key];
        const frontendValue = frontendCompose[key];
        if (backendValue === undefined && frontendValue === undefined) {
            return;
        }
        const combined: ComposeMapping = {};
        if (backendValue !== undefined) {
            Object.assign(combined, this.requireMapping(backendValue, `backend ${key}`));
        }
        if (frontendValue !== undefined) {
            const frontendEntries = this.requireMapping(frontendValue, `frontend ${key}`);
            for (const [entryName, entryValue] of Object.entries(frontendEntries)) {
                if (entryName in combined && JSON.stringify(combined[entryName]) !== JSON.stringify(entryValue)) {
                    throw new Error(`Conflicting Compose ${key} entry: ${entryName}.`);
                }
                combined[entryName] = entryValue;
            }
        }
        destination[key] = combined;
    }

    private toComposeProjectName(projectName: string): string {
        const normalizedName = projectName
            .toLowerCase()
            .replace(/[^a-z0-9_-]+/g, "-")
            .replace(/^-+|-+$/g, "")
            .slice(0, 63);
        return normalizedName || "open-knit-project";
    }
}

const projectComposeStackBuilder = new ProjectComposeStackBuilder();
export default projectComposeStackBuilder;
