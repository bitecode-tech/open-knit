import {GithubIcon} from "@app/pages/index/components/Icons";
import "./builderHeader.css";

export default function BuilderSiteHeader() {
    return (
        <header className="builder-site-header">
            <a className="builder-site-brand" href="/" aria-label="OpenKnit home">
                <svg className="builder-site-brand-mark" viewBox="0 0 28 28" fill="none" aria-hidden="true">
                    <path
                        d="M14 2.75 25 8.5v11L14 25.25 3 19.5v-11L14 2.75Z"
                        stroke="currentColor"
                        strokeLinejoin="round"
                        strokeWidth="1.35"
                    />
                    <path
                        d="m3.4 8.9 10.6 5.35L24.6 8.9M14 14.25v10.4"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.35"
                    />
                </svg>
                <span>OPENKNIT</span>
            </a>

            <nav className="builder-site-navigation" aria-label="Primary navigation">
                <a className="builder-site-navigation-link is-active" href="/builder" aria-current="page">
                    Generator
                </a>
                <a className="builder-site-navigation-link" href="/modules">
                    Modules
                </a>
                <a className="builder-site-navigation-link" href="/about">
                    About
                </a>
            </nav>

            <a
                className="builder-site-github"
                href="https://github.com/bitecode-tech/open-knit"
                target="_blank"
                rel="noreferrer"
                aria-label="OpenKnit GitHub repository"
            >
                <GithubIcon className="h-5 w-5" />
                <span>GitHub</span>
            </a>
        </header>
    );
}
