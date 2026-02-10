type AdminLayoutConfig = {
    module: string;
    importPath: string;
    identifier: string;
};

const ADMIN_LAYOUT_CONFIGS: AdminLayoutConfig[] = [
    {
        module: "transaction",
        importPath: "@transaction/_scaffolder/TransactionsAdminLayoutConfig.tsx",
        identifier: "transactionsAdminLayoutConfig"
    },
    {
        module: "payment",
        importPath: "@payment/_scaffolder/PaymentsAdminLayoutConfig.tsx",
        identifier: "paymentsAdminLayoutConfig"
    },
    {
        module: "payment",
        importPath: "@payment/_scaffolder/SubscriptionsAdminLayoutConfig.tsx",
        identifier: "subscriptionsAdminLayoutConfig"
    },
    {
        module: "ai",
        importPath: "@ai/_scaffolder/AiAdminLayoutConfig.tsx",
        identifier: "aiAdminLayoutConfig"
    },
    {
        module: "identity",
        importPath: "@identity/_scaffolder/IdentityAdminLayoutConfig.tsx",
        identifier: "identityAdminLayoutConfig"
    }
];

class AdminLayoutFileUpdater {
    updateContents(fileContents: string, selectedModules: string[]): string {
        const selectedSet = new Set(selectedModules.map((module) => module.toLowerCase()));
        const selectedConfigs = ADMIN_LAYOUT_CONFIGS.filter((config) =>
            selectedSet.has(config.module)
        );

        const lines = fileContents.split(/\r?\n/);
        const filteredLines = lines.filter((line) => {
            const trimmed = line.trim();
            if (!trimmed.startsWith("import ")) {
                return true;
            }
            return !ADMIN_LAYOUT_CONFIGS.some((config) => {
                return trimmed.includes(`{${config.identifier}}`) || trimmed.includes(config.importPath);
            });
        });

        const importLines = selectedConfigs.map(
            (config) => `import {${config.identifier}} from "${config.importPath}";`
        );

        let lastImportIndex = -1;
        for (let i = 0; i < filteredLines.length; i += 1) {
            if (filteredLines[i].trim().startsWith("import ")) {
                lastImportIndex = i;
            }
        }
        if (lastImportIndex >= 0) {
            filteredLines.splice(lastImportIndex + 1, 0, ...importLines);
        } else {
            filteredLines.unshift(...importLines);
        }

        const adminConfigLines = selectedConfigs.map(
            (config) => `    ${config.identifier},`
        );
        const updatedContents = filteredLines.join("\n").replace(
            /const\s+adminModuleConfigs:\s*AdminLayoutModuleConfig\[\]\s*=\s*\[[\s\S]*?\];/m,
            `const adminModuleConfigs: AdminLayoutModuleConfig[] = [\n${adminConfigLines.join("\n")}\n];`
        );

        return updatedContents;
    }
}

const adminLayoutFileUpdater = new AdminLayoutFileUpdater();
export default adminLayoutFileUpdater;
