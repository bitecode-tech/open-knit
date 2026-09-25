export type TargetPlatform = "windows" | "linux" | "macos";

export interface ProjectSpec {
    schemaVersion: 1;
    projectName: string;
    modules: string[];
    targetPlatform: TargetPlatform;
    demoInsertsEnabled: boolean;
    templateId?: string;
}
