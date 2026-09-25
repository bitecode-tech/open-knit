import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import {test} from "node:test";
import {
    CANONICAL_INSTRUCTIONS,
    INSTRUCTIONS_METADATA,
    getMcpServerInstructions
} from "../src/guidance/instructions";
import {buildGeneratedProjectGuidance} from "../src/services/GeneratedProjectGuidance";
import type {OpenKnitProjectManifest} from "../src/services/ProjectManifestBuilder";
import type {ProjectSpec, TargetPlatform} from "../src/projectSpec/projectSpec";

function createManifest(targetPlatform: TargetPlatform): OpenKnitProjectManifest {
    return {
        schemaVersion: 1,
        projectName: "selected-variation",
        targetPlatform,
        javaToolchainVersion: "25",
        nodeVersion: "22.x",
        pnpmVersion: "10.32.1",
        requiredDockerComposeCapabilities: {
            command: "docker compose",
            features: targetPlatform === "linux"
                ? ["compose-v2", "linux-bind-mounts"]
                : ["compose-v2", "compose-watch"],
            minimumVersion: targetPlatform === "linux" ? null : "2.22.0"
        },
        services: [
            {name: "backend", ports: [{hostPort: 8080, containerPort: 8080, protocol: "tcp"}]},
            {name: "postgres", ports: []},
            {name: "frontend", ports: [{hostPort: 3030, containerPort: 3030, protocol: "tcp"}]}
        ],
        startCommand: targetPlatform === "linux" ? "docker compose up" : "docker compose watch",
        readinessProbes: [
            {service: "backend", type: "tcp", host: "127.0.0.1", port: 8080, protocol: "tcp"},
            {service: "frontend", type: "tcp", host: "127.0.0.1", port: 3030, protocol: "tcp"}
        ],
        loginRoute: "/login",
        seedMode: "disabled",
        adminLoginAvailable: false
    };
}

test("initialization instructions carry a complete safe workflow in the first 512 characters", () => {
    const instructionsPrefix = getMcpServerInstructions().slice(0, 512);
    const safeWorkflow = CANONICAL_INSTRUCTIONS.split("\n\n", 1)[0] ?? CANONICAL_INSTRUCTIONS;
    assert.equal(INSTRUCTIONS_METADATA.sha256, createHash("sha256").update(CANONICAL_INSTRUCTIONS).digest("hex"));
    assert.equal(INSTRUCTIONS_METADATA.version, "1.0.0");
    assert.equal(INSTRUCTIONS_METADATA.resourceUri, "openknit://scaffolder/onboarding");
    assert.equal(instructionsPrefix.slice(0, safeWorkflow.length), safeWorkflow);
    assert.match(instructionsPrefix, /list_project_options/);
    assert.match(instructionsPrefix, /targetPlatform explicitly/);
    assert.match(instructionsPrefix, /validate_project_spec/);
    assert.match(instructionsPrefix, /generate_project/);
    assert.match(instructionsPrefix, /setup requirements before download\/extraction/);
    assert.match(instructionsPrefix, /Verify ZIP SHA-256 and expiry/);
    assert.match(instructionsPrefix, /new empty directory/);
    assert.match(instructionsPrefix, /does not inspect your machine, install software, start Docker, open a browser, or deploy an application/);
});

test("generated root guidance reflects the selected modules, platform, ports, and credentials boundary", () => {
    const projectSpec: ProjectSpec = {
        schemaVersion: 1,
        projectName: "selected-variation",
        modules: ["identity", "ai"],
        targetPlatform: "windows",
        demoInsertsEnabled: false
    };
    const guidance = buildGeneratedProjectGuidance(projectSpec, createManifest("windows"));

    assert.match(guidance.readme, /Selected modules/);
    assert.match(guidance.readme, /- ai/);
    assert.match(guidance.readme, /- identity/);
    assert.doesNotMatch(guidance.readme, /- payment/);
    assert.match(guidance.readme, /Windows with Docker Desktop/);
    assert.match(guidance.readme, /docker compose watch/);
    assert.match(guidance.readme, /Java SDK 25/);
    assert.match(guidance.readme, /Node\.js 22\.x and pnpm 10\.32\.1/);
    assert.match(guidance.readme, /host 8080 -> container 8080/);
    assert.match(guidance.readme, /backend\/\.env and frontend\/\.env/);
    assert.doesNotMatch(guidance.readme, /test123|docker-compose-windows\.yml|README-run\.md/i);
    assert.match(guidance.agents, /backend\/modules\/ai\/AGENTS\.md/);
    assert.match(guidance.agents, /backend\/modules\/identity\/AGENTS\.md/);
    assert.doesNotMatch(guidance.agents, /backend\/modules\/payment\/AGENTS\.md/);
    assert.match(guidance.agents, /Do not assume demo users have usable credentials/);

    const linuxGuidance = buildGeneratedProjectGuidance(projectSpec, createManifest("linux"));
    assert.match(linuxGuidance.readme, /Linux \(native Linux or WSL using a Linux Docker engine\)/);
    assert.match(linuxGuidance.readme, /docker compose up/);
});
