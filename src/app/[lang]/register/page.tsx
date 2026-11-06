import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense, type ComponentProps } from "react";
import { hasLocale } from "@/i18n/config";
import { getDictionary, getRegisterDictionary, getTariffsDictionary } from "@/i18n/dictionaries";
import { carClasses, type CarClass } from "@/data/car-classes";
import { SiteHeader } from "@/components/SiteHeader";
import { Footer } from "@/components/Footer";
import { RegisterForm } from "@/components/register/RegisterForm";
import { getCars } from "@/lib/cars";

/** Reads the car list on the server, so the browser makes no request for it. */
async function RegisterFormWithCars(props: Omit<ComponentProps<typeof RegisterForm>, "cars">) {
  await connection();
  return <RegisterForm {...props} cars={await getCars()} />;
}

export async function generateMetadata({ params }: PageProps<"/[lang]/register">): Promise<Metadata> {
  const { lang } = await params;
  return hasLocale(lang) ? pageMetadata(lang, "register") : {};
}

export default async function RegisterPage({ params }: PageProps<"/[lang]/register">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const [dict, t, tariffsDict] = await Promise.all([
    getDictionary(lang),
    getRegisterDictionary(lang),
    getTariffsDictionary(lang),
  ]);
  const names = Object.fromEntries(carClasses.map((c) => [c, tariffsDict.items[c].name])) as Record<CarClass, string>;

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
        <div className="mx-auto max-w-7xl px-4 pb-20 pt-8 sm:px-6 lg:px-8 lg:pb-28 lg:pt-12">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
            <span className="size-1.5 rounded-full bg-brand" aria-hidden="true" />
            {t.badge}
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-balance sm:text-5xl">{t.title}</h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">{t.lead}</p>
          <div className="mt-10">
            {/* The form reads ?brand=&model=&year= from the car checker, so it renders in the browser. */}
            <Suspense fallback={<div className="h-[600px] animate-pulse rounded-[28px] bg-surface-3" />}>
              <RegisterFormWithCars t={t} names={names} lang={lang} />
            </Suspense>
          </div>
        </div>
      </main>
      <Footer lang={lang} t={dict.footer} nav={dict.nav} />
    </>
  );
}
