import { notFound } from "next/navigation";
import { hasLocale } from "@/i18n/config";
import { getCarCheckDictionary, getDictionary, getTariffsDictionary } from "@/i18n/dictionaries";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/landing/Hero";
import { Roles } from "@/components/landing/Roles";
import { Benefits } from "@/components/landing/Benefits";
import { Steps } from "@/components/landing/Steps";
import { Bonuses } from "@/components/landing/Bonuses";
import { CarCheck } from "@/components/landing/CarCheck";
import { FaqContact } from "@/components/landing/FaqContact";
import { FinalCta } from "@/components/landing/FinalCta";

// The Bonuses section is kept in the project but hidden for now; set to true to show it again.
const SHOW_BONUSES = false;

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
      <a
        href="#main"
        className="sr-only z-50 rounded-full bg-ink px-4 py-2 text-surface focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        {dict.nav.skip}
      </a>
      <Header lang={lang} nav={dict.nav} />
      <main id="main" tabIndex={-1} className="outline-none">
        <Hero t={dict.hero} servicesLabel={dict.services.label} lang={lang} />
        <Roles t={dict.roles} lang={lang} />
        <Benefits t={dict.benefits} />
        <Steps t={dict.steps} />
        {SHOW_BONUSES ? (
          <Bonuses t={dict.bonuses} />
        ) : (
          <CarCheck t={carCheck} tariffItems={tariffsDict.items} lang={lang} showTariffsLink />
        )}
        <FaqContact faq={dict.faq} contact={dict.contact} />
        <FinalCta t={dict.cta} lang={lang} />
      </main>
      <Footer lang={lang} t={dict.footer} nav={dict.nav} />
    </>
  );
}
