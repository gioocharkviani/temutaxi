import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { hasLocale, type Locale } from "@/i18n/config";
import { getDictionary, getPrivacyDictionary } from "@/i18n/dictionaries";
import { fill } from "@/i18n/fill";
import { site } from "@/config/site";
import { SiteHeader } from "@/components/SiteHeader";
import { RichText, richTextHeadings } from "@/components/RichText";
import { formatLongDate } from "@/components/rating/period-label";
import { getPrivacyPage } from "@/lib/privacy";
import type { PrivacyDictionary } from "@/i18n/dictionaries/privacy-en";
import { Footer } from "@/components/Footer";

export async function generateMetadata({ params }: PageProps<"/[lang]/privacy">): Promise<Metadata> {
  const { lang } = await params;
  return hasLocale(lang) ? pageMetadata(lang, "privacy") : {};
}

// Company and contact details come from one place, so the policy always matches the rest of the site.
const details = {
  company: site.company.name,
  companyId: site.company.id,
  address: site.company.address,
  email: site.email,
  phone: `+995 ${site.phone.display}`,
};

export default async function PrivacyPage({ params }: PageProps<"/[lang]/privacy">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const [dict, t] = await Promise.all([getDictionary(lang), getPrivacyDictionary(lang)]);

  return (
    <>
      <a
        href="#main"
        className="sr-only z-50 rounded-full bg-ink px-4 py-2 text-surface focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        {dict.nav.skip}
      </a>
      <SiteHeader lang={lang} nav={dict.nav} />
      <main id="main" tabIndex={-1} className="outline-none">
        <div className="mx-auto max-w-site px-4 pb-20 pt-10 sm:px-6 lg:px-8 lg:pb-28 lg:pt-16">
          <Suspense fallback={<div className="min-h-[60vh]" />}>
            <PrivacyContent lang={lang} t={t} />
          </Suspense>
        </div>
      </main>
      <Footer lang={lang} t={dict.footer} nav={dict.nav} />
    </>
  );
}

/** The text comes from the database, so it is read for each request. */
async function PrivacyContent({ lang, t }: { lang: Locale; t: PrivacyDictionary }) {
  await connection();
  const { text, updatedAt } = await getPrivacyPage(lang);

  const body = fill(text.body, details);
  const headings = richTextHeadings(body, "section");

  // The text keeps a comfortable reading width; on wide screens a table of contents fills the rest of the container.
  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-12 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-16 xl:grid-cols-[minmax(0,1fr)_320px] xl:gap-24">
      <article className="max-w-3xl">
        <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
          <span className="size-1.5 rounded-full bg-brand" aria-hidden="true" />
          {t.label}
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-balance sm:text-5xl">{text.title}</h1>
        <p className="mt-4 text-sm text-muted">
          {t.updatedLabel}: {updatedAt ? formatLongDate(updatedAt, lang) : t.updated}
        </p>
        <div className="mt-8">
          <RichText text={body} heading="h2" idPrefix="section" />
        </div>
      </article>

      {headings.length > 1 && (
        <nav aria-label={t.contents} className="hidden lg:sticky lg:top-28 lg:block lg:self-start">
          <div className="rounded-[20px] border border-line bg-surface p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">{t.contents}</p>
            <ol className="mt-4 space-y-1 text-sm">
              {headings.map((heading) => (
                <li key={heading.id}>
                  <a href={`#${heading.id}`} className="block rounded-lg px-2 py-1.5 text-ink-2 transition hover:bg-surface-2 hover:text-ink">
                    {heading.text}
                  </a>
                </li>
              ))}
            </ol>
          </div>
        </nav>
      )}
    </div>
  );
}
