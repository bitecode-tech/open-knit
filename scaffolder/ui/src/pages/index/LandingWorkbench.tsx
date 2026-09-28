import {useState} from "react";
import {moduleSummaries, type ModuleSlug} from "@app/content/scaffolderCatalog";
import ModuleMark from "@app/pages/modules/ModuleMark";

export default function LandingWorkbench() {
    const [selectedModuleSlug, setSelectedModuleSlug] = useState<ModuleSlug>("identity");
    const selectedModule = moduleSummaries.find((moduleSummary) => moduleSummary.slug === selectedModuleSlug)
        ?? moduleSummaries[0];
    const selectedModuleIndex = moduleSummaries.findIndex((moduleSummary) => moduleSummary.slug === selectedModule.slug);

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
                        Browse available modules, understand what each includes and how it’s structured, then open the builder when you’re ready to configure and combine modules for your project.
                    </p>
                </div>

                <div className="landing-module-browser">
                    <nav className="landing-module-browser-list" aria-label="Browse modules">
                        {moduleSummaries.map((moduleSummary, moduleIndex) => {
                            const isSelected = selectedModule.slug === moduleSummary.slug;

                            return (
                                <button
                                    className={`landing-module-browser-option${isSelected ? " is-selected" : ""}`}
                                    key={moduleSummary.slug}
                                    type="button"
                                    aria-pressed={isSelected}
                                    onClick={() => setSelectedModuleSlug(moduleSummary.slug)}
                                >
                                    <span className="landing-module-browser-mark">
                                        <ModuleMark slug={moduleSummary.slug}/>
                                    </span>
                                    <span className="landing-module-browser-copy">
                                        <span className="landing-module-browser-title">{moduleSummary.title}</span>
                                        <span className="landing-module-browser-description">{moduleSummary.shortDescription}</span>
                                    </span>
                                    <span className="landing-module-browser-number" aria-hidden="true">
                                        {String(moduleIndex + 1).padStart(2, "0")}
                                    </span>
                                    <span className="landing-module-browser-arrow" aria-hidden="true">›</span>
                                </button>
                            );
                        })}
                    </nav>

                    <article
                        className="landing-module-detail"
                        aria-labelledby="landing-module-detail-title"
                        aria-live="polite"
                    >
                        <header className="landing-module-detail-heading">
                            <span className="landing-module-detail-mark">
                                <ModuleMark slug={selectedModule.slug}/>
                            </span>
                            <div>
                                <p className="landing-module-detail-index">
                                    {String(selectedModuleIndex + 1).padStart(2, "0")} / {String(moduleSummaries.length).padStart(2, "0")} modules
                                </p>
                                <h3 id="landing-module-detail-title">{selectedModule.title}</h3>
                                <p>{selectedModule.shortDescription}</p>
                            </div>
                        </header>

                        <section className="landing-module-detail-section landing-module-summary" aria-labelledby="landing-module-summary-title">
                            <span className="landing-module-detail-step" aria-hidden="true">01</span>
                            <div>
                                <h4 id="landing-module-summary-title">What it does</h4>
                                <p>{selectedModule.heroDescription}</p>
                            </div>
                        </section>

                        <section className="landing-module-detail-section landing-module-structure" aria-labelledby="landing-module-structure-title">
                            <span className="landing-module-detail-step" aria-hidden="true">02</span>
                            <div className="landing-module-detail-section-content">
                                <h4 id="landing-module-structure-title">Typical structure</h4>
                                <p>Explore the module directories and implementation guidance.</p>
                                <div className="landing-module-path-grid">
                                    <div className="landing-module-path-card">
                                        <h5><FolderPathIcon/> Backend module</h5>
                                        <code>{selectedModule.backendModulePath}</code>
                                    </div>
                                    <div className="landing-module-path-card">
                                        <h5><FolderPathIcon/> Frontend module</h5>
                                        <code>
                                            {selectedModule.frontendModulePath
                                                ?? "No frontend module directory is currently present."}
                                        </code>
                                    </div>
                                    <div className="landing-module-path-card">
                                        <h5><DocumentPathIcon/> Developer guidance</h5>
                                        <code>{selectedModule.backendGuidePath}</code>
                                        {selectedModule.frontendReadmePath ? (
                                            <code>{selectedModule.frontendReadmePath}</code>
                                        ) : null}
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="landing-module-detail-section landing-module-capabilities" aria-labelledby="landing-module-capabilities-title">
                            <span className="landing-module-detail-step" aria-hidden="true">03</span>
                            <div>
                                <h4 id="landing-module-capabilities-title">Included capabilities</h4>
                                <ul>
                                    {selectedModule.capabilities.map((capability) => (
                                        <li key={capability}>{capability}</li>
                                    ))}
                                </ul>
                            </div>
                        </section>

                        <footer className="landing-module-detail-footer">
                            <p>Details and paths are based on the current module catalogue.</p>
                            <a className="landing-module-detail-link" href={`/modules/${selectedModule.slug}`}>
                                Open full module details <span aria-hidden="true">→</span>
                            </a>
                        </footer>
                    </article>
                </div>

            </div>
        </section>
    );
}

function FolderPathIcon() {
    return (
        <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M1.75 4.25h4l1.5 1.5h7v6.5H1.75v-8Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
            <path d="M1.75 6h12.5" stroke="currentColor" strokeWidth="1.5"/>
        </svg>
    );
}

function DocumentPathIcon() {
    return (
        <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M3 1.75h6l4 4v8.5H3v-12.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
            <path d="M9 1.75v4h4M5.5 8.5h5M5.5 11h5" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
        </svg>
    );
}
