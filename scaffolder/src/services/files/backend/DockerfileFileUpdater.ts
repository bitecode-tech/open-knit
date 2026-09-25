class DockerfileFileUpdater {
    updateModuleBuildCopyInstructions(contents: string, selectedModules: string[]): string {
        const lineEnding = contents.includes("\r\n") ? "\r\n" : "\n";
        const hasTrailingLineEnding = /\r?\n$/.test(contents);
        const lines = contents.split(/\r?\n/);
        if (hasTrailingLineEnding) {
            lines.pop();
        }

        const moduleCopyPattern =
            /^(\s*COPY\s+(?:(?!--from(?:=|\s))--[^\s]+\s+)*)modules\/([A-Za-z0-9_.-]+)\/build\.gradle\s+modules\/\2\/build\.gradle\s*$/i;
        const moduleCopyMatches = lines.map((line) => line.match(moduleCopyPattern));
        const moduleNamesByLine = moduleCopyMatches.map((match) => match?.[2] ?? null);
        const firstModuleCopyIndex = moduleNamesByLine.findIndex((moduleName) => moduleName !== null);
        if (firstModuleCopyIndex === -1) {
            throw new Error("Dockerfile has no module build.gradle COPY instructions to update.");
        }
        const firstModuleCopy = moduleCopyMatches[firstModuleCopyIndex];
        if (!firstModuleCopy) {
            throw new Error("Dockerfile has no module build.gradle COPY instructions to update.");
        }

        const moduleCopyPrefixes = new Map<string, string>();
        for (const moduleCopyMatch of moduleCopyMatches) {
            if (moduleCopyMatch && !moduleCopyPrefixes.has(moduleCopyMatch[2])) {
                moduleCopyPrefixes.set(moduleCopyMatch[2], moduleCopyMatch[1]);
            }
        }

        const selectedModuleSet = new Set(selectedModules);
        const orderedSelectedModules: string[] = [];
        const emittedModules = new Set<string>();
        for (const moduleName of moduleNamesByLine) {
            if (
                moduleName &&
                selectedModuleSet.has(moduleName) &&
                !emittedModules.has(moduleName)
            ) {
                orderedSelectedModules.push(moduleName);
                emittedModules.add(moduleName);
            }
        }
        for (const moduleName of selectedModules) {
            if (!emittedModules.has(moduleName)) {
                orderedSelectedModules.push(moduleName);
                emittedModules.add(moduleName);
            }
        }

        const moduleCopyInstructions = orderedSelectedModules.map((moduleName) => {
            const copyPrefix = moduleCopyPrefixes.get(moduleName) ?? firstModuleCopy[1];
            return `${copyPrefix}modules/${moduleName}/build.gradle modules/${moduleName}/build.gradle`;
        });
        const updatedLines: string[] = [];
        for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
            if (lineIndex === firstModuleCopyIndex) {
                updatedLines.push(...moduleCopyInstructions);
            }
            if (moduleNamesByLine[lineIndex] === null) {
                updatedLines.push(lines[lineIndex]);
            }
        }

        const updatedContents = updatedLines.join(lineEnding);
        return hasTrailingLineEnding ? `${updatedContents}${lineEnding}` : updatedContents;
    }
}

export default new DockerfileFileUpdater();
