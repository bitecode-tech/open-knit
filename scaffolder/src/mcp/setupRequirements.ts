import fs from "fs";
import path from "path";
import type {PathsConfig} from "@/types/PathsConfig";

export interface SetupRequirement {
    name: string;
    requiredFor: string[];
    purpose: string;
    checkCommands: string[];
    projectVersionRequirement: string | null;
}

export interface ProjectSetupRequirements {
    containerDevelopment: string;
    nativeDevelopment: string;
    requirements: SetupRequirement[];
    startCommands: string[];
    assistantGuidance: string[];
}

function readOptionalFile(filePath: string): string | null {
    try {
        return fs.readFileSync(filePath, "utf8");
    } catch {
        return null;
    }
}

function findJavaVersion(buildGradle: string | null): string | null {
    if (!buildGradle) {
        return null;
    }
    const match = buildGradle.match(/JavaLanguageVersion\.of\((\d+)\)/);
    return match?.[1] ?? null;
}

function parsePackageJson(packageJsonContents: string | null): Record<string, unknown> | null {
    if (!packageJsonContents) {
        return null;
    }
    try {
        const packageJson: unknown = JSON.parse(packageJsonContents);
        if (typeof packageJson !== "object" || packageJson === null || Array.isArray(packageJson)) {
            return null;
        }
        return packageJson as Record<string, unknown>;
    } catch {
        return null;
    }
}

function findPackageManager(packageJson: Record<string, unknown> | null): string | null {
    const packageManager = packageJson?.packageManager;
    return typeof packageManager === "string" ? packageManager : null;
}

function findNodeVersionRequirement(packageJson: Record<string, unknown> | null): string | null {
    const engines = packageJson?.engines;
    if (typeof engines === "object" && engines !== null && "node" in engines && typeof engines.node === "string") {
        return engines.node;
    }

    const dependencies = packageJson?.dependencies;
    const devDependencies = packageJson?.devDependencies;
    const viteVersion = [dependencies, devDependencies]
        .filter((value): value is Record<string, unknown> => typeof value === "object" && value !== null)
        .map((value) => value.vite)
        .find((value): value is string => typeof value === "string");
    const viteMajorVersion = viteVersion?.match(/\d+/)?.[0];
    if (viteMajorVersion && Number(viteMajorVersion) >= 7) {
        return "^20.19.0 || >=22.12.0 (Vite 7 requirement)";
    }
    return null;
}

export function getProjectSetupRequirements(paths: PathsConfig): ProjectSetupRequirements {
    const javaVersion = findJavaVersion(
        readOptionalFile(path.join(paths.backendRoot, "build.gradle"))
    );
    const frontendPackage = parsePackageJson(
        readOptionalFile(path.join(paths.frontendRoot, "package.json"))
    );
    const packageManager = findPackageManager(frontendPackage);
    const nodeVersionRequirement = findNodeVersionRequirement(frontendPackage);
    const pnpmVersion = packageManager?.startsWith("pnpm@")
        ? packageManager.slice("pnpm@".length).split("+")[0]
        : null;

    return {
        containerDevelopment: "Docker Compose can run the generated services and their local dependencies.",
        nativeDevelopment: "For running backend and frontend processes directly on the host, install Java, Node.js, and pnpm. Docker remains useful for local databases and other dependencies.",
        requirements: [
            {
                name: "Docker Engine",
                requiredFor: ["containerized development"],
                purpose: "Run the generated application services and local infrastructure with Docker Compose.",
                checkCommands: ["docker --version"],
                projectVersionRequirement: null
            },
            {
                name: "Docker Compose v2",
                requiredFor: ["containerized development"],
                purpose: "Start the generated local development stack.",
                checkCommands: ["docker compose version"],
                projectVersionRequirement: null
            },
            {
                name: "Java",
                requiredFor: ["native backend development"],
                purpose: "Required only when running or building the backend directly on the host.",
                checkCommands: ["java -version"],
                projectVersionRequirement: javaVersion
            },
            {
                name: "Node.js",
                requiredFor: ["native frontend development"],
                purpose: "Required only when running or building the frontend directly on the host.",
                checkCommands: ["node --version"],
                projectVersionRequirement: nodeVersionRequirement
            },
            {
                name: "pnpm",
                requiredFor: ["native frontend development"],
                purpose: "Package manager used by the generated frontend for host development.",
                checkCommands: ["pnpm --version"],
                projectVersionRequirement: pnpmVersion
            }
        ],
        startCommands: [
            "docker compose up --build",
            ...(javaVersion ? [`cd backend && ./gradlew bootRun`] : []),
            "cd frontend && pnpm install && pnpm dev"
        ],
        assistantGuidance: [
            "The MCP server cannot inspect the user's computer. Run the listed version checks through the connected host's terminal only when that capability is available and permitted; otherwise ask the user to run them and share the output.",
            "Docker Engine and Docker Compose are needed for the containerized local stack. Java is needed only for native backend development; Node.js and pnpm are needed only for native frontend development.",
            "If a tool is missing, ask which operating system the user uses and provide the matching official installation instructions. Ask before installing software or starting containers/processes.",
            "Never request or reveal values from generated .env files."
        ]
    };
}
