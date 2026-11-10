import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Footer } from "@/components/Footer";
import { ReferralGenerator } from "@/components/ReferralGenerator";
import { SiteHeader } from "@/components/SiteHeader";
import { hasLocale, locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";

export async function generateMetadata({ params }: PageProps<"/[lang]/referral">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const { referral } = await getDictionary(lang);
  return {
    title: referral.metaTitle,
    description: referral.metaDescription,
    alternates: { canonical: `/${lang}/referral`, languages: Object.fromEntries(locales.map((l) => [l, `/${l}/referral`])) },
  };
}

export default async function ReferralPage({ params }: PageProps<"/[lang]/referral">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const t = dict.referral;

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
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
            <span className="size-1.5 rounded-full bg-brand" aria-hidden="true" />
            {t.label}
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-bold tracking-tight text-balance sm:text-5xl">{t.title}</h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink-2">{t.lead}</p>

          <div className="mt-10">
            <ReferralGenerator t={t} lang={lang} />
          </div>

          <ol className="mt-12 grid gap-4 md:grid-cols-3">
            {t.steps.map((step, i) => (
              <li key={step} className="rounded-[24px] border border-line bg-surface p-6">
                <span className="flex size-9 items-center justify-center rounded-xl bg-brand font-bold text-ink">{i + 1}</span>
                <p className="mt-4 leading-relaxed text-ink-2">{step}</p>
              </li>
            ))}
          </ol>
        </div>
      </main>
      <Footer lang={lang} t={dict.footer} nav={dict.nav} apps={dict.apps} />
    </>
  );
}
