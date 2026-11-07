import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import type { RatingSettings } from "@/db/entities";
import { hasLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { fill } from "@/i18n/fill";
import { Footer } from "@/components/Footer";
import { SiteHeader } from "@/components/SiteHeader";
import { formatUpdated, periodLabel } from "@/components/rating/period-label";
import { RatingList, RatingListSkeleton } from "@/components/rating/RatingList";
import { RichText } from "@/components/RichText";
import { getRatingText } from "@/lib/rating/content";
import { getPublicTop, getRatingSettings, hasStoredPhones } from "@/lib/rating/service";
import { LeaderboardSearch } from "@/components/rating/LeaderboardSearch";
import { searchLeaderboard } from "./actions";

export async function generateMetadata({ params }: PageProps<"/[lang]/leaderboard">): Promise<Metadata> {
  const { lang } = await params;
  return hasLocale(lang) ? pageMetadata(lang, "rating") : {};
}

export default async function RatingPage({ params, searchParams }: PageProps<"/[lang]/leaderboard">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);

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
        <Suspense fallback={<div className="min-h-[70vh] animate-pulse bg-dark" />}>
          <RatingContent lang={lang} t={dict.rating} searchParams={searchParams} />
        </Suspense>
      </main>
      <Footer lang={lang} t={dict.footer} nav={dict.nav} />
    </>
  );
}

type SearchParams = PageProps<"/[lang]/leaderboard">["searchParams"];

/** Everything here is read on the server for each request; the browser only receives the finished result. */
async function RatingContent({ lang, t, searchParams }: { lang: Locale; t: Dictionary["rating"]; searchParams: SearchParams }) {
  await connection();

  const settings = await getRatingSettings().catch((error) => {
    console.error("Rating unavailable", error);
    return null;
  });
  // A turned-off rating has no page at all.
  if (!settings?.enabled) redirect(`/${lang}`);

  const text = getRatingText(settings, lang);
  const { q } = await searchParams;
  const query = (typeof q === "string" ? q : "").trim().slice(0, 60);
  const phoneSearch = await hasStoredPhones().catch(() => false);

  return (
    <>
      <section className="bg-dark text-surface">
        <div className="mx-auto max-w-site px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand">{t.label}</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-balance lg:text-[52px] lg:leading-[1.1]">{text.pageTitle}</h1>
          <p className="mt-4 max-w-2xl whitespace-pre-line leading-relaxed text-on-dark-muted">{text.landingText}</p>
          <dl className="mt-8 flex flex-wrap gap-3 text-sm">
            <div className="rounded-xl bg-dark-2 px-4 py-2.5">
              <dt className="inline text-on-dark-muted">{t.periodLabel}: </dt>
              <dd className="inline font-semibold">{periodLabel(settings, t.rollingPeriod, lang)}</dd>
            </div>
            <div className="rounded-xl bg-dark-2 px-4 py-2.5">
              <dt className="inline text-on-dark-muted">{t.minOrdersLabel}: </dt>
              <dd className="inline font-semibold">{settings.minOrders}</dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="mx-auto grid max-w-site grid-cols-[minmax(0,1fr)] gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)] lg:gap-14 lg:px-8 lg:py-20">
        <div className="order-2 min-w-0 lg:order-1">
          <h2 className="mb-6 text-2xl font-bold tracking-tight">{fill(t.topTitle, { n: settings.pageCount })}</h2>
          <Suspense fallback={<RatingListSkeleton count={Math.min(settings.pageCount, 10)} tone="light" label={t.loading} />}>
            <TopDrivers settings={settings} t={t} lang={lang} />
          </Suspense>
        </div>

        <aside id="search" className="order-1 scroll-mt-24 lg:sticky lg:top-24 lg:order-2 lg:self-start">
          <div className="rounded-[20px] bg-brand-tint p-5 sm:p-6">
            <h2 className="text-xl font-bold tracking-tight">{t.searchTitle}</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-2">{phoneSearch ? t.searchLeadPhone : t.searchLead}</p>
            <LeaderboardSearch
              lang={lang}
              initialQuery={query}
              initialResult={query ? await searchLeaderboard(query) : null}
              t={{
                label: phoneSearch ? t.searchLabelPhone : t.searchLabel,
                placeholder: phoneSearch ? t.searchPlaceholderPhone : t.searchPlaceholder,
                button: t.searchButton,
                tooShort: t.searchTooShort,
                phoneShort: t.searchPhoneShort,
                empty: t.searchEmpty,
                more: t.searchMore,
                unavailable: t.unavailable,
                place: t.place,
                inTop: t.inTop,
                orders: t.orders,
                searching: t.searching,
              }}
            />
          </div>
        </aside>
      </section>

      <section aria-labelledby="rules-title" className="border-t border-line bg-surface-2">
        <div className="mx-auto grid max-w-site grid-cols-[minmax(0,1fr)] gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)] lg:gap-14 lg:px-8 lg:py-20">
          <h2 id="rules-title" className="text-3xl font-bold tracking-tight lg:sticky lg:top-28 lg:self-start">{t.rulesTitle}</h2>
          <div className="max-w-3xl">
            <RichText text={text.rules} />
          </div>
        </div>
      </section>
    </>
  );
}

async function TopDrivers({ settings, t, lang }: { settings: RatingSettings; t: Dictionary["rating"]; lang: Locale }) {
  const top = await getPublicTop(settings, settings.pageCount).catch((error) => {
    console.error("Rating could not be read", error);
    return null;
  });

  if (!top) return <p className="rounded-2xl border border-line p-6 text-muted">{t.unavailable}</p>;
  if (top.rows.length === 0) return <p className="rounded-2xl border border-line p-6 text-muted">{t.empty}</p>;

  return (
    <>
      <RatingList rows={top.rows} showScores={settings.showScores} orders={t.orders} lang={lang} tone="light" />
      <p className="mt-4 text-xs text-muted">{fill(t.updated, { time: formatUpdated(top.syncedAt, lang) })}</p>
    </>
  );
}

