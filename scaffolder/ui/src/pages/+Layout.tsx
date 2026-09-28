import {useEffect, type ReactNode} from "react";
import "@app/styles/index.css";
import LandingSiteHeader from "@app/pages/index/LandingSiteHeader";
import BuilderSiteHeader from "@app/pages/builder/BuilderSiteHeader";
import {updateClientPageMetadata} from "@app/pages/pageMetadata";
import {usePageContext} from "vike-react/usePageContext";

export default function Layout({children}: { children: ReactNode }) {
    const pageContext = usePageContext();
    const currentPathname = pageContext.urlPathname;
    const pageData = pageContext.data;
    const landingIsActive = currentPathname === "/";
    const generatorIsActive = currentPathname === "/builder";

    useEffect(() => {
        updateClientPageMetadata(currentPathname, pageData);
    }, [currentPathname, pageData]);

    return (
        <div
            className={`app-shell min-h-screen bg-[var(--background)] flex flex-col ${
                generatorIsActive ? "md:h-dvh md:max-h-dvh md:overflow-hidden" : ""
            }`}
        >
            {!landingIsActive && !generatorIsActive ? <LandingSiteHeader currentPathname={currentPathname}/> : null}
            {generatorIsActive ? <BuilderSiteHeader/> : null}
            <div className="flex-1 flex flex-col min-h-0">
                {children}
            </div>
        </div>
    );
}
