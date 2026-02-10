import {PathsConfig} from "@/types/PathsConfig";

export type ScaffolderRunContext = {
    resolvedPaths: PathsConfig;
    backendRootItems: Set<string>;
    frontendRootItems: Set<string>;
    repoRootItems: Set<string>;
    moduleAliases: Record<string, string>;
    availableModules: string[];
    requestedModules: string[];
    applicationName: string;
    isApplicationNameProvided: boolean;
    cacheMode: "rebuild" | "reuse";
};
