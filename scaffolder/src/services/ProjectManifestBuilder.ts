import {parse as parseYaml} from "yaml";
import type {TargetPlatform} from "@/projectSpec/projectSpec";
import type {ScaffolderRunContext} from "@/types/ScaffolderRunContext";

type UnknownRecord = Record<string, unknown>;

export type ProjectManifestPort = {
    hostPort: number | null;
    containerPort: number;
    protocol: "tcp" | "udp";
};

export type ProjectManifestService = {
    name: string;
    ports: ProjectManifestPort[];
};

export type ProjectReadinessProbe = {
    service: string;
    type: "tcp";
    host: string;
    port: number;
    protocol: "tcp" | "udp";
};

export type OpenKnitProjectManifest = {
    schemaVersion: 1;
    projectName: string;
    targetPlatform: TargetPlatform;
    javaToolchainVersion: string;
    nodeVersion: string;
    pnpmVersion: string;
    requiredDockerComposeCapabilities: {
        command: "docker compose";
        features: string[];
        minimumVersion: string | null;
    };
    services: ProjectManifestService[];
    startCommand: string;
    readinessProbes: ProjectReadinessProbe[];
    loginRoute: string | null;
    seedMode: "demo-inserts" | "disabled";
    adminLoginAvailable: boolean;
};

class ProjectManifestBuilder {
    build(
        runContext: ScaffolderRunContext,
        generatedBuildGradle: string,
        generatedFrontendPackageJson: string,
        generatedRootCompose: string
    ): OpenKnitProjectManifest {
        const javaToolchainVersion = this.getJavaToolchainVersion(generatedBuildGradle);
        const frontendMetadata = this.readFrontendMetadata(generatedFrontendPackageJson);
        const services = this.readServices(generatedRootCompose);
        const readinessProbes = this.createReadinessProbes(services);
        const hasIdentity = runContext.projectSpec.modules.includes("identity");
        const demoInsertsEnabled = runContext.projectSpec.demoInsertsEnabled;
        const usesComposeWatch = runContext.projectSpec.targetPlatform !== "linux";

        return {
            schemaVersion: 1,
            projectName: runContext.projectSpec.projectName,
            targetPlatform: runContext.projectSpec.targetPlatform,
            javaToolchainVersion,
            nodeVersion: frontendMetadata.nodeVersion,
            pnpmVersion: frontendMetadata.pnpmVersion,
            requiredDockerComposeCapabilities: {
                command: "docker compose",
                features: usesComposeWatch ? ["compose-v2", "compose-watch"] : ["compose-v2", "linux-bind-mounts"],
                minimumVersion: usesComposeWatch ? "2.22.0" : null
            },
            services,
            startCommand: usesComposeWatch ? "docker compose watch" : "docker compose up",
            readinessProbes,
            loginRoute: hasIdentity ? "/login" : null,
            seedMode: demoInsertsEnabled ? "demo-inserts" : "disabled",
            adminLoginAvailable: hasIdentity && demoInsertsEnabled
        };
    }

    private getJavaToolchainVersion(buildGradle: string): string {
        const declarations = Array.from(
            buildGradle.matchAll(/^\s*languageVersion\s*=\s*JavaLanguageVersion\.of\(\s*(\d+)\s*\)\s*$/gm),
            (match) => match[1]
        );
        if (declarations.length !== 1 || !declarations[0]) {
            throw new Error("Generated backend Gradle toolchain version is missing or ambiguous.");
        }
        return declarations[0];
    }

    private readFrontendMetadata(packageJsonContents: string): {nodeVersion: string; pnpmVersion: string} {
        const parsed: unknown = this.parseJson(packageJsonContents, "frontend package.json");
        const packageJson = this.requireRecord(parsed, "frontend package.json");
        const engines = this.requireRecord(packageJson.engines, "frontend package.json engines");
        if (typeof engines.node !== "string" || !engines.node.trim()) {
            throw new Error("Generated frontend package.json must declare engines.node.");
        }
        if (typeof packageJson.packageManager !== "string") {
            throw new Error("Generated frontend package.json must declare packageManager.");
        }
        const pnpmMatch = /^pnpm@(\d+\.\d+\.\d+)(?:\+.*)?$/.exec(packageJson.packageManager);
        if (!pnpmMatch?.[1]) {
            throw new Error("Generated frontend packageManager must pin a pnpm version.");
        }
        return {nodeVersion: engines.node.trim(), pnpmVersion: pnpmMatch[1]};
    }

