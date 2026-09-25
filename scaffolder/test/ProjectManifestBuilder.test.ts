import assert from "node:assert/strict";
import {test} from "node:test";
import projectManifestBuilder from "@/services/ProjectManifestBuilder";
import type {TargetPlatform} from "@/projectSpec/projectSpec";
import type {ScaffolderRunContext} from "@/types/ScaffolderRunContext";

const gradleContents = `java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(25)
    }
}`;

const packageJsonContents = JSON.stringify({
    packageManager: "pnpm@10.32.1+sha512.a706938f0e89ac14",
    engines: {node: "22.x"}
});

const rootComposeContents = `name: test-project
services:
  backend:
    ports:
      - "8080:8080"
  postgres:
    image: pgvector/pgvector:pg17
  frontend:
    ports:
      - "3030:3030"
`;

function createRunContext(
    targetPlatform: TargetPlatform,
    modules: string[] = ["identity"],
    demoInsertsEnabled = true
): ScaffolderRunContext {
    return {
        projectSpec: {
            schemaVersion: 1,
            projectName: "test-project",
            modules,
            targetPlatform,
            demoInsertsEnabled
        },
        resolvedPaths: {
            scaffolderRoot: "/scaffolder",
            repositoryRoot: "/repo",
            backendRoot: "/repo/backend",
            frontendRoot: "/repo/frontend",
            backendModulesRoot: "/repo/backend/modules",
            frontendModulesRoot: "/repo/frontend/modules",
            outputRoot: "/scaffolder/output"
        },
        backendRootItems: new Set(),
        frontendRootItems: new Set(),
        repoRootItems: new Set(),
        moduleAliases: {},
        availableModules: modules,
        requestedModules: modules,
        applicationName: "test-project",
        isApplicationNameProvided: true,
        cacheMode: "rebuild"
    };
}

function buildManifest(targetPlatform: TargetPlatform) {
    return projectManifestBuilder.build(
        createRunContext(targetPlatform),
        gradleContents,
        packageJsonContents,
        rootComposeContents
    );
}

test("project manifest derives toolchains, ports, login and seed metadata", () => {
    const manifest = buildManifest("linux");

    assert.equal(manifest.schemaVersion, 1);
    assert.equal(manifest.projectName, "test-project");
    assert.equal(manifest.targetPlatform, "linux");
    assert.equal(manifest.javaToolchainVersion, "25");
    assert.equal(manifest.nodeVersion, "22.x");
    assert.equal(manifest.pnpmVersion, "10.32.1");
    assert.deepEqual(manifest.requiredDockerComposeCapabilities, {
        command: "docker compose",
        features: ["compose-v2", "linux-bind-mounts"],
        minimumVersion: null
    });
    assert.deepEqual(manifest.services, [
        {name: "backend", ports: [{hostPort: 8080, containerPort: 8080, protocol: "tcp"}]},
        {name: "postgres", ports: []},
        {name: "frontend", ports: [{hostPort: 3030, containerPort: 3030, protocol: "tcp"}]}
    ]);
    assert.deepEqual(manifest.readinessProbes, [
        {service: "backend", type: "tcp", host: "127.0.0.1", port: 8080, protocol: "tcp"},
        {service: "frontend", type: "tcp", host: "127.0.0.1", port: 3030, protocol: "tcp"}
    ]);
    assert.equal(manifest.startCommand, "docker compose up");
    assert.equal(manifest.loginRoute, "/login");
    assert.equal(manifest.seedMode, "demo-inserts");
    assert.equal(manifest.adminLoginAvailable, true);
});

test("Windows and macOS manifests require Compose Watch", () => {
    for (const targetPlatform of ["windows", "macos"] as const) {
        const manifest = buildManifest(targetPlatform);
        assert.equal(manifest.targetPlatform, targetPlatform);
        assert.equal(manifest.startCommand, "docker compose watch");
        assert.deepEqual(manifest.requiredDockerComposeCapabilities, {
            command: "docker compose",
            features: ["compose-v2", "compose-watch"],
            minimumVersion: "2.22.0"
        });
    }
});

test("identity and demo seed metadata reflect the selected project spec", () => {
    const noIdentity = projectManifestBuilder.build(
        createRunContext("linux", ["payment"], true),
        gradleContents,
        packageJsonContents,
        rootComposeContents
    );
    const noDemoInserts = projectManifestBuilder.build(
        createRunContext("linux", ["identity"], false),
        gradleContents,
        packageJsonContents,
        rootComposeContents
    );

    assert.equal(noIdentity.loginRoute, null);
    assert.equal(noIdentity.adminLoginAvailable, false);
    assert.equal(noDemoInserts.loginRoute, "/login");
    assert.equal(noDemoInserts.seedMode, "disabled");
    assert.equal(noDemoInserts.adminLoginAvailable, false);
});

test("manifest generation rejects ambiguous or missing generated metadata", () => {
    const context = createRunContext("linux");
    assert.throws(() => projectManifestBuilder.build(
        context,
        `${gradleContents}\nlanguageVersion = JavaLanguageVersion.of(24)`,
        packageJsonContents,
        rootComposeContents
    ), /missing or ambiguous/);
    assert.throws(() => projectManifestBuilder.build(
        context,
        gradleContents,
        JSON.stringify({packageManager: "npm@10.0.0"}),
        rootComposeContents
    ), /engines/);
    assert.throws(() => projectManifestBuilder.build(
        context,
        gradleContents,
        packageJsonContents,
        `services:\n  backend:\n    ports: [\"8080-8090:8080\"]`
    ), /unsupported port value/);
});
