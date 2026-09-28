import {useEffect, useRef, useState} from "react";
import GenericLinkButton from "@app/components/GenericLinkButton";
import MarkdownDocument from "@app/components/MarkdownDocument";
import {getBundlesForModule, moduleSummaries} from "@app/content/scaffolderCatalog";
import ModuleMark from "@app/pages/modules/ModuleMark";
import {
    getModuleBrowseCategoryLabel,
    getModuleDetailDescription
} from "@app/pages/modules/catalogueContent";
import type {Data} from "@app/pages/modules/@slug/+data";
import "@app/pages/modules/modules.css";
import {useData} from "vike-react/useData";

export default function ModuleDetailsPage() {
    const {moduleSummary, moduleDocs} = useData<Data>();
    const [imageIsOpen, setImageIsOpen] = useState(false);
    const imageTriggerRef = useRef<HTMLButtonElement>(null);
    const imageCloseButtonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (!imageIsOpen) {
            return;
        }

        const previouslyFocusedElement = document.activeElement instanceof HTMLElement
            ? document.activeElement
            : null;
        const closeButton = imageCloseButtonRef.current;
        closeButton?.focus();

        const handleModalKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setImageIsOpen(false);
            }

            if (event.key === "Tab") {
                event.preventDefault();
                closeButton?.focus();
            }
        };

        document.addEventListener("keydown", handleModalKeyDown);

        return () => {
            document.removeEventListener("keydown", handleModalKeyDown);
            previouslyFocusedElement?.focus();
        };
    }, [imageIsOpen]);

    if (!moduleSummary || !moduleDocs) {
        return (
            <main className="module-page module-detail module-detail--not-found">
                <div className="module-page__inner">
                    <section className="module-detail__not-found">
                        <h1>Module not found</h1>
                        <p>The module you requested doesn&apos;t exist in the current catalogue.</p>
                        <GenericLinkButton href="/modules" variant="secondary" className="module-page__button module-page__button--secondary">
                            Back to the catalogue
                        </GenericLinkButton>
                    </section>
                </div>
            </main>
        );
    }

    const includedBundles = getBundlesForModule(moduleSummary.slug);
    const moduleIndex = moduleSummaries.findIndex((catalogueEntry) => catalogueEntry.slug === moduleSummary.slug);
    const relatedModules = Array.from({length: Math.min(3, moduleSummaries.length - 1)}, (_, offset) => {
        return moduleSummaries[(moduleIndex + offset + 1) % moduleSummaries.length];
    });
    const coreFlowItems = parseCoreFlows(moduleDocs.coreFlows);
    const moduleNumber = String(moduleIndex + 1).padStart(2, "0");
    const catalogueSize = String(moduleSummaries.length).padStart(2, "0");
    const detailDescription = getModuleDetailDescription(moduleSummary.slug, moduleSummary.heroDescription);

    return (
        <main className="module-page module-detail">
            <div className="module-page__inner">
                <a className="module-detail__breadcrumb" href="/modules">
                    <span aria-hidden="true">←</span> All catalogue entries
                </a>

                <header className="module-detail__intro">
                    <div className="module-detail__intro-copy">
                        <p className="module-detail__index">
                            <strong>{moduleNumber} / {catalogueSize}</strong> Module catalogue detail
                        </p>
                        <h1 className="module-detail__title">{moduleSummary.title}</h1>
                        <p className="module-detail__lede">{detailDescription}</p>
                        <p className="module-detail__category">
                            Browse category: <strong>{getModuleBrowseCategoryLabel(moduleSummary.slug)}</strong>
                        </p>
                        <div className="module-detail__actions">
                            <GenericLinkButton href="/builder" className="module-page__button">
                                Open the builder <span aria-hidden="true">↗</span>
                            </GenericLinkButton>
                            <GenericLinkButton href="/modules" variant="secondary" className="module-page__button module-page__button--secondary">
                                Browse all modules
                            </GenericLinkButton>
                        </div>
                        <p className="module-detail__builder-note">
                            Choose the modules you want after opening the builder.
                        </p>
                    </div>

                    <button
                        type="button"
                        ref={imageTriggerRef}
                        className="module-detail__image-button"
                        aria-label={`Open the ${moduleSummary.title} in-app image`}
                        onClick={() => {
                            setImageIsOpen(true);
                        }}
                    >
                        <span className="module-detail__image-frame">
                            <img
                                src={moduleSummary.imagePath}
                                alt={moduleSummary.imageAlt}
                            />
                        </span>
                        <span className="module-detail__image-caption">Open in-app view</span>
                    </button>
                </header>

                <section className="module-detail__main-grid" aria-label={`${moduleSummary.title} details`}>
                    <article className="module-detail__panel module-detail__panel--capabilities">
                        <p className="module-page__section-label">01 / Module overview</p>
                        <h2>What this module does</h2>
                        <p className="module-detail__panel-lede">
                            {getModuleDetailDescription(moduleSummary.slug, moduleSummary.shortDescription)}
                        </p>
                        <h3 className="module-detail__subheading">Documented capabilities</h3>
                        <ul className="module-detail__list">
                            {moduleSummary.capabilities.map((capability) => (
                                <li key={capability}>{capability}</li>
                            ))}
                        </ul>
                        {moduleSummary.configurationHighlights.length > 0 ? (
                            <>
                                <h3 className="module-detail__subheading">Configuration highlights</h3>
                                <ul className="module-detail__list module-detail__configuration-list">
                                    {moduleSummary.configurationHighlights.map((configurationHighlight) => (
                                        <li key={configurationHighlight}>
                                            <MarkdownDocument content={configurationHighlight}/>
                                        </li>
                                    ))}
                                </ul>
                            </>
                        ) : null}
                    </article>

                    <article className="module-detail__panel module-detail__core-flows">
                        <p className="module-page__section-label">02 / Implementation record</p>
                        <h2>Core flows</h2>
                        {coreFlowItems.length > 0 ? (
                            <ol className="module-detail__flow-list">
                                {coreFlowItems.map((coreFlowItem) => (
                                    <li key={coreFlowItem.title}>
                                        <h3>{coreFlowItem.title}</h3>
                                        {coreFlowItem.details ? (
                                            <div className="module-detail__markdown-content">
                                                <MarkdownDocument content={coreFlowItem.details}/>
                                            </div>
                                        ) : null}
                                    </li>
                                ))}
                            </ol>
                        ) : (
                            <div className="module-detail__markdown-content">
                                <MarkdownDocument content={moduleDocs.coreFlows}/>
                            </div>
                        )}
                        <p className="module-detail__flow-source">
                            Core flow source: {moduleDocs.coreFlowsPath}
                        </p>
                    </article>

                    <aside className="module-detail__sidebar" aria-label="Bundle and source information">
                        <article className="module-detail__panel">
                            <p className="module-page__section-label">03 / Generator bundles</p>
                            <h2>Bundle membership</h2>
                            {includedBundles.length > 0 ? (
                                <ul className="module-detail__bundle-list">
                                    {includedBundles.map((bundleDefinition) => (
                                        <li key={bundleDefinition.id}>
                                            <strong>{bundleDefinition.title}</strong>
                                            <span>{bundleDefinition.description}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="module-detail__panel-lede">
                                    No current bundle definition lists this module.
                                </p>
                            )}
                            {moduleSummary.isLocked ? (
                                <p className="module-detail__panel-lede">
                                    Included by default in the custom modules generator flow.
                                </p>
                            ) : null}
                        </article>

                        <article className="module-detail__panel">
                            <p className="module-page__section-label">04 / Repository paths</p>
                            <h2>Source paths</h2>
                            <dl className="module-detail__source-list">
                                <div>
                                    <dt>Backend module</dt>
                                    <dd>{moduleSummary.backendModulePath}</dd>
                                </div>
                                <div>
                                    <dt>Frontend module</dt>
                                    <dd>
                                        {moduleSummary.frontendModulePath
                                            ?? "No frontend module directory is currently present for this module."}
                                    </dd>
                                </div>
                                <div>
                                    <dt>Backend guide</dt>
                                    <dd>{moduleSummary.backendGuidePath}</dd>
                                </div>
                            </dl>
                        </article>
                    </aside>
                </section>

                <section className="module-detail__related" aria-labelledby="related-modules-heading">
                    <div className="module-detail__related-heading">
                        <p className="module-page__section-label">Continue exploring</p>
                        <h2 id="related-modules-heading">Other catalogue entries</h2>
                    </div>
                    <div className="module-detail__related-grid">
                        {relatedModules.map((relatedModule) => (
                            <a key={relatedModule.slug} href={`/modules/${relatedModule.slug}`}>
                                <ModuleMark slug={relatedModule.slug}/>
                                <span>{relatedModule.title}</span>
                                <span aria-hidden="true">↗</span>
                            </a>
                        ))}
                    </div>
                </section>

                <footer className="module-page__closing">
                    <div>
                        <p className="module-page__section-label">Continue to the builder</p>
                        <h2>Configure a project with the modules you choose.</h2>
                        <p>Module details are reference material; configure your project in the builder.</p>
                    </div>
                    <GenericLinkButton href="/builder" className="module-page__button">
                        Open the builder <span aria-hidden="true">↗</span>
                    </GenericLinkButton>
                </footer>
            </div>

            {imageIsOpen ? (
                <div
                    className="module-detail__modal"
                    role="dialog"
                    aria-modal="true"
                    aria-label={`${moduleSummary.title} image`}
                    onClick={() => {
                        setImageIsOpen(false);
                    }}
                >
                    <div
                        className="module-detail__modal-content"
                        onClick={(event) => {
                            event.stopPropagation();
                        }}
                    >
                        <button
                            type="button"
                            ref={imageCloseButtonRef}
                            className="module-detail__modal-close"
                            onClick={() => {
                                setImageIsOpen(false);
                            }}
                        >
                            Close
                        </button>
                        <div className="module-detail__modal-image">
                            <img src={moduleSummary.imagePath} alt={moduleSummary.imageAlt}/>
                        </div>
                    </div>
                </div>
            ) : null}
        </main>
    );
}

type CoreFlowItem = {
    title: string;
    details: string;
};

function parseCoreFlows(content: string): CoreFlowItem[] {
    const lines = content.replace(/\r\n/g, "\n").split("\n");
    const coreFlowItems: CoreFlowItem[] = [];
    let currentItem: CoreFlowItem | null = null;

    for (const line of lines) {
        const headingMatch = line.match(/^\d+\.\s+(.*)$/);

        if (headingMatch) {
            if (currentItem) {
                currentItem.details = currentItem.details.trim();
                coreFlowItems.push(currentItem);
            }

            currentItem = {
                title: headingMatch[1].trim(),
                details: ""
            };
            continue;
        }

        if (!currentItem) {
            continue;
        }

        currentItem.details += `${line}\n`;
    }

    if (currentItem) {
        currentItem.details = currentItem.details.trim();
        coreFlowItems.push(currentItem);
    }

    return coreFlowItems;
}
