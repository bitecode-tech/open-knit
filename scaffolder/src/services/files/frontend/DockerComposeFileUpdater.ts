class DockerComposeFileUpdater {
    updateContents(composeContents: string, containerName: string): string {
        const lines = composeContents.split(/\r?\n/);
        let inAppService = false;
        let appIndent = "";
        let updated = false;

        for (let index = 0; index < lines.length; index += 1) {
            const line = lines[index];
            const trimmedLine = line.trim();
            if (!trimmedLine) {
                continue;
            }

            const servicesMatch = line.match(/^(\s*)services:\s*$/);
            if (servicesMatch) {
                inAppService = false;
                continue;
            }

            const appMatch = line.match(/^(\s*)app:\s*$/);
            if (appMatch) {
                inAppService = true;
                appIndent = appMatch[1] ?? "";
                continue;
            }

            if (inAppService) {
                const indentMatch = line.match(/^\s*/);
                const currentIndent = indentMatch ? indentMatch[0] : "";
                if (currentIndent.length <= appIndent.length && /:\s*$/.test(trimmedLine)) {
                    inAppService = false;
                    continue;
                }
                const containerMatch = line.match(/^(\s*)container_name:\s*(.+)$/);
                if (containerMatch) {
                    lines[index] = `${containerMatch[1]}container_name: ${containerName}`;
                    updated = true;
                    continue;
                }
            }
        }

        if (!updated) {
            throw new Error("container_name not found under services.app in frontend docker-compose.yml");
        }

        return lines.join("\n");
    }
}

const dockerComposeFileUpdater = new DockerComposeFileUpdater();
export default dockerComposeFileUpdater;
