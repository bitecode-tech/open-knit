class ApplicationYamlFileUpdater {
    updateContents(
        yamlContents: string,
        moduleNames: string[],
        applicationName: string,
        databaseName: string
    ): string {
        const updatedName = this.updateSpringApplicationName(yamlContents, applicationName);
        const updatedImport = this.updateSpringConfigImport(updatedName, moduleNames);
        return this.updateSpringDatasourceUrlDefault(updatedImport, databaseName);
    }

    private updateSpringApplicationName(yamlContents: string, applicationName: string): string {
        const lines = yamlContents.split(/\r?\n/);
        const targetName = this.buildApplicationName(applicationName);
        let inSpringBlock = false;
        let inApplicationBlock = false;
        let springIndent = "";
        let applicationIndent = "";
        let updated = false;

        for (let index = 0; index < lines.length; index += 1) {
            const line = lines[index];
            const trimmed = line.trim();

            if (!trimmed) {
                continue;
            }

            const springMatch = line.match(/^(\s*)spring:\s*$/);
            if (springMatch) {
                inSpringBlock = true;
                springIndent = springMatch[1] ?? "";
                inApplicationBlock = false;
                continue;
            }

            if (inSpringBlock) {
                const currentIndent = this.getIndent(line);
                if (currentIndent.length <= springIndent.length && /:\s*$/.test(trimmed)) {
                    inSpringBlock = false;
                    inApplicationBlock = false;
                }
            }

            if (inSpringBlock) {
                const applicationMatch = line.match(/^(\s*)application:\s*$/);
                if (applicationMatch) {
                    inApplicationBlock = true;
                    applicationIndent = applicationMatch[1] ?? "";
                    continue;
                }
            }

            if (inApplicationBlock) {
                const currentIndent = this.getIndent(line);
                if (currentIndent.length <= applicationIndent.length && /:\s*$/.test(trimmed)) {
                    inApplicationBlock = false;
                }
            }

            if (inApplicationBlock) {
                const nameMatch = line.match(/^(\s*)name:\s*.*$/);
                if (nameMatch) {
                    lines[index] = `${nameMatch[1]}name: ${targetName}`;
                    updated = true;
                    break;
                }
            }
        }

        if (!updated) {
            throw new Error("spring.application.name not found in application YAML");
        }

        return lines.join("\n");
    }

    private updateSpringConfigImport(yamlContents: string, moduleNames: string[]): string {
        const lines = yamlContents.split(/\r?\n/);
        const importLines = this.buildImportLines(moduleNames);
        let inSpringBlock = false;
        let inConfigBlock = false;
        let springIndent = "";
        let configIndent = "";
        let importLineIndex = -1;
        let updated = false;

        for (let index = 0; index < lines.length; index += 1) {
            const line = lines[index];
            const trimmed = line.trim();

            if (!trimmed) {
                continue;
            }

            const springMatch = line.match(/^(\s*)spring:\s*$/);
            if (springMatch) {
                inSpringBlock = true;
                springIndent = springMatch[1] ?? "";
                inConfigBlock = false;
                continue;
            }

            if (inSpringBlock) {
                const currentIndent = this.getIndent(line);
                if (currentIndent.length <= springIndent.length && /:\s*$/.test(trimmed)) {
                    inSpringBlock = false;
                    inConfigBlock = false;
                }
            }

            if (inSpringBlock) {
                const configMatch = line.match(/^(\s*)config:\s*$/);
                if (configMatch) {
                    inConfigBlock = true;
                    configIndent = configMatch[1] ?? "";
                    continue;
                }
            }

            if (inConfigBlock) {
                const currentIndent = this.getIndent(line);
                if (currentIndent.length <= configIndent.length && /:\s*$/.test(trimmed)) {
                    inConfigBlock = false;
                }
            }

            if (inConfigBlock) {
                const importMatch = line.match(/^(\s*)import:\s*$/);
                if (importMatch) {
                    importLineIndex = index;
                    const importIndent = importMatch[1] ?? "";
                    const listIndent = `${importIndent}  `;
                    let scanIndex = index + 1;

                    while (scanIndex < lines.length) {
                        const scanLine = lines[scanIndex];
                        const scanTrimmed = scanLine.trim();
                        if (!scanTrimmed) {
                            scanIndex += 1;
                            continue;
                        }
                        const scanIndent = this.getIndent(scanLine);
                        if (scanIndent.length <= importIndent.length && /:\s*$/.test(scanTrimmed)) {
                            break;
                        }
                        if (scanTrimmed.startsWith("-")) {
                            lines.splice(scanIndex, 1);
                            continue;
                        }
                        break;
                    }

                    const insertAt = importLineIndex + 1;
                    const formattedImports = importLines.map((entry) => `${listIndent}- ${entry}`);
                    lines.splice(insertAt, 0, ...formattedImports);
                    updated = true;
                    break;
                }
            }
        }

        if (!updated) {
            throw new Error("spring.config.import not found in application YAML");
        }

        return lines.join("\n");
    }

    private buildApplicationName(applicationName: string): string {
        const trimmedName = applicationName.trim();
        if (!trimmedName) {
            return "backend";
        }
        if (trimmedName === "backend") {
            return "backend";
        }
        if (trimmedName.endsWith("-backend")) {
            return trimmedName;
        }
        return `${trimmedName}-backend`;
    }

    private buildImportLines(moduleNames: string[]): string[] {
        const seen = new Set<string>();
        const orderedImports: string[] = [];

        for (const moduleName of moduleNames) {
            const importEntry = `classpath:application-${moduleName}.yaml`;
            if (seen.has(importEntry)) {
                continue;
            }
            seen.add(importEntry);
            orderedImports.push(importEntry);
        }

        return orderedImports;
    }

    private updateSpringDatasourceUrlDefault(yamlContents: string, databaseName: string): string {
        const lines = yamlContents.split(/\r?\n/);
        let inSpringBlock = false;
        let inDatasourceBlock = false;
        let springIndent = "";
        let datasourceIndent = "";
        let updated = false;

        for (let index = 0; index < lines.length; index += 1) {
            const line = lines[index];
            const trimmed = line.trim();

            if (!trimmed) {
                continue;
            }

            const springMatch = line.match(/^(\s*)spring:\s*$/);
            if (springMatch) {
                inSpringBlock = true;
                springIndent = springMatch[1] ?? "";
                inDatasourceBlock = false;
                continue;
            }

            if (inSpringBlock) {
                const currentIndent = this.getIndent(line);
                if (currentIndent.length <= springIndent.length && /:\s*$/.test(trimmed)) {
                    inSpringBlock = false;
                    inDatasourceBlock = false;
                }
            }

            if (inSpringBlock) {
                const datasourceMatch = line.match(/^(\s*)datasource:\s*$/);
                if (datasourceMatch) {
                    inDatasourceBlock = true;
                    datasourceIndent = datasourceMatch[1] ?? "";
                    continue;
                }
            }

            if (inDatasourceBlock) {
                const currentIndent = this.getIndent(line);
                if (currentIndent.length <= datasourceIndent.length && /:\s*$/.test(trimmed)) {
                    inDatasourceBlock = false;
                }
            }

            if (inDatasourceBlock) {
                const urlMatch = line.match(/^(\s*)url:\s*(.+)$/);
                if (urlMatch) {
                    const indent = urlMatch[1];
                    const value = urlMatch[2];
                    const defaultUrl = `jdbc:postgresql://localhost:5432/${databaseName}`;
                    const envDefaultMatch = value.match(/^\$\{SPRING_DATASOURCE_URL:([^}]+)\}$/);
                    if (envDefaultMatch) {
                        lines[index] = `${indent}url: \${SPRING_DATASOURCE_URL:${defaultUrl}}`;
                    } else {
                        lines[index] = `${indent}url: ${defaultUrl}`;
                    }
                    updated = true;
                    break;
                }
            }
        }

        if (!updated) {
            throw new Error("spring.datasource.url not found in application YAML");
        }

        return lines.join("\n");
    }

    private getIndent(line: string): string {
        const match = line.match(/^\s*/);
        return match ? match[0] : "";
    }
}

const applicationYamlFileUpdater = new ApplicationYamlFileUpdater();
export default applicationYamlFileUpdater;
