import {createHash} from "node:crypto";

export const INSTRUCTIONS_VERSION = "1.0.0";
export const INSTRUCTIONS_LAST_MODIFIED = "2026-09-25T00:00:00.000Z";
export const ONBOARDING_RESOURCE_URI = "openknit://scaffolder/onboarding";

export const CANONICAL_INSTRUCTIONS = `Use list_project_options to discover supported modules/platforms. Choose targetPlatform explicitly; validate_project_spec and resolve errors before generate_project. Read onboarding and platform setup requirements before download/extraction. Verify ZIP SHA-256 and expiry, then extract to a new empty directory and inspect open-knit-project.json and root before scripts. Generation creates files only; it does not inspect your machine, install software, start Docker, open a browser, or deploy an application.

# OpenKnit project onboarding and development

## Before generation

1. Call \`list_project_options\` and choose a supported module set and \`targetPlatform\`. Identity is required. Ready-system presets are not available.
2. Call \`validate_project_spec\` before \`generate_project\`. Do not ask the generator to install or deploy anything.
3. Read this guide and the platform-specific requirements returned by \`generate_project\` before offering download or extraction. A ZIP link has an expiry; verify its SHA-256 after download.
4. Extract only into a new, empty directory. Inspect \`open-knit-project.json\`, \`docker-compose.yml\`, and the project root before running scripts.

## Before development

1. Read \`open-knit-project.json\` for the selected modules, platform, toolchain versions, ports, start command, and readiness probes. Check Java using the declared Gradle toolchain version, Node using the generated frontend version, pnpm using the frontend \`packageManager\` pin, and Docker Engine plus Compose v2. Confirm the Docker daemon is running.
2. If a required host tool is missing or mismatched, install it from its official maintainer using a verified installer. Compose images provide Java and Node for container startup; host Java and Node are needed for host-native development and tooling.
3. Review the generated environment files and configure local values before startup. Keep credentials in ignored local environment files, never commit them, and do not assume seeded login credentials are usable until local seeding is confirmed.
4. From the project root, run the manifest's exact platform-selected command: \`docker compose up\` on Linux or \`docker compose watch\` on Windows and macOS. Wait for the manifest readiness probes and database/application startup before opening the login route, when one is present.
5. Read the generated \`AGENTS.md\` and the linked module guidance before changing code. Run the scoped backend and frontend checks listed there after changes. Sign in manually in the browser; generation and local setup do not perform sign-in or deployment for you.

## Host boundary

The remote MCP service returns project-specific requirements, commands, a versioned guide, and a ZIP artifact. Only a trusted local harness with appropriate host access can inspect installed tools, download and verify the artifact, install software, start Docker, wait for services, or open a browser. If the harness lacks that access, stop at these instructions and ask the user to provide a capable local environment. MCP instructions and resources guide clients; they do not enforce client behavior or a setup-before-extraction gate.

## Generic development task intake

Describe development work with an objective or title, context, acceptance criteria, constraints, dependencies, required setup, and verification. Notion may add context when connected, but it is optional and must not block task creation, planning, or implementation. For substantial work, create or update an implementation plan before coding and keep its progress and verification evidence current. Use the Heavy route when the local harness provides it; otherwise use the host's equivalent planning workflow.
`;

export interface CanonicalInstructionsMetadata {
    version: string;
    sha256: string;
    lastModified: string;
    resourceUri: string;
}

export interface CanonicalInstructions extends CanonicalInstructionsMetadata {
    content: string;
}

export const INSTRUCTIONS_METADATA: CanonicalInstructionsMetadata = {
    version: INSTRUCTIONS_VERSION,
    sha256: createHash("sha256").update(CANONICAL_INSTRUCTIONS, "utf8").digest("hex"),
    lastModified: INSTRUCTIONS_LAST_MODIFIED,
    resourceUri: ONBOARDING_RESOURCE_URI
};

export const CANONICAL_INSTRUCTIONS_DOCUMENT: CanonicalInstructions = {
    ...INSTRUCTIONS_METADATA,
    content: CANONICAL_INSTRUCTIONS
};

export function getMcpServerInstructions(): string {
    const safeWorkflow = CANONICAL_INSTRUCTIONS.split("\n\n", 1)[0] || CANONICAL_INSTRUCTIONS;
    return safeWorkflow + "\n\nFull guide: GET /api/instructions or read " + ONBOARDING_RESOURCE_URI +
        " (version " + INSTRUCTIONS_VERSION + ", SHA-256 " + INSTRUCTIONS_METADATA.sha256 + ").";
}
