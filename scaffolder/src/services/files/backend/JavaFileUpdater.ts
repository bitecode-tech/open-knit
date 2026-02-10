class JavaFileUpdater {
    updateAppPackageReferences(
        javaContents: string,
        sourcePackageName: string,
        targetPackageName: string
    ): string {
        if (sourcePackageName === targetPackageName) {
            return javaContents;
        }

        const packagePattern = new RegExp(`^\\s*package\\s+${this.escapeRegex(sourcePackageName)};`, "m");
        let updated = javaContents.replace(
            packagePattern,
            `package ${targetPackageName};`
        );

        updated = updated
            .split(/\r?\n/)
            .map((line) => this.updateBasePackageLine(line, sourcePackageName, targetPackageName))
            .join("\n");

        return updated;
    }

    private updateBasePackageLine(line: string, sourcePackageName: string, targetPackageName: string): string {
        if (!line.includes("@ComponentScan") && !line.includes("@EnableJpaRepositories") && !line.includes("@EntityScan")) {
            return line;
        }

        const sourceLiteral = `"${sourcePackageName}"`;
        const targetLiteral = `"${targetPackageName}"`;
        return line.replace(sourceLiteral, targetLiteral);
    }

    private escapeRegex(value: string): string {
        return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }
}

const javaFileUpdater = new JavaFileUpdater();
export default javaFileUpdater;