    private readServices(rootComposeContents: string): ProjectManifestService[] {
        const parsed: unknown = parseYaml(rootComposeContents);
        const compose = this.requireRecord(parsed, "root Compose file");
        const composeServices = this.requireRecord(compose.services, "root Compose services");
        return Object.entries(composeServices).map(([name, serviceValue]) => {
            const service = this.requireRecord(serviceValue, `Compose service ${name}`);
            return {name, ports: this.readPorts(service.ports, name)};
        });
    }

    private readPorts(portsValue: unknown, serviceName: string): ProjectManifestPort[] {
        if (portsValue === undefined) {
            return [];
        }
        if (!Array.isArray(portsValue)) {
            throw new Error(`Compose service ${serviceName} ports must be an array.`);
        }
        return portsValue.map((portValue) => {
            if (typeof portValue === "number") {
                return {hostPort: null, containerPort: this.parsePort(portValue), protocol: "tcp"};
            }
            if (typeof portValue === "string") {
                return this.readShortPort(portValue, serviceName);
            }
            const port = this.requireRecord(portValue, `Compose service ${serviceName} port`);
            const containerPort = this.parsePort(port.target);
            const hostPort = port.published === undefined || port.published === null
                ? null
                : this.parsePort(port.published);
            const protocol = port.protocol === undefined ? "tcp" : this.parseProtocol(port.protocol);
            return {hostPort, containerPort, protocol};
        });
    }

    private readShortPort(portMapping: string, serviceName: string): ProjectManifestPort {
        const [portPart, protocolPart] = portMapping.split("/");
        if (!portPart || (protocolPart !== undefined && protocolPart !== "tcp" && protocolPart !== "udp")) {
            throw new Error(`Compose service ${serviceName} has an unsupported port mapping.`);
        }
        const parts = portPart.split(":");
        if (parts.length < 1 || parts.length > 3 || parts.some((part) => part.length === 0)) {
            throw new Error(`Compose service ${serviceName} has an unsupported port mapping.`);
        }
        const containerPort = this.parsePort(parts[parts.length - 1]);
        const hostPort = parts.length === 1 ? null : this.parsePort(parts[parts.length - 2]);
        return {hostPort, containerPort, protocol: protocolPart === "udp" ? "udp" : "tcp"};
    }

    private parsePort(value: unknown): number {
        const port = typeof value === "number" ? value : typeof value === "string" && /^\d+$/.test(value)
            ? Number(value)
            : Number.NaN;
        if (!Number.isInteger(port) || port < 1 || port > 65535) {
            throw new Error("Generated Compose file contains an unsupported port value.");
        }
        return port;
    }

    private parseProtocol(value: unknown): "tcp" | "udp" {
        if (value === "tcp" || value === "udp") {
            return value;
        }
        throw new Error("Generated Compose file contains an unsupported port protocol.");
    }

    private createReadinessProbes(services: ProjectManifestService[]): ProjectReadinessProbe[] {
        return services.flatMap((service) => service.ports.map((port) => ({
            service: service.name,
            type: "tcp",
            host: port.hostPort === null ? service.name : "127.0.0.1",
            port: port.hostPort ?? port.containerPort,
            protocol: port.protocol
        })));
    }

    private parseJson(contents: string, label: string): unknown {
        try {
            return JSON.parse(contents) as unknown;
        } catch {
            throw new Error(`Generated ${label} is malformed.`);
        }
    }

    private requireRecord(value: unknown, label: string): UnknownRecord {
        if (typeof value !== "object" || value === null || Array.isArray(value)) {
            throw new Error(`Generated ${label} is missing or malformed.`);
        }
        return value as UnknownRecord;
    }
}

const projectManifestBuilder = new ProjectManifestBuilder();
export default projectManifestBuilder;
