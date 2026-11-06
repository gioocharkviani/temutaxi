import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import type { RatingSettings } from "@/db/entities";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { fill } from "@/i18n/fill";
import { getRatingText } from "@/lib/rating/content";
import { getPublicTop, getRatingSettings } from "@/lib/rating/service";
import { Icon } from "../Icon";
import { formatUpdated, periodLabel } from "../rating/period-label";
import { RatingList, RatingListSkeleton } from "../rating/RatingList";

/**
 * Short conditions and the top drivers, from the database. Renders nothing when the rating is off or the database is unavailable.
 */
export async function Rating({ t, lang }: { t: Dictionary["rating"]; lang: Locale }) {
  await connection();

  const settings = await getRatingSettings().catch((error) => {
    console.error("Rating unavailable", error);
    return null;
  });
  if (!settings?.enabled) return null;

  const text = getRatingText(settings, lang);
  const showDrivers = settings.landingCount > 0;

  return (
    <section id="rating" aria-labelledby="rating-title" className="relative overflow-hidden bg-dark text-surface">
      <div aria-hidden="true" className="absolute inset-y-0 right-0 hidden w-1/2 bg-[repeating-linear-gradient(135deg,transparent_0_46px,var(--color-dark-2)_46px_48px)] lg:block" />
      <div className={`relative mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)] gap-10 px-4 py-20 sm:px-6 lg:gap-16 lg:px-8 lg:py-28 ${showDrivers ? "lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]" : ""}`}>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand">{t.label}</p>
          <h2 id="rating-title" className="mt-3 text-3xl font-bold tracking-tight text-balance sm:text-4xl lg:text-[44px] lg:leading-[1.1]">
            {text.landingTitle}
          </h2>
          <p className="mt-4 max-w-md whitespace-pre-line leading-relaxed text-on-dark-muted">{text.landingText}</p>

          <div className="mt-6 flex flex-wrap gap-2 text-sm">
            <p className="rounded-xl bg-dark-2 px-4 py-2.5">
              <span className="text-on-dark-muted">{t.periodLabel}: </span>
              <strong className="font-semibold">{periodLabel(settings, t.rollingPeriod, lang)}</strong>
            </p>
            {settings.lastSyncAt && (
              <p className="rounded-xl bg-dark-2 px-4 py-2.5 text-on-dark-muted">{fill(t.updated, { time: formatUpdated(settings.lastSyncAt, lang) })}</p>
            )}
          </div>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href={`/${lang}/rating`}
              className="inline-flex h-12 items-center gap-2 rounded-2xl bg-brand px-6 font-semibold text-ink transition hover:bg-brand-hover"
            >
              {t.details}
              <Icon name="arrowUpRight" className="size-4" />
            </Link>
            <Link
              href={`/${lang}/register`}
              className="inline-flex h-12 items-center rounded-2xl border border-dark-3 px-6 font-semibold transition hover:border-on-dark-muted"
            >
              {t.cta}
            </Link>
          </div>
        </div>

        {showDrivers && (
          <Suspense fallback={<RatingListSkeleton count={settings.landingCount} tone="dark" label={t.loading} />}>
            <TopDrivers settings={settings} t={t} />
          </Suspense>
        )}
      </div>
    </section>
  );
}

async function TopDrivers({ settings, t }: { settings: RatingSettings; t: Dictionary["rating"] }) {
  const top = await getPublicTop(settings, settings.landingCount).catch((error) => {
    console.error("Rating could not be read", error);
    return null;
  });

  if (!top) return <p className="self-center rounded-2xl bg-dark-2 p-6 text-on-dark-muted">{t.unavailable}</p>;
  if (top.rows.length === 0) return <p className="self-center rounded-2xl bg-dark-2 p-6 text-on-dark-muted">{t.empty}</p>;

  return <RatingList rows={top.rows} showScores={settings.showScores} ordersLabel={t.orders} tone="dark" />;
}
