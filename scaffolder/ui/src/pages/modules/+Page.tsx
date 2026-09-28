import {useDeferredValue, useState} from "react";
import GenericLinkButton from "@app/components/GenericLinkButton";
import {moduleSummaries} from "@app/content/scaffolderCatalog";
import ModuleMark from "@app/pages/modules/ModuleMark";
import {
    editorialCategoryBySlug,
    getModuleBrowseCategoryLabel,
    getModuleCatalogueDescription,
    moduleBrowseCategories,
    type ModuleBrowseCategory
} from "@app/pages/modules/catalogueContent";
import "@app/pages/modules/modules.css";

export default function ModulesPage() {
    const [searchValue, setSearchValue] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<ModuleBrowseCategory>("all");
    const deferredSearchValue = useDeferredValue(searchValue);
    const normalizedQuery = deferredSearchValue.trim().toLowerCase();

    const filteredModules = moduleSummaries.filter((moduleSummary) => {
        const matchesCategory = selectedCategory === "all"
            || editorialCategoryBySlug[moduleSummary.slug] === selectedCategory;

        if (!matchesCategory) {
            return false;
        }

        if (!normalizedQuery) {
            return true;
        }

        const searchableText = [
            moduleSummary.title,
            getModuleCatalogueDescription(moduleSummary.slug, moduleSummary.shortDescription),
            moduleSummary.heroDescription,
            getModuleBrowseCategoryLabel(moduleSummary.slug),
            ...moduleSummary.capabilities,
            ...moduleSummary.configurationHighlights
        ].join(" ").toLowerCase();

        return searchableText.includes(normalizedQuery);
    });

    const clearCatalogueFilters = () => {
        setSearchValue("");
        setSelectedCategory("all");
    };

    return (
        <main className="module-page module-catalogue">
            <div className="module-page__inner">
                <header className="module-page__hero">
                    <div className="module-page__hero-copy">
                        <p className="module-page__eyebrow">OpenKnit module catalogue</p>
                        <h1 className="module-page__title">
                            The modules.
                            <span className="module-page__title-accent">Your product.</span>
                        </h1>
                        <p className="module-page__lede">
                            Browse source-backed module entries for the OpenKnit application foundation.
                            Each detail page shows its documented capabilities, core flows, bundle membership,
                            and source paths.
                        </p>
                        <div className="module-page__stats" aria-label="Catalogue summary">
                            <p className="module-page__stat">
                                <strong>{String(moduleSummaries.length).padStart(2, "0")}</strong>
                                Catalogue entries
                            </p>
                            <p className="module-page__stat">
                                <strong>Flows</strong>
                                Source-linked module details
                            </p>
                        </div>
                    </div>

                    <div className="module-structure-art-wrap">
                        <svg
                            className="module-structure-art"
                            viewBox="0 0 360 300"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            aria-hidden="true"
                        >
                            <defs>
                                <pattern id="module-dots" width="16" height="16" patternUnits="userSpaceOnUse">
                                    <circle cx="1" cy="1" r="0.8" fill="currentColor" opacity="0.2"/>
                                </pattern>
                            </defs>
                            <rect width="360" height="300" fill="url(#module-dots)"/>
                            <path d="M180 20 315 78v58l-135-58L45 136V78l135-58Z" fill="#111811" stroke="currentColor"/>
                            <path d="m45 78 135 62 135-62M180 140V78" stroke="currentColor"/>
                            <path d="m180 122 135 62-135 62-135-62 135-62Z" fill="#111811" stroke="currentColor" opacity="0.78"/>
                            <path d="M45 184v35l135 61 135-61v-35M45 219l135 61 135-61m-135-96v34m0 27v28" stroke="currentColor" strokeDasharray="4 6"/>
                            <circle cx="45" cy="219" r="3" fill="currentColor"/>
                            <circle cx="315" cy="219" r="3" fill="currentColor"/>
                            <text x="180" y="70" fill="#d2decf" fontFamily="monospace" fontSize="10" textAnchor="middle">BUSINESS LOGIC</text>
                            <text x="180" y="190" fill="currentColor" fontFamily="monospace" fontSize="11" textAnchor="middle">CATALOGUE</text>
                            <text x="180" y="235" fill="#bac5b8" fontFamily="monospace" fontSize="9" textAnchor="middle">APPLICATION FOUNDATION</text>
                        </svg>
                        <p className="module-page__art-note">
                            Illustrative structure; the count reflects catalogue entries.
                        </p>
                    </div>
                </header>

                <section aria-labelledby="module-catalogue-heading">
                    <div className="module-catalogue__controls">
                        <div>
                            <h2 id="module-catalogue-heading" className="module-page__section-label">
                                01 / Explore the catalogue
                            </h2>
                            <div className="module-catalogue__filters" role="group" aria-label="Filter modules by browse category">
                                {moduleBrowseCategories.map((category) => (
                                    <button
                                        key={category.id}
                                        type="button"
                                        className="module-catalogue__filter"
                                        aria-pressed={selectedCategory === category.id}
                                        onClick={() => {
                                            setSelectedCategory(category.id);
                                        }}
                                    >
                                        {category.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <label className="module-catalogue__search">
                            Search modules
                            <input
                                type="search"
                                value={searchValue}
                                onChange={(event) => {
                                    setSearchValue(event.target.value);
                                }}
                                placeholder="Search modules or capabilities..."
                                aria-label="Search modules by name, capability, configuration, or browse category"
                            />
                        </label>
                    </div>

                    <div className="module-catalogue__results-heading" aria-live="polite">
                        <strong>{filteredModules.length} of {moduleSummaries.length} catalogue entries</strong>
                        <span>Browse category is an editorial grouping</span>
                    </div>

                    {filteredModules.length > 0 ? (
                        <div className="module-catalogue__grid">
                            {filteredModules.map((moduleSummary) => {
                                const originalIndex = moduleSummaries.findIndex((entry) => entry.slug === moduleSummary.slug);
                                const entryNumber = String(originalIndex + 1).padStart(2, "0");
                                const catalogueDescription = getModuleCatalogueDescription(
                                    moduleSummary.slug,
                                    moduleSummary.shortDescription
                                );

                                return (
                                    <a
                                        key={moduleSummary.slug}
                                        href={`/modules/${moduleSummary.slug}`}
                                        className={`module-catalogue__card ${moduleSummary.isLocked ? "module-catalogue__card--default" : ""}`.trim()}
                                    >
                                        <div className="module-catalogue__card-topline">
                                            <span className="module-catalogue__entry-number">
                                                <strong>{entryNumber} /</strong> Catalogue entry
                                            </span>
                                            {moduleSummary.isLocked ? (
                                                <span className="module-catalogue__default-label">
                                                    Default in module flow
                                                </span>
                                            ) : null}
                                        </div>

                                        <div className="module-catalogue__card-heading">
                                            <h2>{moduleSummary.title}</h2>
                                            <span className="module-catalogue__mark-wrap">
                                                <ModuleMark slug={moduleSummary.slug}/>
                                            </span>
                                        </div>

                                        <p className="module-catalogue__description">{catalogueDescription}</p>

                                        <p className="module-catalogue__browse-category">
                                            Browse category: <strong>{getModuleBrowseCategoryLabel(moduleSummary.slug)}</strong>
                                        </p>

                                        <div className="module-catalogue__card-footer">
                                            <span>Read module details</span>
                                            <span aria-hidden="true">↗</span>
                                        </div>
                                    </a>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="module-catalogue__empty">
                            <h2>No catalogue entries match those filters</h2>
                            <p>Try another search or return to all module entries.</p>
                            <button
                                type="button"
                                className="module-catalogue__clear"
                                onClick={clearCatalogueFilters}
                            >
                                Clear search and category
                            </button>
                        </div>
                    )}
                </section>

                <footer className="module-page__closing">
                    <div>
                        <p className="module-page__section-label">Start with the parts you need</p>
                        <h2>Choose modules, then shape your application.</h2>
                        <p>Open the builder and choose the modules for your project.</p>
                    </div>
                    <GenericLinkButton href="/builder" className="module-page__button">
                        Open the builder <span aria-hidden="true">↗</span>
                    </GenericLinkButton>
                </footer>
            </div>
        </main>
    );
}
