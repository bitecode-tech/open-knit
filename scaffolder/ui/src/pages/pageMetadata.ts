import {moduleSummaries, type ModuleSummary} from "@app/content/scaffolderCatalog";

const websiteUrl = "https://open-knit.com";
const applicationDescription = "A modular full-stack application foundation with optional modules and structured guidance for AI-assisted development.";

export type PageMetadata = {
    title: string;
    description: string;
    canonicalUrl: string;
    ogType: string;
};

export function resolveModuleSummary(data: unknown): ModuleSummary | null {
    if (!data || typeof data !== "object" || !("moduleSummary" in data)) {
        return null;
    }

    const moduleSummary = data.moduleSummary;
    if (!moduleSummary || typeof moduleSummary !== "object") {
        return null;
    }

    return moduleSummary as ModuleSummary;
}

export function resolvePageMetadata(currentPathname: string, moduleSummary: ModuleSummary | null): PageMetadata {
    if (currentPathname === "/") {
        return {
            title: "OpenKnit | Build your application foundation",
            description: "OpenKnit provides a modular full-stack application foundation, optional modules, and structured guidance for AI-assisted development.",
            canonicalUrl: websiteUrl,
            ogType: "website"
        };
    }

    if (currentPathname === "/builder") {
        return {
            title: "OpenKnit Builder | Configure a modular application",
            description: "Choose a project name and select a supported module bundle or individual modules to download an OpenKnit source project.",
            canonicalUrl: `${websiteUrl}/builder`,
            ogType: "website"
        };
    }

    if (moduleSummary && currentPathname.startsWith("/modules/")) {
        const moduleScope = moduleSummary.frontendModulePath ? "module" : "backend module";

        return {
            title: `${moduleSummary.title} for OpenKnit | ${moduleSummary.shortDescription}`,
            description: `${moduleSummary.title} in OpenKnit: ${moduleSummary.shortDescription} Learn the core flows, bundle coverage, and source paths for this ${moduleScope}.`,
            canonicalUrl: `${websiteUrl}/modules/${moduleSummary.slug}`,
            ogType: "article"
        };
    }

    if (currentPathname === "/modules") {
        return {
            title: "OpenKnit Modules Catalog | Explore the catalogue",
            description: "Browse the OpenKnit module catalogue, compare documented capabilities, and inspect implementation details before configuring your application.",
            canonicalUrl: `${websiteUrl}/modules`,
            ogType: "website"
        };
    }

    if (currentPathname === "/about") {
        return {
            title: "About OpenKnit | Modular fullstack app builder",
            description: "Learn what OpenKnit is, why it exists, how its modular architecture works, and why teams can extend and own the code without vendor lock-in.",
            canonicalUrl: `${websiteUrl}/about`,
            ogType: "website"
        };
    }

    return {
        title: "OpenKnit - start with 70% of your app",
        description: "OpenKnit - foundation for your system, get 70% of your app out-of-the-box.",
        canonicalUrl: websiteUrl,
        ogType: "website"
    };
}

