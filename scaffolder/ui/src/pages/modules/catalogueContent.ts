import type {ModuleSlug} from "@app/content/scaffolderCatalog";

export type ModuleBrowseCategory = "all" | "application-core" | "financial" | "ai-data";
export type EditorialModuleCategory = Exclude<ModuleBrowseCategory, "all">;

export const moduleBrowseCategories: Array<{ id: ModuleBrowseCategory; label: string }> = [
    {id: "all", label: "All modules"},
    {id: "application-core", label: "Application core"},
    {id: "financial", label: "Financial"},
    {id: "ai-data", label: "AI & data"}
];

export const editorialCategoryBySlug: Record<ModuleSlug, EditorialModuleCategory> = {
    identity: "application-core",
    payment: "financial",
    wallet: "financial",
    transaction: "financial",
    ai: "ai-data",
    ocr: "ai-data",
    documents: "ai-data"
};

export function getModuleBrowseCategoryLabel(slug: ModuleSlug): string {
    const categoryId = editorialCategoryBySlug[slug];
    return moduleBrowseCategories.find((category) => category.id === categoryId)?.label ?? "";
}

export function getModuleCatalogueDescription(slug: ModuleSlug, sourceDescription: string): string {
    if (slug === "identity") {
        return "Authentication, user accounts, and roles assigned to users.";
    }

    return sourceDescription;
}

export function getModuleDetailDescription(slug: ModuleSlug, sourceDescription: string): string {
    if (slug === "identity") {
        return "Sign-in and account lifecycle flows, with roles assigned to user accounts.";
    }

    return sourceDescription;
}
