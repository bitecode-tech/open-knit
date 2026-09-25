import type {OpenKnitProjectManifest} from "./ProjectManifestBuilder";
import type {ProjectSpec} from "@/projectSpec/projectSpec";

export interface GeneratedProjectGuidance {
    readme: string;
    agents: string;
}

export function buildGeneratedProjectGuidance(
    projectSpec: ProjectSpec,
    manifest: OpenKnitProjectManifest
): GeneratedProjectGuidance {
    const selectedModules = [...projectSpec.modules].sort();
    const moduleList = selectedModules.length > 0
        ? selectedModules.map((moduleId) => "- " + moduleId).join("\n")
        : "- No optional modules selected";
    const moduleGuides = ["_common", ...selectedModules]
        .map((moduleId) => "- [" + moduleId + " backend guidance](backend/modules/" + moduleId + "/AGENTS.md)")
        .join("\n");
    const ports = formatPorts(manifest);
    const command = manifest.startCommand;
    const platformDescription = manifest.targetPlatform === "linux"
        ? "Linux (native Linux or WSL using a Linux Docker engine)"
        : manifest.targetPlatform === "windows"
            ? "Windows with Docker Desktop"
            : "macOS with Docker Desktop";
    const composeMinimum = manifest.requiredDockerComposeCapabilities.minimumVersion === null
        ? "Compose v2"
        : "Docker Compose " + manifest.requiredDockerComposeCapabilities.minimumVersion + " or newer";
    const loginInstructions = manifest.loginRoute === null
        ? "This variation has no identity login route."
        : "The login page is at " + manifest.loginRoute + ". Admin seeding is " +
            (manifest.adminLoginAvailable
                ? "enabled by the manifest; verify the local seed and password configuration before signing in"
                : "not available from the selected seed configuration") +
            ". No login password is published in this guide; sign in manually after the application is ready.";
    const backendTestCommand = manifest.targetPlatform === "windows"
        ? ".\\gradlew.bat test"
        : "./gradlew test";

    const readme = [
        "# " + manifest.projectName,
        "",
        "This OpenKnit project was generated for **" + platformDescription + "**. Generation created this project archive; it did not install software, start services, sign in, or deploy the application.",
        "",
        "## Selected modules",
        "",
        moduleList,
        "",
        "The shared backend _common module is included automatically.",
        "",
        "## Before you start",
        "",
        "- Java SDK " + manifest.javaToolchainVersion + " for host-native backend development. The backend Gradle toolchain is declared in backend/build.gradle.",
        "- Node.js " + manifest.nodeVersion + " and pnpm " + manifest.pnpmVersion + " for host-native frontend development. The generated frontend package.json declares these versions.",
        "- Docker Engine with " + composeMinimum + "; confirm the daemon is running with docker info.",
        "- Read open-knit-project.json for the full service, port, toolchain, and readiness metadata.",
        "",
        "Container startup uses the Java and Node versions in its service images. Host Java and Node are needed for host-native builds and development tools.",
        "",
        "## Safe setup sequence",
        "",
        "1. Verify the downloaded archive against its published SHA-256 checksum and expiry.",
        "2. Extract it into a new, empty directory. Inspect open-knit-project.json, this README, and the root files before running scripts.",
        "3. Check the installed Java, Node, pnpm, Docker Engine, and Compose versions against the manifest and this README. Install missing or mismatched tools from their official maintainers using verified installers. Confirm the Docker daemon is running.",
        "4. Review backend/.env and frontend/.env; configure local values from the supplied .env-template files where present. Keep passwords, tokens, and other credentials in ignored local environment files and never commit them. Do not rely on an example or fixed password.",
        "5. From this project root, start the selected stack with the manifest command:",
        "",
        "~~~shell",
        command,
        "~~~",
        "",
        "6. Wait for database and application startup and for every readiness probe in open-knit-project.json to pass before opening the UI.",
        "7. Read AGENTS.md and the selected module guidance before changing code. Sign in manually when the page is ready.",
        "",
        "## Services and host ports",
        "",
        ports,
        "",
        "The frontend normally serves on http://localhost:3030 and the backend API on http://localhost:8080 when those host ports are present in the manifest.",
        "",
        "## Development checks",
        "",
        "Backend:",
        "",
        "~~~shell",
        "cd backend",
        backendTestCommand,
        "~~~",
        "",
        "Frontend:",
        "",
        "~~~shell",
        "cd frontend",
        "pnpm install",
        "pnpm run typecheck",
        "pnpm lint",
        "pnpm build",
        "~~~",
        "",
        loginInstructions,
        ""
    ].join("\n");
    const agents = [
        "# Agent guidance for " + manifest.projectName,
        "",
        "## Project composition",
        "",
        "- Target platform: **" + platformDescription + "**; use the root Compose file and the " + command + " command shown in the README.",
        "- Selected business modules: " + (selectedModules.length > 0 ? selectedModules.join(", ") : "none") + ".",
        "- The shared backend _common module is included automatically.",
        "- Generated service ports, toolchain versions, and readiness probes are recorded in open-knit-project.json.",
        "",
        "## Boundaries",
        "",
        "- Keep backend and frontend feature code in their corresponding modules/<module>/ directories.",
        "- Keep shared backend contracts and utilities in backend/modules/_common; backend modules must not reach into another module's implementation.",
        "- Keep shared frontend code in frontend/modules/_common; feature modules must not import another feature module's implementation.",
        "- Connect backend and frontend through the module's HTTP API, controller, and frontend client. Do not bypass those boundaries with direct cross-side imports.",
        "- Follow each selected module's guidance before editing that module. Do not copy guidance for modules absent from this project.",
        "",
        "## Environment and credentials",
        "",
        "- Keep local environment values and credentials in ignored local environment files. Never commit passwords, tokens, or keys.",
        "- Do not assume demo users have usable credentials. Check the selected seed mode and configure local-only passwords before relying on login.",
        "- The generated project has not been deployed or signed into. Do not report either action as complete unless you performed and verified it in the user's authorized local environment.",
        "",
        "## Checks",
        "",
        "- Backend: run cd backend && " + backendTestCommand + ".",
        "- Frontend: from frontend/, run pnpm run typecheck, pnpm lint, and pnpm build for relevant changes.",
        "- For a full-stack change, verify the backend controller/API and matching frontend client together, then check readiness with open-knit-project.json.",
        "- Do not change Compose platform selection, module membership, or credential strategy without reflecting that change in the project manifest and README.",
        "",
        "## Module-owned guidance",
        "",
        moduleGuides,
        ""
    ].join("\n");

    return {readme, agents};
}

function formatPorts(manifest: OpenKnitProjectManifest): string {
    const serviceLines = manifest.services.flatMap((service) => service.ports.map((port) => {
        const hostPort = port.hostPort === null ? "not published to the host" : "host " + port.hostPort;
        return "- " + service.name + ": " + hostPort + " -> container " + port.containerPort + "/" + port.protocol;
    }));
    return serviceLines.length > 0 ? serviceLines.join("\n") : "No service ports are published to the host.";
}
