import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { pageMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/landing/JsonLd";
import { Suspense } from "react";
import { hasLocale } from "@/i18n/config";
import { getCarCheckDictionary, getDictionary, getTariffsDictionary } from "@/i18n/dictionaries";
import { SiteHeader } from "@/components/SiteHeader";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/landing/Hero";
import { Roles } from "@/components/landing/Roles";
import { Benefits } from "@/components/landing/Benefits";
import { Rating } from "@/components/landing/Rating";
import { Steps } from "@/components/landing/Steps";
import { Bonuses } from "@/components/landing/Bonuses";
import { CarCheck } from "@/components/landing/CarCheck";
import { FaqContact } from "@/components/landing/FaqContact";
import { FinalCta } from "@/components/landing/FinalCta";

// The Bonuses section is kept in the project but hidden for now; set to true to show it again.
const SHOW_BONUSES = false;

export async function generateMetadata({ params }: PageProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  return hasLocale(lang) ? pageMetadata(lang, "home") : {};
}

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const [dict, tariffsDict, carCheck] = await Promise.all([
    getDictionary(lang),
    getTariffsDictionary(lang),
    getCarCheckDictionary(lang),
  ]);

  return (
    <>
      <JsonLd lang={lang} faq={dict.faq} />
      <a
        href="#main"
        className="sr-only z-50 rounded-full bg-ink px-4 py-2 text-surface focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        {dict.nav.skip}
      </a>
      <SiteHeader lang={lang} nav={dict.nav} />
      <main id="main" tabIndex={-1} className="outline-none">
        <Hero t={dict.hero} servicesLabel={dict.services.label} lang={lang} />
        <Roles t={dict.roles} lang={lang} />
        <Benefits t={dict.benefits} />
        {/* Read from the database on each request; renders nothing when turned off in the admin panel. */}
        <Suspense fallback={null}>
          <Rating t={dict.rating} lang={lang} />
        </Suspense>
        <Steps t={dict.steps} />
        {SHOW_BONUSES ? (
          <Bonuses t={dict.bonuses} />
        ) : (
          <Suspense fallback={null}>
            <CarCheck t={carCheck} tariffItems={tariffsDict.items} lang={lang} showTariffsLink />
          </Suspense>
        )}
        <FaqContact faq={dict.faq} contact={dict.contact} />
        <FinalCta t={dict.cta} lang={lang} />
      </main>
      <Footer lang={lang} t={dict.footer} nav={dict.nav} />
    </>
  );
}
