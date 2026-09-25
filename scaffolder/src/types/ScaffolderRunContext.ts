import {PathsConfig} from "@/types/PathsConfig";
import type {ProjectSpec} from "@/projectSpec/projectSpec";

export type ScaffolderRunContext = {
    projectSpec: ProjectSpec;
    resolvedPaths: PathsConfig;
    backendRootItems: Set<string>;
    frontendRootItems: Set<string>;
    repoRootItems: Set<string>;
    moduleAliases: Record<string, string>;
    availableModules: string[];
    requestedModules: string[];
    applicationName: string;
    isApplicationNameProvided: boolean;
    outputIdentifier?: string;
    cacheMode: "rebuild" | "reuse";
};
