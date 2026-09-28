import type {ModuleSummary, ModuleSlug} from "@app/content/scaffolderCatalog";
import {moduleSummaries} from "@app/content/scaffolderCatalog";

export type ModuleAvailabilityState = "loading" | "error" | "ready";

type LandingWorkbenchProps = {
    availabilityState: ModuleAvailabilityState;
    availableBackendNames: ReadonlySet<string>;
    selectedModuleSlugs: ReadonlySet<ModuleSlug>;
    onToggleModule: (slug: ModuleSlug) => void;
    onRetryAvailability: () => void;
};

export default function LandingWorkbench({
    availabilityState,
    availableBackendNames,
    selectedModuleSlugs,
    onToggleModule,
    onRetryAvailability
}: LandingWorkbenchProps) {
    const selectedModules = moduleSummaries.filter((moduleSummary) => selectedModuleSlugs.has(moduleSummary.slug));
    const previewSections = [
        {
            title: "Backend modules",
            paths: selectedModules.map((moduleSummary) => moduleSummary.backendModulePath)
        },
        {
            title: "Frontend modules",
            paths: selectedModules.flatMap((moduleSummary) =>
                moduleSummary.frontendModulePath ? [moduleSummary.frontendModulePath] : []
            )
        },
        {
            title: "Developer guidance",
            paths: selectedModules.flatMap((moduleSummary) => [
                moduleSummary.backendGuidePath,
                ...(moduleSummary.frontendReadmePath ? [moduleSummary.frontendReadmePath] : [])
            ])
        }
    ];

    return (
        <section className="landing-workbench-section" id="workbench" aria-labelledby="workbench-title">
            <div className="landing-container">
                <div className="landing-section-heading landing-workbench-heading">
                    <div>
                        <p className="landing-eyebrow">02 / The workbench</p>
                        <h2 id="workbench-title" tabIndex={-1}>
                            Select modules.<br className="landing-desktop-break"/> <span>See their structure.</span>
                        </h2>
                    </div>
                    <p className="landing-section-intro">
                        Choose from the current module catalog and see the source paths associated with your selection.
                    </p>
                </div>

                <div className="landing-workbench-grid">
                    <section className="landing-panel landing-module-panel" aria-labelledby="module-selection-title">
                        <div className="landing-panel-heading">
                            <span className="landing-panel-step">01</span>
                            <div>
                                <p className="landing-panel-kicker">Select modules</p>
                                <h3 id="module-selection-title">Choose your building blocks</h3>
                            </div>
                        </div>

                        {availabilityState === "loading" ? (
                            <p className="landing-availability-message" role="status" aria-live="polite">
                                Checking backend module availability…
                            </p>
                        ) : null}
                        {availabilityState === "ready" ? (
                            <p className="landing-availability-message" role="status" aria-live="polite">
                                Availability reflects the backend module list.
                            </p>
                        ) : null}
                        {availabilityState === "error" ? (
                            <div className="landing-availability-error" role="alert">
                                <p>Module availability could not be loaded. Other modules stay disabled until availability is confirmed.</p>
                                <button type="button" onClick={onRetryAvailability}>Try again</button>
                            </div>
                        ) : null}

                        <fieldset className="landing-module-list">
                            <legend className="landing-sr-only">Select available OpenKnit modules</legend>
                            {moduleSummaries.map((moduleSummary) => (
                                <ModuleOption
                                    key={moduleSummary.slug}
                                    moduleSummary={moduleSummary}
                                    availabilityState={availabilityState}
                                    backendIsAvailable={availableBackendNames.has(moduleSummary.backendName)}
                                    isSelected={selectedModuleSlugs.has(moduleSummary.slug)}
                                    onToggle={() => onToggleModule(moduleSummary.slug)}
                                />
                            ))}
                        </fieldset>

                        <p className="landing-selection-summary" aria-live="polite">
                            {selectedModules.length} {selectedModules.length === 1 ? "module" : "modules"} in this interactive example.
                        </p>
                    </section>

                    <section className="landing-panel landing-preview-panel" aria-labelledby="example-preview-title">
                        <div className="landing-panel-heading">
                            <span className="landing-panel-step">02</span>
                            <div>
                                <p className="landing-panel-kicker">Architecture view</p>
                                <h3 id="example-preview-title">Interactive example preview</h3>
                            </div>
                        </div>
                        <p className="landing-preview-intro">
                            This view is derived from the selected catalog entries. It does not configure or preselect the builder.
                        </p>

                        <div className="landing-path-groups" aria-label="Example source paths">
                            {previewSections.map((previewSection) => (
                                <article
                                    className={`landing-path-group${previewSection.paths.length > 0 ? " is-active" : " is-empty"}`}
                                    key={previewSection.title}
                                >
                                    <h4>{previewSection.title}</h4>
                                    {previewSection.paths.length > 0 ? (
                                        <ul>
                                            {previewSection.paths.map((path) => (
                                                <li key={path}><code>{path}</code></li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p>No path is listed for the selected modules.</p>
                                    )}
                                </article>
                            ))}
                        </div>

                        <div className="landing-example-note">
                            <span className="landing-example-mark" aria-hidden="true">↳</span>
                            <p>
                                The preview uses paths from the module catalog. Your example selection stays on this page.
                            </p>
                        </div>
                        <a className="landing-button landing-button-primary landing-preview-cta" href="/builder">
                            Open the builder <span aria-hidden="true">↗</span>
                        </a>
                    </section>
                </div>
            </div>
        </section>
    );
}

type ModuleOptionProps = {
    moduleSummary: ModuleSummary;
    availabilityState: ModuleAvailabilityState;
    backendIsAvailable: boolean;
    isSelected: boolean;
    onToggle: () => void;
};

function ModuleOption({
    moduleSummary,
    availabilityState,
    backendIsAvailable,
    isSelected,
    onToggle
}: ModuleOptionProps) {
    const moduleIsLocked = moduleSummary.isLocked;
    const moduleCanBeSelected = !moduleIsLocked && availabilityState === "ready" && backendIsAvailable;
    const availabilityLabel = availabilityState === "loading"
        ? "Checking"
        : availabilityState === "error"
            ? "Unknown"
            : backendIsAvailable
                ? "Backend available"
                : "Backend unavailable";
    const statusDescriptionId = `module-status-${moduleSummary.slug}`;
    const lockDescriptionId = `module-lock-${moduleSummary.slug}`;

    return (
        <label className={`landing-module-option${isSelected ? " is-selected" : ""}${moduleCanBeSelected ? "" : " is-disabled"}`}>
            <input
                type="checkbox"
                checked={isSelected}
                disabled={!moduleCanBeSelected}
                onChange={onToggle}
                aria-describedby={moduleIsLocked ? `${statusDescriptionId} ${lockDescriptionId}` : statusDescriptionId}
            />
            <span className="landing-module-copy">
                <span className="landing-module-title">{moduleSummary.title}</span>
                <span className="landing-module-description">{moduleSummary.shortDescription}</span>
                <span className="landing-sr-only" id={statusDescriptionId}>{availabilityLabel}</span>
                {moduleIsLocked ? (
                    <span className="landing-sr-only" id={lockDescriptionId}>Locked and selected as a fixed module in the builder.</span>
                ) : null}
            </span>
            <span className="landing-module-badges" aria-hidden="true">
                <span className={`landing-status-badge landing-status-${availabilityState === "ready" ? backendIsAvailable ? "available" : "unavailable" : availabilityState}`}>
                    {availabilityLabel}
                </span>
                {moduleIsLocked ? <span className="landing-locked-badge">Locked</span> : null}
            </span>
        </label>
    );
}
