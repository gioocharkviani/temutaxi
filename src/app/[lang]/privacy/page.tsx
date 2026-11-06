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
import { RichText } from "@/components/RichText";
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
        <article className="mx-auto max-w-3xl px-4 pb-20 pt-10 sm:px-6 lg:pb-28 lg:pt-16">
          <Suspense fallback={<div className="min-h-[60vh]" />}>
            <PrivacyContent lang={lang} t={t} />
          </Suspense>
        </article>
      </main>
      <Footer lang={lang} t={dict.footer} nav={dict.nav} />
    </>
  );
}

/** The text comes from the database, so it is read for each request. */
async function PrivacyContent({ lang, t }: { lang: Locale; t: PrivacyDictionary }) {
  await connection();
  const { text, updatedAt } = await getPrivacyPage(lang);

  return (
    <>
      <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
        <span className="size-1.5 rounded-full bg-brand" aria-hidden="true" />
        {t.label}
      </p>
      <h1 className="mt-3 text-4xl font-bold tracking-tight text-balance sm:text-5xl">{text.title}</h1>
      <p className="mt-4 text-sm text-muted">
        {t.updatedLabel}: {updatedAt ? formatLongDate(updatedAt, lang) : t.updated}
      </p>
      <div className="mt-8">
        <RichText text={fill(text.body, details)} heading="h2" />
      </div>
    </>
  );
}
