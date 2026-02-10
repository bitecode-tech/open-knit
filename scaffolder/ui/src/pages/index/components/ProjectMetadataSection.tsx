import ToggleSwitch from "@app/pages/index/components/ToggleSwitch";

type ProjectMetadataSectionProps = {
    projectName: string;
    onProjectNameChange: (value: string) => void;
    demoInsertsEnabled: boolean;
    onDemoInsertsChange: (value: boolean) => void;
};

export default function ProjectMetadataSection({
                                                   projectName,
                                                   onProjectNameChange,
                                                   demoInsertsEnabled,
                                                   onDemoInsertsChange
                                               }: ProjectMetadataSectionProps) {
    return (
        <div className="flex flex-col gap-4 items-start w-[360px]">
            <div className="flex flex-col gap-1 items-start">
                <div className="flex gap-1 items-start">
                    <h3 className="text-xl font-semibold" style={{color: "#031735"}}>
                        1. Project metadata
                    </h3>
                </div>
            </div>
            <p className="font-normal" style={{color: "#374252"}}>
                Basic configuration
            </p>

            <div className="flex flex-col gap-2 items-start w-full">
                <label className="font-medium" htmlFor="project-name" style={{color: "#031735"}}>
                    Project name
                </label>
                <div className="bg-[var(--card)] w-full h-[37px] rounded-[var(--radius)] border border-[#d0d5db]">
                    <input
                        id="project-name"
                        type="text"
                        value={projectName}
                        onChange={(event) => onProjectNameChange(event.target.value)}
                        className="w-full h-full px-4 py-2 bg-transparent outline-none"
                    />
                </div>
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