export function resolveStructuredData(
    currentPathname: string,
    moduleSummary: ModuleSummary | null,
    canonicalUrl: string
): Record<string, unknown> {
    const defaultGraph = [
        {
            "@type": "WebSite",
            name: "OpenKnit",
            url: websiteUrl,
            description: applicationDescription,
            inLanguage: "en"
        },
        {
            "@type": "SoftwareApplication",
            name: "OpenKnit",
            applicationCategory: "DeveloperApplication",
            operatingSystem: "Web",
            url: websiteUrl,
            description: applicationDescription,
            offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD"
            }
        }
    ];

    if (currentPathname === "/" || currentPathname === "/builder") {
        const pageName = currentPathname === "/" ? "OpenKnit application foundations" : "OpenKnit Builder";
        return {
            "@context": "https://schema.org",
            "@graph": [
                ...defaultGraph,
                {
                    "@type": "WebPage",
                    name: pageName,
                    description: applicationDescription,
                    url: canonicalUrl,
                    isPartOf: {
                        "@type": "WebSite",
                        name: "OpenKnit",
                        url: websiteUrl
                    }
                }
            ]
        };
    }

    if (moduleSummary && currentPathname.startsWith("/modules/")) {
        return {
            "@context": "https://schema.org",
            "@graph": [
                ...defaultGraph,
                {
                    "@type": "BreadcrumbList",
                    itemListElement: [
                        {
                            "@type": "ListItem",
                            position: 1,
                            name: "Generator",
                            item: `${websiteUrl}/builder`
                        },
                        {
                            "@type": "ListItem",
                            position: 2,
                            name: "Modules Catalog",
                            item: `${websiteUrl}/modules`
                        },
                        {
                            "@type": "ListItem",
                            position: 3,
                            name: moduleSummary.title,
                            item: canonicalUrl
                        }
                    ]
                },
                {
                    "@type": "TechArticle",
                    headline: `${moduleSummary.title} for OpenKnit`,
                    description: moduleSummary.shortDescription,
                    url: canonicalUrl,
                    about: moduleSummary.capabilities,
                    isPartOf: {
                        "@type": "WebSite",
                        name: "OpenKnit",
                        url: websiteUrl
                    }
                }
            ]
        };
    }

    if (currentPathname === "/modules") {
        return {
            "@context": "https://schema.org",
            "@graph": [
                ...defaultGraph,
                {
                    "@type": "CollectionPage",
                    name: "OpenKnit Modules Catalog",
                    description: "Browse and compare OpenKnit modules before generating your app.",
                    url: canonicalUrl
                },
                {
                    "@type": "ItemList",
                    itemListElement: moduleSummaries.map((moduleSummary, index) => ({
                        "@type": "ListItem",
                        position: index + 1,
                        name: moduleSummary.title,
                        url: `${websiteUrl}/modules/${moduleSummary.slug}`
                    }))
                }
            ]
        };
    }

    if (currentPathname === "/about") {
        return {
            "@context": "https://schema.org",
            "@graph": [
                ...defaultGraph,
                {
                    "@type": "AboutPage",
                    name: "About OpenKnit",
                    description: "Explanation of OpenKnit as a modular fullstack app builder with extendible code ownership and AI-friendly structure.",
                    url: canonicalUrl
                }
            ]
        };
    }

    return {
        "@context": "https://schema.org",
        "@graph": defaultGraph
    };
}

export function updateClientPageMetadata(currentPathname: string, data: unknown): void {
    const moduleSummary = resolveModuleSummary(data);
    const metadata = resolvePageMetadata(currentPathname, moduleSummary);
    const structuredData = resolveStructuredData(currentPathname, moduleSummary, metadata.canonicalUrl);

    document.title = metadata.title;
    updateMeta("name", "description", metadata.description);
    updateMeta("property", "og:title", metadata.title);
    updateMeta("property", "og:description", metadata.description);
    updateMeta("property", "og:type", metadata.ogType);
    updateMeta("property", "og:url", metadata.canonicalUrl);
    updateMeta("name", "twitter:title", metadata.title);
    updateMeta("name", "twitter:description", metadata.description);

    let canonicalLink = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonicalLink) {
        canonicalLink = document.createElement("link");
        canonicalLink.rel = "canonical";
        document.head.append(canonicalLink);
    }
    canonicalLink.href = metadata.canonicalUrl;

    let structuredDataScript = document.head.querySelector<HTMLScriptElement>("#open-knit-structured-data");
    if (!structuredDataScript) {
        structuredDataScript = document.createElement("script");
        structuredDataScript.id = "open-knit-structured-data";
        structuredDataScript.type = "application/ld+json";
        document.head.append(structuredDataScript);
    }
    structuredDataScript.textContent = JSON.stringify(structuredData);
}

function updateMeta(attributeName: "name" | "property", attributeValue: string, content: string): void {
    let metaElement = document.head.querySelector<HTMLMetaElement>(`meta[${attributeName}="${attributeValue}"]`);
    if (!metaElement) {
        metaElement = document.createElement("meta");
        metaElement.setAttribute(attributeName, attributeValue);
        document.head.append(metaElement);
    }
    metaElement.content = content;
}
