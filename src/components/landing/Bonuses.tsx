import type { Dictionary } from "@/i18n/dictionaries/en";
import { site } from "@/config/site";
import { Icon } from "../Icon";

export function Bonuses({ t }: { t: Dictionary["bonuses"] }) {
  return (
    <section aria-labelledby="bonuses-title" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="relative grid items-center gap-8 overflow-hidden rounded-[32px] bg-brand p-7 sm:p-10 lg:grid-cols-[auto_1fr_auto] lg:gap-10 lg:p-12">
        <div aria-hidden="true" className="absolute -bottom-24 -right-24 size-72 rounded-full bg-brand-hover" />
        <span className="relative flex size-16 items-center justify-center rounded-2xl bg-ink text-brand">
          <Icon name="gift" className="size-8" />
        </span>
        <div className="relative">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-ink-2">{t.label}</p>
          <h2 id="bonuses-title" className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            {t.title}
          </h2>
          <p className="mt-3 max-w-2xl leading-relaxed text-ink-2">{t.body}</p>
        </div>
        <a
          href={site.whatsapp.href}
          target="_blank"
          rel="noopener"
          className="relative inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-ink px-6 font-semibold text-surface transition hover:bg-dark-2"
        >
          <Icon name="message" className="size-5 text-brand" />
          {t.cta}
        </a>
      </div>
    </section>
  );
}
