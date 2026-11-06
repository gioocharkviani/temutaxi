import type { Dictionary } from "@/i18n/dictionaries/en";
import { getSeo } from "@/lib/seo";

// What Google reads about the site. Company details are left out until the placeholders in config/site.ts are real.
export async function JsonLd({ lang, faq }: { lang: string; faq: Dictionary["faq"] }) {
  const { siteUrl, siteName } = await getSeo();
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "Organization", "@id": `${siteUrl}/#organization`, name: siteName, url: siteUrl, logo: `${siteUrl}/icon-512.png` },
      { "@type": "WebSite", "@id": `${siteUrl}/#website`, name: siteName, url: siteUrl, inLanguage: lang, publisher: { "@id": `${siteUrl}/#organization` } },
      {
        "@type": "FAQPage",
        inLanguage: lang,
        mainEntity: faq.items.map(({ q, a }) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
      },
    ],
  };

  // "<" is escaped so that no text can close the script tag.
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}
