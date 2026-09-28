import type {ModuleSlug} from "@app/content/scaffolderCatalog";

type ModuleMarkProps = {
    slug: ModuleSlug;
};

export default function ModuleMark({slug}: ModuleMarkProps) {
    return (
        <svg
            className="module-mark"
            viewBox="0 0 32 32"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            aria-hidden="true"
        >
            {slug === "identity" ? (
                <>
                    <circle cx="16" cy="10.5" r="4"/>
                    <path d="M7 27c.7-5.1 3.8-8 9-8s8.3 2.9 9 8"/>
                </>
            ) : null}
            {slug === "payment" ? (
                <>
                    <rect x="4.5" y="7" width="23" height="18" rx="1.5"/>
                    <path d="M5 12h22M9 20h5"/>
                </>
            ) : null}
            {slug === "wallet" ? (
                <>
                    <path d="M7 10V7h17v4"/>
                    <path d="M5 11h22v15H5z"/>
                    <path d="M21 17h6M8 7l13-3"/>
                    <circle cx="21" cy="18" r=".8" fill="currentColor" stroke="none"/>
                </>
            ) : null}
            {slug === "transaction" ? (
                <>
                    <path d="M5 10h20l-4-4M27 22H7l4 4"/>
                    <path d="M25 10l-4 4M7 22l4-4"/>
                </>
            ) : null}
            {slug === "ai" ? (
                <path d="M16 3l2.5 9.5L28 16l-9.5 2.5L16 28l-2.5-9.5L4 16l9.5-3.5L16 3z"/>
            ) : null}
            {slug === "ocr" ? (
                <>
                    <path d="M11 5 8 27M23 5l-3 22M5 12h22M4 20h22"/>
                </>
            ) : null}
            {slug === "documents" ? (
                <>
                    <path d="M8 5h16v21H8zM5 8v20h16"/>
                    <path d="M12 11h8M12 16h8M12 21h5"/>
                </>
            ) : null}
        </svg>
    );
}
