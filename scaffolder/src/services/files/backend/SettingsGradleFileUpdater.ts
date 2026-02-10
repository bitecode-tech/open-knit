class SettingsGradleFileUpdater {
    updateSettingsContents(settingsContents: string, moduleNames: string[], applicationName: string): string {
        const withProjectName = this.updateRootProjectName(settingsContents, applicationName);
        return this.updateModuleIncludes(withProjectName, moduleNames);
    }

    private updateModuleIncludes(settingsContents: string, moduleNames: string[]): string {
        const includeBlock = this.buildIncludeBlock(moduleNames);
        const includePattern = /include\([\s\S]*?\)/m;
        if (includePattern.test(settingsContents)) {
            return settingsContents.replace(includePattern, includeBlock);
        }

        return `${settingsContents.trimEnd()}\n\n${includeBlock}\n`;
    }

    private updateRootProjectName(settingsContents: string, applicationName: string): string {
        const projectName = this.buildProjectName(applicationName);
        const rootNameLine = `rootProject.name = '${projectName}'`;
        const rootNamePattern = /rootProject\.name\s*=\s*['"][^'"]*['"]/;

        if (rootNamePattern.test(settingsContents)) {
            return settingsContents.replace(rootNamePattern, rootNameLine);
        }

        return `${rootNameLine}\n${settingsContents}`;
    }

    private buildProjectName(applicationName: string): string {
        const trimmedName = applicationName.trim();
        if (!trimmedName) {
            return "backend";
        }
        if (trimmedName.endsWith("-backend")) {
            return trimmedName;
        }
        return `${trimmedName}-backend`;
    }

    private buildIncludeBlock(moduleNames: string[]): string {
        const includeLines = moduleNames.map((moduleName) => `        "modules:${moduleName}"`);
        return `include(\n${includeLines.join(",\n")}\n)`;
    }
}

const settingsGradleFileUpdater = new SettingsGradleFileUpdater();
export default settingsGradleFileUpdater;
