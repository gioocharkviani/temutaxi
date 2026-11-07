import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { site } from "@/config/site";
import { Icon } from "../Icon";
import { LogoMark } from "../Logo";

export function FinalCta({ t, lang }: { t: Dictionary["cta"]; lang: Locale }) {
  return (
    <section aria-labelledby="cta-title" className="mx-auto max-w-site px-4 pb-20 sm:px-6 lg:px-8 lg:pb-28">
      <div className="relative overflow-hidden rounded-[32px] bg-dark px-6 py-14 text-center text-surface sm:px-12 lg:py-20">
        <div aria-hidden="true" className="absolute left-1/2 top-0 h-48 w-[640px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand/40 blur-3xl" />
        <LogoMark className="relative mx-auto size-16" />
        <h2 id="cta-title" className="relative mx-auto mt-8 max-w-2xl text-3xl font-bold tracking-tight text-balance sm:text-5xl">
          {t.title}
        </h2>
        <p className="relative mx-auto mt-5 max-w-xl text-lg leading-relaxed text-on-dark-muted">{t.body}</p>
        <div className="relative mt-10 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href={`/${lang}/register`}
            className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-brand px-8 text-base font-semibold text-ink transition hover:bg-brand-hover"
          >
            {t.button}
            <Icon name="arrowUpRight" className="size-5" />
          </Link>
          <a
            href={site.phone.href}
            className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl border border-dark-3 px-8 text-base font-semibold text-surface transition hover:bg-dark-2"
          >
            <Icon name="phone" className="size-5" />
            {site.phone.display}
          </a>
        </div>
      </div>
    </section>
  );
}
