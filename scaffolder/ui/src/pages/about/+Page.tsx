import "./about.css";

const useCases = [
    {
        number: "01",
        title: "CRM and ERP systems",
        description: "Bring different business domains together in a modular application your team can continue to shape.",
        icon: (
            <svg aria-hidden="true" viewBox="0 0 40 40" fill="none">
                <circle cx="14" cy="14" r="5"/>
                <path d="M4.5 31v-2.5a8 8 0 0 1 8-8h3a8 8 0 0 1 8 8V31H4.5Z"/>
                <path d="M25 8.5a5 5 0 0 1 0 10M28 21a8 8 0 0 1 7.5 8v2H29"/>
            </svg>
        )
    },
    {
        number: "02",
        title: "Subscriptions and B2B ordering",
        description: "OpenKnit's documented use cases include subscription-gated products and business-to-business ordering flows.",
        icon: (
            <svg aria-hidden="true" viewBox="0 0 40 40" fill="none">
                <rect x="5" y="7" width="30" height="26" rx="2"/>
                <path d="M5 15h30M12 23h7M12 28h12"/>
                <circle cx="29" cy="24" r="2"/>
            </svg>
        )
    },
    {
        number: "03",
        title: "B2C products",
        description: "Use the foundation as a starting point for a customer-facing product, then build the experience around your own needs.",
        icon: (
            <svg aria-hidden="true" viewBox="0 0 40 40" fill="none">
                <rect x="5" y="7" width="30" height="26" rx="2"/>
                <path d="M5 15h30M11 22h8M11 27h14"/>
                <path d="m27 22 2 2 4-5"/>
            </svg>
        )
    }
];

const technologyStack = [
    {label: "Frontend", value: "React · TypeScript · Vite"},
    {label: "Backend", value: "Java · Spring Boot"},
    {label: "Database", value: "PostgreSQL"}
];

function AboutArchitectureGraphic() {
    return (
        <svg
            className="about-diagram"
            aria-hidden="true"
            focusable="false"
            viewBox="0 0 560 440"
            fill="none"
        >
            <defs>
                <pattern id="about-technical-grid" width="34" height="34" patternUnits="userSpaceOnUse" patternTransform="skewY(-24)">
                    <path d="M34 0H0V34" stroke="#B8FF3B" strokeOpacity="0.12" strokeWidth="1"/>
                </pattern>
                <linearGradient id="about-block-top" x1="280" y1="40" x2="280" y2="210" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#B8FF3B" stopOpacity="0.16"/>
                    <stop offset="1" stopColor="#B8FF3B" stopOpacity="0.04"/>
                </linearGradient>
                <linearGradient id="about-block-side" x1="210" y1="150" x2="350" y2="250" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#B8FF3B" stopOpacity="0.11"/>
                    <stop offset="1" stopColor="#B8FF3B" stopOpacity="0.025"/>
                </linearGradient>
            </defs>

            <rect width="560" height="440" fill="url(#about-technical-grid)" opacity="0.68"/>
            <path className="about-diagram__trace" d="M26 286h108l48-27M428 116h52l38-24M451 322h56l26-20M62 146h74l34 20"/>
            <circle className="about-diagram__node" cx="134" cy="286" r="3"/>
            <circle className="about-diagram__node" cx="480" cy="116" r="3"/>
            <circle className="about-diagram__node" cx="451" cy="322" r="3"/>
            <circle className="about-diagram__node" cx="136" cy="146" r="3"/>

            <ellipse className="about-diagram__glow" cx="282" cy="250" rx="138" ry="106"/>

            <g className="about-diagram__block" transform="translate(0 18) scale(1 0.68)">
                <polygon points="280,218 420,290 280,362 140,290" fill="url(#about-block-top)"/>
                <polygon points="140,290 280,362 280,416 140,344" fill="url(#about-block-side)"/>
                <polygon points="280,362 420,290 420,344 280,416" fill="url(#about-block-side)"/>
                <path d="m140 290 140-72 140 72-140 72-140-72Z"/>
                <path d="m140 290 140 72v54l-140-72v-54ZM280 362l140-72v54l-140 72v-54Z"/>
                <path d="M280 218v54M140 290l140 72 140-72"/>
            </g>

            <g className="about-diagram__block about-diagram__block--upper" transform="translate(0 44) scale(1 0.72)">
                <polygon points="280,40 378,91 280,142 182,91" fill="url(#about-block-top)"/>
                <polygon points="182,91 280,142 280,196 182,145" fill="url(#about-block-side)"/>
                <polygon points="280,142 378,91 378,145 280,196" fill="url(#about-block-side)"/>
                <path d="m182 91 98-51 98 51-98 51-98-51Z"/>
                <path d="m182 91 98 51v54l-98-51V91ZM280 142l98-51v54l-98 51v-54Z"/>
                <path d="M280 40v52M182 91l98 51 98-51"/>
            </g>
        </svg>
    );
}

