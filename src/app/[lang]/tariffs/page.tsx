import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { getCars } from "@/lib/cars";
import type { TariffsDictionary } from "@/i18n/dictionaries";
import { hasLocale } from "@/i18n/config";
import { getCarCheckDictionary, getDictionary, getTariffsDictionary } from "@/i18n/dictionaries";
import { CarCheck } from "@/components/landing/CarCheck";
import { site } from "@/config/site";
import { tariffs } from "@/data/tariffs";
import { SiteHeader } from "@/components/SiteHeader";
import { Footer } from "@/components/Footer";
import { Icon } from "@/components/Icon";
import { TariffExplorer } from "@/components/tariffs/TariffExplorer";
import { TariffCompare } from "@/components/tariffs/TariffCompare";
import { CategoryAccordion, type AccordionText } from "@/components/tariffs/CategoryAccordion";
import { carClasses } from "@/data/car-classes";
import { SectionHead } from "@/components/landing/SectionHead";

// Price cards + comparison table are hidden because their prices and requirements are invented examples.
// Replace them with official figures (src/data/tariffs.ts and the tariffs dictionaries) before setting this to true.
const SHOW_PRICES = false;

/** Car lists per category, read from the database on the server. */
async function CarLists({ t }: { t: TariffsDictionary }) {
  await connection();
  const cars = await getCars();
  if (cars.length === 0) return null;

  // Only what this component shows is sent to the browser.
  const text = {
    models: t.models,
    items: Object.fromEntries(carClasses.map((c) => [c, { name: t.items[c].name, tagline: t.items[c].tagline }])) as AccordionText["items"],
  };

  return (
    <section aria-labelledby="models-title" className="mx-auto max-w-site px-4 pb-20 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <SectionHead id="models-title" label={t.models.label} title={t.models.title} />
        <p className="max-w-md text-muted">{t.models.lead}</p>
      </div>
      <div className="mt-10">
        <CategoryAccordion t={text} cars={cars} />
      </div>
    </section>
  );
}

export async function generateMetadata({ params }: PageProps<"/[lang]/tariffs">): Promise<Metadata> {
  const { lang } = await params;
  return hasLocale(lang) ? pageMetadata(lang, "tariffs") : {};
}

export default async function TariffsPage({ params }: PageProps<"/[lang]/tariffs">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const [dict, t, carCheck] = await Promise.all([
    getDictionary(lang),
    getTariffsDictionary(lang),
    getCarCheckDictionary(lang),
  ]);

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
        {/* Hero */}
        <section aria-labelledby="tariffs-title" className="relative overflow-hidden">
          <div aria-hidden="true" className="pointer-events-none absolute -right-40 -top-48 size-[520px] rounded-full bg-brand/30 blur-3xl" />
          <div className="relative mx-auto grid max-w-site items-end gap-10 px-4 pb-12 pt-10 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:px-8 lg:pb-16 lg:pt-16">
            <div>
              <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                <span className="size-1.5 rounded-full bg-brand" aria-hidden="true" />
                {t.label}
              </p>
              <h1 id="tariffs-title" className="mt-4 text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl">
                {t.title}
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">{t.lead}</p>
              <p className="mt-6 inline-flex max-w-xl items-start gap-2.5 rounded-2xl border border-brand bg-brand-tint px-4 py-3 text-sm text-ink-2">
                <Icon name="info" className="mt-0.5 size-4 shrink-0" />
                {t.sourceNote}
              </p>
            </div>

            {/* Icon mosaic of all tariffs */}
            <div aria-hidden="true" className="hidden grid-cols-4 gap-3 lg:grid">
              {tariffs.map((x, i) => (
                <span
                  key={x.id}
                  className={`flex aspect-square items-center justify-center rounded-3xl ${
                    x.popular ? "col-span-2 row-span-2 bg-brand text-ink" : i % 3 === 0 ? "bg-surface text-ink ring-1 ring-line" : "bg-ink text-brand"
                  }`}
                >
                  <Icon name={x.icon} className={x.popular ? "size-16" : "size-7"} strokeWidth={x.popular ? 1.75 : 2} />
                </span>
              ))}
              <span className="col-span-2 flex items-center justify-center gap-3 rounded-3xl bg-brand-tint ring-1 ring-brand">
                <span className="font-display text-5xl leading-none">{tariffs.length}</span>
                <span className="text-sm font-semibold text-ink-2">{t.label}</span>
              </span>
            </div>
          </div>
        </section>

        <Suspense fallback={null}>
          <div className="-mt-8">
            <CarCheck t={carCheck} tariffItems={t.items} lang={lang} />
          </div>
          <CarLists t={t} />
        </Suspense>

        {SHOW_PRICES && (
          <>
            <section aria-label={t.label} className="mx-auto max-w-site px-4 sm:px-6 lg:px-8">
              <TariffExplorer t={t} lang={lang} />
            </section>
            <TariffCompare t={t} />
          </>
        )}

        {/* CTA */}
        <section aria-labelledby="tariffs-cta" className="mx-auto max-w-site px-4 pb-20 sm:px-6 lg:px-8 lg:pb-28">
          <div className="relative grid items-center gap-6 overflow-hidden rounded-[32px] bg-dark p-8 text-surface sm:p-12 lg:grid-cols-[1fr_auto]">
            <div aria-hidden="true" className="absolute -left-20 -top-24 size-72 rounded-full bg-brand/25 blur-3xl" />
            <div className="relative">
              <h2 id="tariffs-cta" className="text-2xl font-bold tracking-tight text-balance sm:text-4xl">
                {t.cta.title}
              </h2>
              <p className="mt-3 max-w-xl leading-relaxed text-on-dark-muted">{t.cta.body}</p>
            </div>
            <a
              href={site.whatsapp.href}
              target="_blank"
              rel="noopener"
              className="relative inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-brand px-7 font-semibold text-ink transition hover:bg-brand-hover"
            >
              <Icon name="message" className="size-5" />
              {t.cta.button}
            </a>
          </div>
        </section>
      </main>
      <Footer lang={lang} t={dict.footer} nav={dict.nav} />
    </>
  );
}
