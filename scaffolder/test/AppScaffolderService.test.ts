import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {test} from "node:test";
import yauzl from "yauzl";
import appScaffolderService from "../src/services/AppScaffolderService";
import type {ScaffolderRunContext} from "../src/types/ScaffolderRunContext";
import type {ScaffolderRunHelpers} from "../src/types/ScaffolderRunHelpers";

const FIGMA_SKILL_ZIP_PATH = ".agents/skills/figma-focused-implementation/SKILL.md";

test("base app ZIP always includes the focused Figma implementation skill", async () => {
    const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), "open-knit-figma-skill-"));
    const backendRoot = path.join(temporaryRoot, "backend");
    const frontendRoot = path.join(temporaryRoot, "frontend");
    const outputRoot = path.join(temporaryRoot, "output");
    fs.mkdirSync(backendRoot, {recursive: true});
    fs.mkdirSync(frontendRoot, {recursive: true});

    const repositoryRoot = path.resolve(__dirname, "..", "..");
    const runContext: ScaffolderRunContext = {
        resolvedPaths: {
            scaffolderRoot: path.join(repositoryRoot, "scaffolder"),
            repositoryRoot,
            backendRoot,
            frontendRoot,
            backendModulesRoot: path.join(backendRoot, "modules"),
            frontendModulesRoot: path.join(frontendRoot, "modules"),
            outputRoot
        },
        backendRootItems: new Set<string>(),
        frontendRootItems: new Set<string>(),
        repoRootItems: new Set(["AGENTS.md"]),
        moduleAliases: {},
        availableModules: [],
        requestedModules: [],
        applicationName: "figma-skill-test",
        isApplicationNameProvided: true,
        cacheMode: "rebuild"
    };
    const runHelpers: ScaffolderRunHelpers = {
        readRequiredFile: () => {
            throw new Error("No required files are expected for a base-tree test.");
        },
        runStep: async (_message, action) => await action()
    };

    try {
        const baseZipPath = await appScaffolderService.prepareBaseTree(runContext, runHelpers);
        const zipEntries = await readZipEntryNames(baseZipPath);
        const generatedAgents = fs.readFileSync(
            path.join(outputRoot, ".cache", "app-base", "AGENTS.md"),
            "utf8"
        );

        assert.ok(zipEntries.includes(FIGMA_SKILL_ZIP_PATH));
        assert.ok(zipEntries.includes("AGENTS.md"));
        assert.match(generatedAgents, /\.agents\/skills\/figma-focused-implementation\/SKILL\.md/);
        assert.equal(
            fs.readFileSync(path.join(outputRoot, ".cache", "app-base", FIGMA_SKILL_ZIP_PATH), "utf8"),
            fs.readFileSync(path.join(repositoryRoot, ".codex", "skills", "figma-focused-implementation", "SKILL.md"), "utf8")
        );
    } finally {
        fs.rmSync(temporaryRoot, {recursive: true, force: true});
    }
});

function readZipEntryNames(zipPath: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
        const entryNames: string[] = [];
        yauzl.open(zipPath, {lazyEntries: true}, (error, zipFile) => {
            if (error || !zipFile) {
                reject(error ?? new Error("Could not open generated base ZIP."));
                return;
            }

            zipFile.on("entry", (entry) => {
                entryNames.push(entry.fileName);
                zipFile.readEntry();
            });
            zipFile.on("end", () => resolve(entryNames));
            zipFile.on("error", reject);
            zipFile.readEntry();
        });
    });
}
