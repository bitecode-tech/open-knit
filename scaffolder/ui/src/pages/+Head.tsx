const websiteUrl = "https://open-knit.com";
const metaTitle = "OpenKnit - start with 70% of your app";
const metaDescription = "OpenKnit - foundation for your system, get 70% of your app out-of-the-box.";

const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
        {
            "@type": "WebSite",
            name: "OpenKnit",
            url: websiteUrl,
            description: metaDescription,
            inLanguage: "en"
        },
        {
            "@type": "SoftwareApplication",
            name: "OpenKnit",
            applicationCategory: "DeveloperApplication",
            operatingSystem: "Web",
            url: websiteUrl,
            description: metaDescription,
            offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD"
            }
        }
    ]
};

export default function Head() {
    return (
        <>
            <title>{metaTitle}</title>
            <meta name="description" content={metaDescription}/>
            <meta property="og:title" content={metaTitle}/>
            <meta property="og:description" content={metaDescription}/>
            <meta property="og:type" content="website"/>
            <meta property="og:url" content={websiteUrl}/>
            <meta name="twitter:card" content="summary"/>
            <meta name="twitter:title" content={metaTitle}/>
            <meta name="twitter:description" content={metaDescription}/>
            <link rel="canonical" href={websiteUrl}/>
            <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png"/>
            <script
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
