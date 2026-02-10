class DockerComposeFileUpdater {
    updateContents(composeContents: string, containerName: string, databaseName: string): string {
        const lines = composeContents.split(/\r?\n/);

        const appBlock = this.findServiceBlock(lines, "app");
        const postgresBlock = this.findServiceBlock(lines, "postgres");

        if (!appBlock) {
            throw new Error("services.app block not found in docker-compose.yml");
        }
        if (!postgresBlock) {
            throw new Error("services.postgres block not found in docker-compose.yml");
        }

        const appContainerUpdated = this.updateContainerName(lines, appBlock, containerName);
        const appDatasourceUpdated = this.updateServiceEnvironmentValue(
            lines,
            appBlock,
            "SPRING_DATASOURCE_URL",
            `jdbc:postgresql://postgres:5432/${databaseName}`
        );
        const postgresDbUpdated = this.updateServiceEnvironmentValue(
            lines,
            postgresBlock,
            "POSTGRES_DB",
            databaseName
        );

        if (!appContainerUpdated) {
            throw new Error("container_name not found under services.app in docker-compose.yml");
        }
        if (!appDatasourceUpdated) {
            throw new Error("SPRING_DATASOURCE_URL not found under services.app.environment in docker-compose.yml");
        }
        if (!postgresDbUpdated) {
            throw new Error("POSTGRES_DB not found under services.postgres.environment in docker-compose.yml");
        }

        return lines.join("\n");
    }

    private findServiceBlock(lines: string[], serviceName: string): { start: number; end: number; indent: string } | null {
        for (let index = 0; index < lines.length; index += 1) {
            const match = lines[index].match(/^(\s*)services:\s*$/);
            if (!match) {
                continue;
            }
            const servicesIndent = match[1] ?? "";
            for (let j = index + 1; j < lines.length; j += 1) {
                const line = lines[j];
                const trimmed = line.trim();
                if (!trimmed) {
                    continue;
                }
                const indent = this.getIndent(line);
                if (indent.length <= servicesIndent.length && /:\s*$/.test(trimmed)) {
                    break;
                }
                const serviceMatch = line.match(new RegExp(`^(\\s*)${serviceName}:\\s*$`));
                if (serviceMatch) {
                    const serviceIndent = serviceMatch[1] ?? "";
                    let end = lines.length;
                    for (let k = j + 1; k < lines.length; k += 1) {
                        const nextLine = lines[k];
                        const nextTrimmed = nextLine.trim();
                        if (!nextTrimmed) {
                            continue;
                        }
                        const nextIndent = this.getIndent(nextLine);
                        if (nextIndent.length <= serviceIndent.length && /:\s*$/.test(nextTrimmed)) {
                            end = k;
                            break;
                        }
                    }
                    return {start: j, end, indent: serviceIndent};
                }
            }
        }
        return null;
    }

    private updateContainerName(
        lines: string[],
        block: { start: number; end: number; indent: string },
        containerName: string
    ): boolean {
        for (let index = block.start + 1; index < block.end; index += 1) {
            const line = lines[index];
            const trimmedLine = line.trim();
            if (!trimmedLine) {
                continue;
            }
            const indent = this.getIndent(line);
            if (indent.length <= block.indent.length && /:\s*$/.test(trimmedLine)) {
                break;
            }
            const containerMatch = line.match(/^(\s*)container_name:\s*(.+)$/);
            if (containerMatch) {
                lines[index] = `${containerMatch[1]}container_name: ${containerName}`;
                return true;
            }
        }
        return false;
    }

    private updateServiceEnvironmentValue(
        lines: string[],
        block: { start: number; end: number; indent: string },
        key: string,
        value: string
    ): boolean {
        for (let index = block.start + 1; index < block.end; index += 1) {
            const line = lines[index];
            const trimmedLine = line.trim();
            if (!trimmedLine) {
                continue;
            }
            const indent = this.getIndent(line);
            if (indent.length <= block.indent.length && /:\s*$/.test(trimmedLine)) {
                break;
            }

            const envMatch = line.match(/^(\s*)environment:\s*$/);
            if (!envMatch) {
                continue;
            }
            const envIndent = envMatch[1] ?? "";
            for (let j = index + 1; j < block.end; j += 1) {
                const envLine = lines[j];
                const envTrimmed = envLine.trim();
                if (!envTrimmed) {
                    continue;
                }
                const envLineIndent = this.getIndent(envLine);
                if (envLineIndent.length <= envIndent.length && /:\s*$/.test(envTrimmed)) {
                    break;
                }
                const keyMatch = envLine.match(new RegExp(`^(\\s*)${this.escapeRegex(key)}:\\s*(.+)$`));
                if (keyMatch) {
                    lines[j] = `${keyMatch[1]}${key}: ${value}`;
                    return true;
                }
            }
        }
        return false;
    }

    private getIndent(line: string): string {
        const match = line.match(/^\s*/);
        return match ? match[0] : "";
    }

    private escapeRegex(value: string): string {
        return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }
}

const dockerComposeFileUpdater = new DockerComposeFileUpdater();
export default dockerComposeFileUpdater;
