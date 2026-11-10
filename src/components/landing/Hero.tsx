import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { site } from "@/config/site";
import { Icon } from "../Icon";
import { LogoMark } from "../Logo";

export function Hero({
  t,
  servicesLabel,
  lang,
}: {
  t: Dictionary["hero"];
  servicesLabel: string;
  lang: Locale;
}) {
  return (
    <section aria-labelledby="hero-title" className="relative overflow-hidden">
      {/* soft brand glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 -top-40 size-[560px] rounded-full bg-brand/30 blur-3xl"
      />
      <div className="relative mx-auto grid max-w-site items-center gap-12 px-4 pb-16 pt-8 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 lg:px-8 lg:pb-24 lg:pt-16">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-sm font-medium text-ink-2">
            <Icon name="badgeCheck" className="size-4 text-up" />
            {t.badge}
          </p>
          <h1
            id="hero-title"
            className="mt-6 text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl lg:leading-[1.05]"
          >
            {t.title}{" "}
            <span className="box-decoration-clone bg-[linear-gradient(transparent_62%,var(--color-brand)_62%,var(--color-brand)_92%,transparent_92%)] px-0.5">
              {t.titleAccent}
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
            {t.lead}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href={`/${lang}/register`}
              className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-ink px-7 text-base font-semibold text-surface transition hover:bg-dark-2"
            >
              {t.primary}
              <Icon name="arrowUpRight" className="size-5 text-brand" />
            </Link>
            <a
              href={site.whatsapp.href}
              target="_blank"
              rel="noopener"
              className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl border border-line bg-surface px-7 text-base font-semibold text-ink transition hover:border-ink-2"
            >
              <Icon name="message" className="size-5" />
              {t.secondary}
            </a>
          </div>

          <dl className="mt-10 grid max-w-lg grid-cols-2 gap-x-4 gap-y-5 border-t border-line pt-6 sm:grid-cols-4">
            {t.stats.map((s) => (
              <div key={s.label}>
                <dt className="sr-only">{s.label}</dt>
                <dd className="text-2xl font-bold tracking-tight sm:text-3xl">
                  {s.value}
                </dd>
                <dd className="mt-1 text-sm text-muted">{s.label}</dd>
              </div>
            ))}
          </dl>
        </div>

        <HeroVisual card={t.card} />
      </div>

      <div className="border-y border-line bg-surface">
        <div className="mx-auto flex max-w-site flex-wrap items-center gap-x-8 gap-y-3 px-4 py-5 sm:px-6 lg:px-8">
          <span className="text-sm font-medium text-faint">
            {servicesLabel}
          </span>
          {site.services.map((s) => (
            <span
              key={s}
              className="flex items-center gap-2 text-base font-semibold text-ink-2"
            >
              <span
                className="size-2 rounded-full bg-brand"
                aria-hidden="true"
              />
              {s}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function HeroVisual({ card }: { card: Dictionary["hero"]["card"] }) {
  return (
    <div className="relative mx-auto w-full max-w-md lg:max-w-none">
      <div className="relative overflow-hidden rounded-[32px] bg-dark p-6 text-surface shadow-2xl shadow-ink/20 sm:p-8">
        {/* route lines */}
        <svg
          aria-hidden="true"
          viewBox="0 0 400 220"
          className="absolute inset-x-0 top-0 h-56 w-full opacity-40"
        >
          <path
            d="M-10 180 C 80 180, 90 60, 200 70 S 330 30, 420 40"
            stroke="#fce000"
            strokeWidth="3"
            fill="none"
            strokeDasharray="2 10"
            strokeLinecap="round"
          />
          <path
            d="M-10 120 C 100 110, 160 190, 260 150 S 360 90, 420 110"
            stroke="#42413e"
            strokeWidth="2"
            fill="none"
          />
        </svg>

        <div className="relative flex items-center justify-between">
          <LogoMark className="size-14" />
          <div className="flex gap-2">
            <span className="flex size-11 items-center justify-center rounded-xl bg-dark-2 text-brand">
              <Icon name="car" />
            </span>
            <span className="flex size-11 items-center justify-center rounded-xl bg-dark-2 text-brand">
              <Icon name="star" />
            </span>
          </div>
        </div>

        <div className="relative mt-24 rounded-3xl bg-surface p-5 text-ink sm:p-6">
          <div className="flex items-center justify-between">
            <p className="font-semibold">{card.title}</p>
            <span className="rounded-full bg-brand-soft px-2.5 py-1 text-xs font-semibold text-ink-2">
              {card.status}
            </span>
          </div>
          <ol className="mt-5 space-y-3">
            {card.items.map((item, i) => {
              const done = i < card.items.length - 1;
              return (
                <li key={item} className="flex items-center gap-3">
                  <span
                    className={`flex size-7 shrink-0 items-center justify-center rounded-full ${
                      done
                        ? "bg-up text-surface"
                        : "border-2 border-dashed border-brand-press bg-brand-tint"
                    }`}
                  >
                    {done && (
                      <Icon name="check" className="size-4" strokeWidth={3} />
                    )}
                  </span>
                  <span className={done ? "text-ink" : "text-muted"}>
                    {item}
                  </span>
                </li>
              );
            })}
          </ol>
          <div className="mt-5 h-2 overflow-hidden rounded-full bg-surface-3">
            <div className="h-full w-2/3 rounded-full bg-brand" />
          </div>
        </div>
        <p className="relative mt-5 text-sm leading-relaxed text-on-dark-muted">
          {card.note}
        </p>
      </div>
    </div>
  );
}
