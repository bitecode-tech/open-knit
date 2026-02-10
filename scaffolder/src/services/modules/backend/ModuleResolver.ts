import fs from "fs";
import {ModuleSelectionResult} from "@/types";

type ResolveOptions = {
    moduleAliases: Record<string, string>;
    availableModules?: string[];
};

class ModuleResolver {
    resolve(requestedModuleNames: string[], root: string, options: ResolveOptions): ModuleSelectionResult {
        if (!fs.existsSync(root)) {
            throw new Error(`Backend modules directory not found: ${root}`);
        }

        const availableModules = options.availableModules ?? this.loadAvailableModulesFromDisk(root);

        const resolvedModules = new Set<string>();
        resolvedModules.add("_common");

        for (const moduleName of requestedModuleNames) {
            const normalizedModule = options.moduleAliases[moduleName] ?? moduleName;
            if (!availableModules.includes(normalizedModule)) {
                throw new Error(
                    `Unknown module: ${moduleName}. Available modules: ${availableModules.join(", ")}`
                );
            }
            resolvedModules.add(normalizedModule);
        }

        const requestedModulesResolved = Array.from(
            new Set(
                requestedModuleNames.map((moduleName) => options.moduleAliases[moduleName] ?? moduleName)
            )
        );

        return {
            selectedModules: Array.from(resolvedModules),
            requestedModules: requestedModulesResolved,
            modulesRoot: root
        };
    }

    private loadAvailableModulesFromDisk(root: string): string[] {
        return fs
            .readdirSync(root, {withFileTypes: true})
            .filter((entry) => entry.isDirectory())
            .map((entry) => entry.name.toLowerCase());
    }
}

const moduleResolver = new ModuleResolver();
export default moduleResolver;
