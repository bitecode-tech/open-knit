class BuildGradleFileUpdater {
    updateDependenciesContents(buildGradleContents: string, moduleNames: string[]): string {
        const dependenciesBlocks = [...buildGradleContents.matchAll(/^dependencies\s*\{/gm)];
        if (dependenciesBlocks.length === 0) {
            throw new Error("dependencies block not found in build.gradle");
        }

        const blockStart = dependenciesBlocks[dependenciesBlocks.length - 1].index ?? 0;
        const blockOpenIndex = buildGradleContents.indexOf("{", blockStart);
        if (blockOpenIndex === -1) {
            throw new Error("dependencies block opening brace not found in build.gradle");
        }

        const blockEnd = this.findMatchingBrace(buildGradleContents, blockOpenIndex);
        if (blockEnd === -1) {
            throw new Error("dependencies block closing brace not found in build.gradle");
        }

        const blockBody = buildGradleContents.slice(blockOpenIndex + 1, blockEnd);
        const moduleLines = this.buildModuleDependencyLines(blockBody, moduleNames);
        const updatedBody = this.replaceModuleDependencyLines(blockBody, moduleLines);

        return `${buildGradleContents.slice(0, blockOpenIndex + 1)}${updatedBody}${buildGradleContents.slice(blockEnd)}`;
    }

    private replaceModuleDependencyLines(blockBody: string, moduleLines: string[]): string {
        const moduleLinePattern = /^\s*implementation project\(':modules:[^']+'\)\s*$/gm;
        const cleanedBody = blockBody.replace(moduleLinePattern, "");
        const trimmedBody = cleanedBody.replace(/^\s*\n/, "\n");
        const indent = this.resolveModuleIndent(blockBody);
        const moduleBlock = `${indent}${moduleLines.join(`\n${indent}`)}\n`;
        return `${moduleBlock}${trimmedBody}`;
    }

    private buildModuleDependencyLines(blockBody: string, moduleNames: string[]): string[] {
        const orderedModules: string[] = [];
        const seen = new Set<string>();

        const addModule = (moduleName: string) => {
            if (seen.has(moduleName)) {
                return;
            }
            seen.add(moduleName);
            orderedModules.push(moduleName);
        };

        addModule("_common");
        moduleNames.forEach((moduleName) => addModule(moduleName));

        return orderedModules.map((moduleName) => {
            return `implementation project(':modules:${moduleName}')`;
        });
    }

    private findMatchingBrace(contents: string, openIndex: number): number {
        let depth = 0;
        for (let index = openIndex; index < contents.length; index += 1) {
            const char = contents[index];
            if (char === "{") {
                depth += 1;
            } else if (char === "}") {
                depth -= 1;
                if (depth === 0) {
                    return index;
                }
            }
        }
        return -1;
    }

    private resolveModuleIndent(blockBody: string): string {
        const indentMatch = blockBody.match(/^\s*implementation project\(':modules:[^']+'\)/m);
        if (!indentMatch) {
            return "\t";
        }
        const whitespaceMatch = indentMatch[0].match(/^\s*/);
        return whitespaceMatch ? whitespaceMatch[0] : "\t";
    }
}

const buildGradleFileUpdater = new BuildGradleFileUpdater();
export default buildGradleFileUpdater;
