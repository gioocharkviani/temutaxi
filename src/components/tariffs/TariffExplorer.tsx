"use client";

import Link from "next/link";
import { useState } from "react";
import type { Locale } from "@/i18n/config";
import type { TariffsDictionary } from "@/i18n/dictionaries/tariffs-en";
import { formatGel, tariffs, type Tariff, type TariffCategory } from "@/data/tariffs";
import { site } from "@/config/site";
import { Icon } from "../Icon";

type Filter = "all" | TariffCategory;
const filters: Filter[] = ["all", "ride", "delivery"];
// The help card fills whatever is left of the last row in the 3-column (xl) grid.
const helpSpan: Record<number, string> = { 1: "", 2: "xl:col-span-2", 3: "md:col-span-2 xl:col-span-3" };

export function TariffExplorer({ t, lang }: { t: TariffsDictionary; lang: Locale }) {
  const [filter, setFilter] = useState<Filter>("all");
  const visible = tariffs.filter((x) => filter === "all" || x.category === filter);
  const active = filters.indexOf(filter);

  return (
    <div>
      {/* Segmented filter with a sliding indicator */}
      <div role="tablist" aria-label={t.label} className="relative inline-grid grid-cols-3 rounded-full border border-line bg-surface p-1">
        <span
          aria-hidden="true"
          className="absolute inset-y-1 left-1 w-[calc((100%-0.5rem)/3)] rounded-full bg-ink transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{ transform: `translateX(${active * 100}%)` }}
        />
        {filters.map((f) => {
          const count = f === "all" ? tariffs.length : tariffs.filter((x) => x.category === f).length;
          const selected = f === filter;
          return (
            <button
              key={f}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setFilter(f)}
              className={`relative z-10 flex h-10 items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors duration-300 sm:px-6 ${
                selected ? "text-surface" : "text-ink-2 hover:text-ink"
              }`}
            >
              {t.filters[f]}
              <span
                className={`rounded-full px-1.5 text-xs tabular-nums transition-colors duration-300 ${
                  selected ? "bg-brand text-ink" : "bg-surface-2 text-faint"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <ul key={filter} className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {visible.map((tariff, i) => (
          <li key={tariff.id} className="tariff-card-in" style={{ animationDelay: `${i * 70}ms` }}>
            <TariffCard tariff={tariff} t={t} lang={lang} />
          </li>
        ))}
        {filter === "all" && (
          <li
            className={`tariff-card-in ${helpSpan[3 - (visible.length % 3)]}`}
            style={{ animationDelay: `${visible.length * 70}ms` }}
          >
            <HelpCard t={t} />
          </li>
        )}
      </ul>
    </div>
  );
}

// Fills the last grid slot with a nudge to ask a manager.
function HelpCard({ t }: { t: TariffsDictionary }) {
  return (
    <a
      href={site.whatsapp.href}
      target="_blank"
      rel="noopener"
      className="group flex h-full min-h-72 flex-col justify-between rounded-[28px] border-2 border-dashed border-line p-7 transition duration-300 hover:-translate-y-1 hover:border-brand-press hover:bg-brand-tint"
    >
      <span className="flex size-14 items-center justify-center rounded-2xl bg-surface text-ink ring-1 ring-line transition group-hover:bg-brand group-hover:ring-brand">
        <Icon name="message" className="size-7" />
      </span>
      <span>
        <span className="block font-display text-2xl leading-tight tracking-tight text-balance">{t.cta.title}</span>
        <span className="mt-3 block leading-relaxed text-muted">{t.cta.body}</span>
        <span className="mt-6 inline-flex items-center gap-2 font-semibold">
          {t.cta.button}
          <Icon name="arrowRight" className="size-4 transition group-hover:translate-x-1" />
        </span>
      </span>
    </a>
  );
}

function TariffCard({ tariff, t, lang }: { tariff: Tariff; t: TariffsDictionary; lang: Locale }) {
  const copy = t.items[tariff.id];
  const l = t.labels;
  const popular = tariff.popular;

  const stats = [
    { label: l.perKm, value: formatGel(tariff.perKm) },
    { label: l.perMin, value: formatGel(tariff.perMin) },
    { label: l.freeWait, value: `${tariff.freeWait} ${l.minutes}` },
    { label: l.paidWait, value: `${formatGel(tariff.paidWait)}${l.perMinShort}` },
  ];

  return (
    <article
      className={`group relative flex h-full flex-col overflow-hidden rounded-[28px] border p-6 transition duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-ink/10 sm:p-7 ${
        popular ? "border-brand bg-surface ring-4 ring-brand/30" : "border-line-soft bg-surface"
      }`}
    >
      <Icon
        name={tariff.icon}
        strokeWidth={1.25}
        className="pointer-events-none absolute -right-6 -top-6 size-36 text-ink/[0.04] transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110"
      />

      <header className="relative flex items-start gap-4">
        <span
          className={`flex size-14 shrink-0 items-center justify-center rounded-2xl transition duration-300 group-hover:rotate-[-4deg] ${
            popular ? "bg-brand text-ink" : "bg-ink text-brand"
          }`}
        >
          <Icon name={tariff.icon} className="size-7" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-xl font-bold tracking-tight">{copy.name}</h3>
            {popular && (
              <span className="rounded-full bg-brand px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-ink">
                {l.popular}
              </span>
            )}
          </div>
          <p className="mt-1 text-sm leading-snug text-muted">{copy.tagline}</p>
        </div>
      </header>

      <div className="relative mt-6 flex items-end justify-between gap-3 rounded-2xl bg-surface-2 px-4 py-3.5">
        <span className="text-sm text-muted">{l.from}</span>
        <span className="font-display text-3xl leading-none tracking-tight">{formatGel(tariff.start)}</span>
      </div>

      <dl className="relative mt-3 grid grid-cols-2 gap-2">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-line-soft px-3.5 py-2.5">
            <dt className="text-xs text-faint">{s.label}</dt>
            <dd className="mt-0.5 font-semibold tabular-nums">{s.value}</dd>
          </div>
        ))}
      </dl>

      {(tariff.seats || tariff.minYear) && (
        <div className="relative mt-4 flex flex-wrap gap-2">
          {tariff.seats && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-tint px-3 py-1.5 text-sm font-medium text-ink-2">
              <Icon name="users" className="size-4" />
              {l.seats}: {tariff.seats}
            </span>
          )}
          {tariff.minYear && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-tint px-3 py-1.5 text-sm font-medium text-ink-2">
              <Icon name="calendar" className="size-4" />
              {l.minYear}: {tariff.minYear}+
            </span>
          )}
        </div>
      )}

      <div className="relative mt-5 border-t border-line-soft pt-5">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-faint">{l.examples}</p>
        <p className="mt-1.5 text-sm font-medium text-ink-2">{copy.cars}</p>

        <p className="mt-5 text-xs font-semibold uppercase tracking-[0.12em] text-faint">{l.requirements}</p>
        <ul className="mt-2.5 space-y-2">
          {copy.requirements.map((r) => (
            <li key={r} className="flex items-start gap-2.5 text-sm">
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-up-soft text-up">
                <Icon name="check" className="size-3" strokeWidth={3} />
              </span>
              {r}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex-1" aria-hidden="true" />
      <Link
        href={`/${lang}/register`}
        className={`relative mt-6 flex h-12 items-center justify-center gap-2 rounded-2xl font-semibold transition ${
          popular ? "bg-brand text-ink hover:bg-brand-hover" : "bg-ink text-surface hover:bg-dark-2"
        }`}
      >
        {l.register}
        <Icon name="arrowUpRight" className="size-4" />
      </Link>
    </article>
  );
}
