import type {ReactNode} from "react";
import "@app/styles/index.css";
import {DiscordIcon, GithubIcon} from "@app/pages/index/components/Icons";
import {usePageContext} from "vike-react/usePageContext";

export default function Layout({children}: { children: ReactNode }) {
    const pageContext = usePageContext();
    const currentPathname = pageContext.urlPathname;
    const generatorIsActive = currentPathname === "/";
    const aboutIsActive = currentPathname === "/about";
    const modulesIsActive = currentPathname === "/modules" || currentPathname.startsWith("/modules/");

    const getNavbarLinkClassName = (isActive: boolean) =>
        `inline-flex min-h-10 items-center justify-center whitespace-nowrap rounded-full px-4 text-[14px] font-semibold transition-colors duration-200 ease-out ${
            isActive
                ? "bg-[var(--surface-nav-active)] text-[var(--primary-strong)]"
                : "text-[var(--text-nav)] hover:bg-[var(--surface-code-light)] hover:text-[var(--text-strong)]"
        }`;

    return (
        <div
            className={`app-shell min-h-screen bg-[var(--background)] flex flex-col ${
                generatorIsActive ? "md:h-dvh md:max-h-dvh md:overflow-hidden" : ""
            }`}
        >
            <nav className="w-full px-3 pt-3.5 md:px-4 md:pt-[18px]">
                <div className="mx-auto flex min-h-16 max-w-[1333px] flex-wrap items-center justify-between gap-x-3 gap-y-3 md:flex-nowrap md:gap-6">
                    <a href="/" className="inline-flex items-center gap-3 min-w-0" aria-label="OpenKnit home">
                        <img
                            src="/open-knit-logo.png"
                            alt="OpenKnit logo"
                            className="h-9 w-auto object-contain"
                        />
                        <div className="flex flex-col gap-0.5">
                            <span className="text-[20px] font-bold tracking-[0.01em] text-[var(--text-body)]">OpenKnit</span>
                        </div>
                    </a>

                    <div className="flex w-full flex-wrap items-center justify-between gap-3 sm:w-auto sm:flex-nowrap sm:justify-start sm:gap-[14px] md:gap-[18px]">
                        <div className="flex items-center gap-2">
                            <a href="/" className={getNavbarLinkClassName(generatorIsActive)}>
                                Generator
                            </a>
                            <a href="/about" className={getNavbarLinkClassName(aboutIsActive)}>
                                About
                            </a>
                            <a href="/modules" className={getNavbarLinkClassName(modulesIsActive)}>
                                Modules info
                            </a>
                        </div>

                        <div className="flex items-center gap-3">
                            <a
                                href="https://discord.gg/XAAjcAFhUn"
                                target="_blank"
                                rel="noreferrer"
                                className="site-navbar__github site-navbar__github--compact-mobile"
                                aria-label="OpenKnit Discord server"
                            >
                                <DiscordIcon className="h-6 w-6"/>
                                <span className="hidden sm:inline">Discord</span>
                            </a>
                            <a
                                href="https://github.com/bitecode-tech/open-knit"
                                target="_blank"
                                rel="noreferrer"
                                className="site-navbar__github site-navbar__github--compact-mobile"
                                aria-label="OpenKnit GitHub repository"
                            >
                                <GithubIcon className="h-6 w-6"/>
                                <span className="hidden sm:inline">GitHub</span>
                            </a>
                        </div>
                    </div>
                </div>
            </nav>
            <div className="flex-1 flex flex-col min-h-0">
                {children}
            </div>
        </div>
    );
}
