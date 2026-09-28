import {resolveModuleSummary, resolvePageMetadata, resolveStructuredData} from "@app/pages/pageMetadata";
import {usePageContext} from "vike-react/usePageContext";

export default function Head() {
    const pageContext = usePageContext();
    const currentPathname = pageContext.urlPathname;
    const moduleSummary = resolveModuleSummary(pageContext.data);
    const meta = resolvePageMetadata(currentPathname, moduleSummary);
    const structuredData = resolveStructuredData(currentPathname, moduleSummary, meta.canonicalUrl);

    return (
        <>
            <title>{meta.title}</title>
            <meta name="description" content={meta.description}/>
            <meta property="og:title" content={meta.title}/>
            <meta property="og:description" content={meta.description}/>
            <meta property="og:type" content={meta.ogType}/>
            <meta property="og:url" content={meta.canonicalUrl}/>
            <meta name="robots" content="index,follow"/>
            <meta name="twitter:card" content="summary"/>
            <meta name="twitter:title" content={meta.title}/>
            <meta name="twitter:description" content={meta.description}/>
            <link rel="canonical" href={meta.canonicalUrl}/>
            <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png"/>
            <script
                id="open-knit-structured-data"
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(structuredData)
                }}
            />
            <link rel="preconnect" href="https://fonts.googleapis.com"/>
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous"/>
            <link
                href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
                rel="stylesheet"
            />
        </>
    );
}