function StepIcon({kind}: {kind: "foundation" | "guidance" | "logic"}) {
    if (kind === "foundation") {
        return (
            <svg aria-hidden="true" viewBox="0 0 48 48" fill="none">
                <path d="m24 5 17 9.5v19L24 43 7 33.5v-19L24 5Z"/>
                <path d="m7.5 14.5 16.5 9 16.5-9M24 24v19"/>
            </svg>
        );
    }

    if (kind === "guidance") {
        return (
            <svg aria-hidden="true" viewBox="0 0 48 48" fill="none">
                <path d="M8 9.5h32v29H8z"/>
                <path d="M8 16h32M14 12.5h.1M18 12.5h.1M16 23h16M16 29h12M16 35h8"/>
            </svg>
        );
    }

    return (
        <svg aria-hidden="true" viewBox="0 0 48 48" fill="none">
            <path d="m17 13-11 11 11 11M31 13l11 11-11 11M27 8l-6 32"/>
        </svg>
    );
}

export default function AboutPage() {
    return (
        <div className="about-page">
            <main id="about-main" className="about-main" tabIndex={-1}>
                <div className="about-content">
                    <section className="about-hero" aria-labelledby="about-title">
                        <div className="about-hero__copy">
                            <p className="about-eyebrow">About OpenKnit</p>
                            <h1 id="about-title">Why <span>OpenKnit</span> exists.</h1>
                            <p className="about-hero__lead">
                                OpenKnit gives teams an editable application foundation, so they can focus on the workflows that make their product unique.
                            </p>
                        </div>
                        <div className="about-hero__art">
                            <AboutArchitectureGraphic/>
                        </div>
                    </section>

                    <section className="about-process" aria-label="How OpenKnit fits together">
                        <ol className="about-process__list">
                            <li className="about-process__step">
                                <div className="about-step__visual" aria-hidden="true">
                                    <span className="about-step__number">01</span>
                                    <span className="about-step__icon"><StepIcon kind="foundation"/></span>
                                </div>
                                <div className="about-step__copy">
                                    <h2>Choose a foundation</h2>
                                    <p>Start with a project structure and select supported modules that suit the application you have in mind.</p>
                                </div>
                            </li>
                            <li className="about-process__step">
                                <div className="about-step__visual" aria-hidden="true">
                                    <span className="about-step__number">02</span>
                                    <span className="about-step__icon"><StepIcon kind="guidance"/></span>
                                </div>
                                <div className="about-step__copy">
                                    <h2>Use project guidance</h2>
                                    <p>Work with a coding agent using repository guidance that explains the project's structure and conventions.</p>
                                </div>
                            </li>
                            <li className="about-process__step">
                                <div className="about-step__visual" aria-hidden="true">
                                    <span className="about-step__number">03</span>
                                    <span className="about-step__icon"><StepIcon kind="logic"/></span>
                                </div>
                                <div className="about-step__copy">
                                    <h2>Build your product logic</h2>
                                    <p>Shape the business rules and workflows that make the application specific to your product.</p>
                                </div>
                            </li>
                        </ol>
                    </section>

                    <section className="about-use-cases" aria-labelledby="about-use-cases-title">
                        <header className="about-section-heading">
                            <p className="about-eyebrow">Built for</p>
                            <h2 id="about-use-cases-title">Products that need room to <span>take shape.</span></h2>
                        </header>
                        <div className="about-use-cases__grid">
                            {useCases.map((useCase) => (
                                <article className="about-use-card" key={useCase.number}>
                                    <span className="about-use-card__icon">{useCase.icon}</span>
                                    <div className="about-use-card__copy">
                                        <p className="about-use-card__number">{useCase.number}</p>
                                        <h3>{useCase.title}</h3>
                                        <p>{useCase.description}</p>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </section>

                    <section className="about-foundation" aria-labelledby="about-foundation-title">
                        <div className="about-foundation__intro">
                            <p className="about-eyebrow">What you work with</p>
                            <h2 id="about-foundation-title">Your project, in <span>editable source.</span></h2>
                            <p>
                                OpenKnit generates an application foundation you can inspect and change in your own workspace. Compose a project from the supported catalogue; module coverage varies, and the catalogue shows which parts include frontend and backend code.
                            </p>
                            <p>
                                Project guidance helps coding agents navigate the repository during development. It is separate from application features such as optional AI capabilities.
                            </p>
                        </div>
                        <dl className="about-stack" aria-label="OpenKnit technology stack">
                            {technologyStack.map((technology) => (
                                <div className="about-stack__row" key={technology.label}>
                                    <dt>{technology.label}</dt>
                                    <dd>{technology.value}</dd>
                                </div>
                            ))}
                        </dl>
                    </section>

                    <section className="about-next" aria-labelledby="about-next-title">
                        <div>
                            <p className="about-eyebrow">Make your next move</p>
                            <h2 id="about-next-title">Start with a foundation. <span>Make it yours.</span></h2>
                        </div>
                        <div className="about-next__actions">
                            <a className="landing-button landing-button-primary" href="/builder">Open Builder <span aria-hidden="true">↗</span></a>
                            <a className="landing-button landing-button-outline" href="/modules">Browse modules</a>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}
