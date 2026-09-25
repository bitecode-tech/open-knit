import ToggleSwitch from "@app/pages/index/components/ToggleSwitch";
import type {TargetPlatform} from "@app/types/ProjectSpec";

type ProjectMetadataSectionProps = {
    projectName: string;
    onProjectNameChange: (value: string) => void;
    targetPlatform: TargetPlatform | "";
    suggestedTargetPlatform: TargetPlatform | null;
    onTargetPlatformChange: (value: TargetPlatform | "") => void;
    targetPlatformConfirmed: boolean;
    onTargetPlatformConfirmedChange: (value: boolean) => void;
    demoInsertsEnabled: boolean;
    onDemoInsertsChange: (value: boolean) => void;
};

export default function ProjectMetadataSection({
                                                   projectName,
                                                   onProjectNameChange,
                                                   targetPlatform,
                                                   suggestedTargetPlatform,
                                                   onTargetPlatformChange,
                                                   targetPlatformConfirmed,
                                                   onTargetPlatformConfirmedChange,
                                                   demoInsertsEnabled,
                                                   onDemoInsertsChange
                                               }: ProjectMetadataSectionProps) {
    const platformLabels: Record<TargetPlatform, string> = {
        windows: "Windows",
        linux: "Linux or WSL with a Linux Docker engine",
        macos: "macOS"
    };
    const platformGuidance: Record<TargetPlatform, string> = {
        windows: "Use Docker Desktop from a Windows terminal. If WSL connects to Docker Desktop, run Compose from the Windows project path.",
        linux: "Use native Linux or WSL connected to a Linux Docker engine. WSL connected to Docker Desktop should use the Windows project path and Windows option.",
        macos: "Use Docker Desktop for macOS. The generated Compose stack uses Compose Watch for source sync."
    };

    return (
        <div className="flex flex-col gap-4 items-start w-full max-w-[360px]">
            <div className="flex flex-col gap-1 items-start">
                <div className="flex gap-1 items-start">
                    <h3 className="text-xl font-semibold text-[var(--text-strong)]">
                        1. Project metadata
                    </h3>
                </div>
            </div>
            <p className="font-normal text-[var(--text-body)]">
                Basic configuration
            </p>

            <div className="flex flex-col gap-2 items-start w-full">
                <label className="font-medium text-[var(--text-strong)]" htmlFor="project-name">
                    Project name
                </label>
                <div className="bg-[var(--card)] w-full h-[37px] rounded-[var(--radius)] border border-[var(--border-strong)]">
                    <input
                        id="project-name"
                        type="text"
                        value={projectName}
                        onChange={(event) => onProjectNameChange(event.target.value)}
                        className="w-full h-full px-4 py-2 bg-transparent outline-none"
                    />
                </div>
            </div>

            <div className="flex flex-col gap-2 items-start w-full">
                <label className="font-medium text-[var(--text-strong)]" htmlFor="target-platform">
                    Where will you run Docker Compose?
                </label>
                <div className="bg-[var(--card)] w-full min-h-[37px] rounded-[var(--radius)] border border-[var(--border-strong)]">
                    <select
                        id="target-platform"
                        value={targetPlatform}
                        onChange={(event) => {
                            const selectedValue = event.target.value;
                            if (selectedValue === "windows" || selectedValue === "linux" || selectedValue === "macos") {
                                onTargetPlatformChange(selectedValue);
                                onTargetPlatformConfirmedChange(false);
                                return;
                            }
                            onTargetPlatformChange("");
                            onTargetPlatformConfirmedChange(false);
                        }}
                        aria-describedby="target-platform-help"
                        className="w-full h-full min-h-[37px] px-4 py-2 bg-transparent outline-none"
                    >
                        <option value="">Select a platform</option>
                        <option value="windows">Windows</option>
                        <option value="linux">Linux or WSL with a Linux Docker engine</option>
                        <option value="macos">macOS</option>
                    </select>
                </div>
                <p id="target-platform-help" className="text-sm font-normal text-[var(--text-body)]">
                    {suggestedTargetPlatform
                        ? `Browser suggestion: ${platformLabels[suggestedTargetPlatform]}. Confirm the platform where Docker Compose will run.`
                        : "Select the platform where Docker Compose will run; this service cannot detect the computer that will download the ZIP."}
                    {targetPlatform ? ` ${platformGuidance[targetPlatform]}` : ""}
                </p>
                {targetPlatform ? (
                    <label className="flex items-start gap-2 text-sm font-normal text-[var(--text-body)]">
                        <input
                            type="checkbox"
                            checked={targetPlatformConfirmed}
                            onChange={(event) => onTargetPlatformConfirmedChange(event.target.checked)}
                            className="mt-1"
                        />
                        <span>I confirm this is the platform where I will run Docker Compose.</span>
                    </label>
                ) : null}
            </div>

            <div className="flex flex-col gap-4 items-start w-full">
                <ToggleSwitch
                    checked={demoInsertsEnabled}
                    onChange={onDemoInsertsChange}
                    label="Initial data inserts"
                    helper="Seed demo data for the selected modules."
                />
            </div>
        </div>
    );
}
