import assert from "node:assert/strict";
import {test} from "node:test";
import packageJsonFileUpdater from "@/services/files/frontend/PackageJsonFileUpdater";

test("frontend package updater adds Node engine metadata without changing pnpm version", () => {
    const updatedPackageJson = packageJsonFileUpdater.updateContents(
        JSON.stringify({name: "template", packageManager: "pnpm@10.32.1"}),
        "generated-frontend",
        "22.x"
    );
    const parsed: unknown = JSON.parse(updatedPackageJson);
    assert.equal(typeof parsed, "object");
    assert.notEqual(parsed, null);
    assert.equal((parsed as {name: string}).name, "generated-frontend");
    assert.equal((parsed as {packageManager: string}).packageManager, "pnpm@10.32.1");
    assert.equal((parsed as {engines: {node: string}}).engines.node, "22.x");
});

test("frontend package updater preserves existing Node engine constraints", () => {
    const updatedPackageJson = packageJsonFileUpdater.updateContents(
        JSON.stringify({name: "template", engines: {node: ">=22 <23"}}),
        "generated-frontend",
        "22.x"
    );
    const parsed = JSON.parse(updatedPackageJson) as {engines: {node: string}};
    assert.equal(parsed.engines.node, ">=22 <23");
});
