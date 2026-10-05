import FoundationStack from "./FoundationStack";
import LandingWorkbench from "./LandingWorkbench";
import McpConnectCard from "./components/McpConnectCard";
import "./landing.css";

type LandingPageProps = {
    mcpEndpoint: string;
};

export default function LandingPage({mcpEndpoint}: LandingPageProps) {
    const focusWorkbenchHeading = () => {
        window.requestAnimationFrame(() => {
            document.getElementById("workbench-title")?.focus({preventScroll: true});
        });
    };

    return (
        <div className="landing-page">
            <a className="landing-skip-link" href="#landing-main">Skip to content</a>
            <main id="landing-main">
                <section className="landing-hero" aria-labelledby="landing-title">
                    <div className="landing-container landing-hero-inner">
                        <div className="landing-hero-copy">
                            <p className="landing-eyebrow">Application foundations for AI-assisted development</p>
                            <h1 id="landing-title">
                                <span>Build your</span>
                                <span className="landing-accent">backbone.</span>
                            </h1>
                            <p className="landing-hero-description">
                                Start with a modular full-stack application, useful building blocks, and structured guidance for AI-assisted development. Shape the foundation around what your product needs.
                            </p>
                            <div className="landing-hero-actions">
                                <a className="landing-button landing-button-primary" href="/builder">
                                    Build your foundation <span aria-hidden="true">↗</span>
                                </a>
                                <a
                                    className="landing-button landing-button-outline"
                                    href="#workbench"
                                    onClick={focusWorkbenchHeading}
                                >
                                    Explore modules
                                </a>
                            </div>
                            <McpConnectCard endpoint={mcpEndpoint}/>
                        </div>
                        <FoundationStack/>
                    </div>
                </section>

                <LandingWorkbench />

                <section className="landing-process-section" aria-labelledby="process-title">
                    <div className="landing-container">
                        <div className="landing-section-heading landing-process-heading">
                            <div>
                                <p className="landing-eyebrow">03 / From idea to implementation</p>
                                <h2 id="process-title">From idea to a solid <span>foundation.</span></h2>
                            </div>
                            <p className="landing-section-intro">
                                Begin with a clear structure, then extend it with the work that makes your product distinct.
                            </p>
                        </div>

                        <ol className="landing-process-list">
                            <li>
                                <span className="landing-step-number">01</span>
                                <span className="landing-step-symbol" aria-hidden="true">◇</span>
                                <div>
                                    <h3>Choose your foundation</h3>
                                    <p>Select the modules that fit your starting point and review their source structure.</p>
                                </div>
                            </li>
                            <li>
                                <span className="landing-step-number">02</span>
                                <span className="landing-step-symbol" aria-hidden="true">▱</span>
                                <div>
                                    <h3>Equip your coding agent</h3>
                                    <p>Use the project guidance and module documentation to give AI-assisted development more context.</p>
                                </div>
                            </li>
                            <li>
                                <span className="landing-step-number">03</span>
                                <span className="landing-step-symbol" aria-hidden="true">↗</span>
                                <div>
                                    <h3>Build your business logic</h3>
                                    <p>Extend the foundation with the rules and workflows that make your product yours.</p>
                                </div>
                            </li>
                        </ol>
                    </div>
                </section>
            </main>

            <footer className="landing-footer">
                <div className="landing-container landing-footer-inner">
                    <div>
                        <a className="landing-brand landing-footer-brand" href="/" aria-label="OpenKnit home">
                            <span className="landing-brand-name">OPENKNIT</span>
                        </a>
                        <p>Modular foundations. Clear source. Room to build.</p>
                    </div>
                    <nav aria-label="Footer navigation">
                        <a href="/builder">Builder</a>
                        <a href="/modules">Modules</a>
                        <a href="/about">About</a>
                        <a href="https://github.com/bitecode-tech/open-knit" target="_blank" rel="noreferrer">GitHub</a>
                    </nav>
                </div>
            </footer>
        </div>
    );
}
