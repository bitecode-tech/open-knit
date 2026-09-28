import {useRef, useState} from "react";
import "./landing.css";

type LandingSiteHeaderProps = {
    currentPathname: string;
};

export default function LandingSiteHeader({currentPathname}: LandingSiteHeaderProps) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const mobileMenuToggleRef = useRef<HTMLButtonElement>(null);
    const isLandingPage = currentPathname === "/";
    const isBuilderPage = currentPathname === "/builder";
    const isModulesPage = currentPathname === "/modules" || currentPathname.startsWith("/modules/");
    const isAboutPage = currentPathname === "/about";

    const focusWorkbenchHeading = () => {
        window.requestAnimationFrame(() => {
            document.getElementById("workbench-title")?.focus({preventScroll: true});
        });
    };

    return (
        <header
            className="landing-site-header"
            data-current-page={isAboutPage ? "about" : undefined}
        >
            {isAboutPage ? <a className="landing-skip-link" href="#about-main">Skip to content</a> : null}
            <div className="landing-container landing-header-inner">
                <a className="landing-brand" href="/" aria-label="OpenKnit home">
                    <span className="landing-brand-name">OPENKNIT</span>
                    <span className="landing-version">v{__SCAFFOLDER_VERSION__}</span>
                </a>
                <button
                    ref={mobileMenuToggleRef}
                    className="landing-menu-toggle"
                    type="button"
                    aria-controls="landing-primary-navigation"
                    aria-expanded={isMobileMenuOpen}
                    onClick={() => setIsMobileMenuOpen((isOpen) => !isOpen)}
                >
                    {isMobileMenuOpen ? "Close" : "Menu"}
                </button>
                <nav
                    id="landing-primary-navigation"
                    className={`landing-primary-nav${isMobileMenuOpen ? " is-open" : ""}`}
                    aria-label="Primary navigation"
                    onKeyDown={(event) => {
                        if (event.key === "Escape") {
                            setIsMobileMenuOpen(false);
                            mobileMenuToggleRef.current?.focus();
                        }
                    }}
                >
                    <a
                        href={isLandingPage ? "#workbench" : "/#workbench"}
                        onClick={() => {
                            setIsMobileMenuOpen(false);
                            if (isLandingPage) {
                                focusWorkbenchHeading();
                            }
                        }}
                    >
                        Workbench
                    </a>
                    <a
                        href="/modules"
                        aria-current={isModulesPage ? "page" : undefined}
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        Modules
                    </a>
                    <a
                        href="/about"
                        aria-current={isAboutPage ? "page" : undefined}
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        About
                    </a>
                    <a
                        href="https://github.com/bitecode-tech/open-knit"
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        GitHub
                    </a>
                </nav>
                <a
                    className="landing-button landing-button-small landing-button-outline landing-header-builder"
                    href="/builder"
                    aria-current={isBuilderPage ? "page" : undefined}
                >
                    Builder <span aria-hidden="true">↗</span>
                </a>
            </div>
        </header>
    );
}
