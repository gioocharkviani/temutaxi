"use client";

import Link from "next/link";
import { useId, useState, type ReactNode } from "react";
import type { Locale } from "@/i18n/config";
import type { CarCheckDictionary } from "@/i18n/dictionaries/carcheck-en";
import { fill } from "@/i18n/fill";
import { brands, carClasses, classResults, MAX_YEAR, MIN_YEAR, modelsFor, type CarClass } from "@/data/car-classes";
import { tariffs } from "@/data/tariffs";
import { site } from "@/config/site";
import { Icon, type IconName } from "./Icon";

const years = Array.from({ length: MAX_YEAR - MIN_YEAR + 1 }, (_, i) => MAX_YEAR - i);
const iconFor = (c: CarClass): IconName => tariffs.find((t) => t.id === c)?.icon ?? "car";

const resultButton =
  "inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-ink px-6 font-semibold text-surface transition hover:bg-dark-2 sm:flex-1";

export function CarChecker({
  t,
  names,
  lang,
  showTariffsLink = false,
}: {
  t: CarCheckDictionary;
  names: Record<CarClass, string>;
  lang: Locale;
  showTariffsLink?: boolean;
}) {
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const id = useId();

  const models = brand ? modelsFor(brand) : [];
  const car = models.find((m) => m.model === model);
  const complete = Boolean(car && year);
  const results = classResults(car, Number(year));
  const okCount = results.filter((r) => r.ok).length;

  const reset = () => {
    setBrand("");
    setModel("");
    setYear("");
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
      {/* Form */}
      <div className="relative overflow-hidden rounded-[32px] bg-dark p-6 text-surface sm:p-8">
        <div aria-hidden="true" className="absolute -right-24 -top-24 size-64 rounded-full bg-brand/20 blur-3xl" />
        <div className="relative space-y-4">
          <Field step={1} label={t.brand} htmlFor={`${id}-brand`} done={!!brand}>
            <Select
              id={`${id}-brand`}
              value={brand}
              placeholder={t.brandPlaceholder}
              onChange={(v) => {
                setBrand(v);
                setModel("");
              }}
              options={brands.map((b) => ({ value: b, label: b }))}
            />
          </Field>
          <Field step={2} label={t.model} htmlFor={`${id}-model`} done={!!model}>
            <Select
              id={`${id}-model`}
              value={model}
              placeholder={t.modelPlaceholder}
              disabled={!brand}
              onChange={setModel}
              options={models.map((m) => ({ value: m.model, label: m.model }))}
            />
          </Field>
          <Field step={3} label={t.year} htmlFor={`${id}-year`} done={!!year}>
            <Select
              id={`${id}-year`}
              value={year}
              placeholder={t.yearPlaceholder}
              disabled={!model}
              onChange={setYear}
              options={years.map((v) => ({ value: String(v), label: String(v) }))}
            />
          </Field>
        </div>

        <div className="relative mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-dark-3 pt-5 text-sm">
          <a href={site.whatsapp.href} target="_blank" rel="noopener" className="inline-flex items-center gap-2 text-on-dark-muted transition hover:text-brand">
            <Icon name="message" className="size-4" />
            {t.notFound}
          </a>
          {(brand || model || year) && (
            <button type="button" onClick={reset} className="inline-flex items-center gap-1.5 font-semibold text-brand transition hover:text-brand-hover">
              <Icon name="rotate" className="size-4" />
              {t.reset}
            </button>
          )}
        </div>
      </div>

      {/* Result */}
      <div aria-live="polite" className="rounded-[32px] border border-line bg-surface p-6 sm:p-8">
        {!complete ? (
          <div className="flex h-full min-h-72 flex-col items-center justify-center rounded-3xl border-2 border-dashed border-line-soft px-6 py-10 text-center">
            <span className="flex size-16 items-center justify-center rounded-2xl bg-surface-2 text-faint">
              <Icon name="search" className="size-8" />
            </span>
            <p className="mt-5 font-display text-xl">{t.emptyTitle}</p>
            <p className="mt-2 max-w-sm text-muted">{t.emptyBody}</p>
            <div aria-hidden="true" className="mt-6 flex flex-wrap justify-center gap-2">
              {carClasses.map((c) => (
                <span key={c} className="rounded-full bg-surface-2 px-3 py-1 text-xs font-medium text-faint">
                  {names[c]}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div key={`${brand}-${model}-${year}`}>
            <div className="tariff-card-in flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-sm text-muted">
                  {brand} · {year}
                </p>
                <p className="font-display text-3xl leading-tight tracking-tight">{model}</p>
              </div>
              <span
                className={`rounded-full px-3.5 py-1.5 text-sm font-semibold ${
                  okCount ? "bg-up-soft text-up" : "bg-surface-2 text-muted"
                }`}
              >
                {fill(t.resultCount, { n: okCount, total: carClasses.length })}
              </span>
            </div>

            {/* progress bar */}
            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-surface-3">
              <div
                className="h-full rounded-full bg-brand transition-[width] duration-700 ease-out"
                style={{ width: `${(okCount / carClasses.length) * 100}%` }}
              />
            </div>

            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {results.map(({ c, from, ok }, i) => (
                <li
                  key={c}
                  style={{ animationDelay: `${80 + i * 60}ms` }}
                  className={`tariff-card-in flex items-center gap-3 rounded-2xl border p-3.5 ${
                    ok ? "border-brand bg-brand-tint" : "border-line-soft bg-surface-2"
                  }`}
                >
                  <span
                    className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${
                      ok ? "bg-brand text-ink" : "bg-surface text-faint ring-1 ring-line-soft"
                    }`}
                  >
                    <Icon name={iconFor(c)} className="size-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={`block font-semibold ${ok ? "text-ink" : "text-muted"}`}>{names[c]}</span>
                    <span className={`block text-xs ${ok ? "text-up" : "text-faint"}`}>
                      {ok ? t.available : from ? fill(t.fromYear, { year: from }) : t.notForModel}
                    </span>
                  </span>
                  <span
                    className={`flex size-7 shrink-0 items-center justify-center rounded-full ${
                      ok ? "bg-up text-surface" : "text-faint"
                    }`}
                  >
                    <Icon name={ok ? "check" : "lock"} className="size-3.5" strokeWidth={ok ? 3 : 2} />
                  </span>
                </li>
              ))}
            </ul>

            {okCount === 0 && (
              <div className="tariff-card-in mt-5 rounded-2xl bg-surface-2 p-4">
                <p className="font-semibold">{t.noneTitle}</p>
                <p className="mt-1 text-sm text-muted">{t.noneBody}</p>
              </div>
            )}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              {okCount ? (
                <Link
                  href={`/${lang}/register?${new URLSearchParams({ brand, model, year })}`}
                  className={resultButton}
                >
                  {t.register}
                  <Icon name="arrowUpRight" className="size-4 text-brand" />
                </Link>
              ) : (
                <a href={site.whatsapp.href} target="_blank" rel="noopener" className={resultButton}>
                  {t.askManager}
                  <Icon name="arrowUpRight" className="size-4 text-brand" />
                </a>
              )}
              {showTariffsLink && (
                <Link
                  href={`/${lang}/tariffs`}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-line px-6 font-semibold transition hover:border-ink-2"
                >
                  {t.allTariffs}
                  <Icon name="arrowRight" className="size-4" />
                </Link>
              )}
            </div>
          </div>
        )}
        <p className="mt-5 flex items-center gap-2 text-xs text-faint">
          <Icon name="info" className="size-3.5 shrink-0" />
          {t.demoNote}
        </p>
      </div>
    </div>
  );
}

function Field({
  step,
  label,
  htmlFor,
  done,
  children,
}: {
  step: number;
  label: string;
  htmlFor: string;
  done: boolean;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-2 flex items-center gap-2.5 text-sm font-semibold">
        <span
          className={`flex size-6 items-center justify-center rounded-full text-xs transition-colors duration-300 ${
            done ? "bg-brand text-ink" : "bg-dark-3 text-on-dark-muted"
          }`}
        >
          {done ? <Icon name="check" className="size-3.5" strokeWidth={3} /> : step}
        </span>
        {label}
      </label>
      {children}
    </div>
  );
}

function Select({
  id,
  value,
  placeholder,
  options,
  onChange,
  disabled = false,
}: {
  id: string;
  value: string;
  placeholder: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="relative">
      <select
        id={id}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={`h-14 w-full cursor-pointer appearance-none rounded-2xl border bg-dark-2 pl-4 pr-11 text-base font-medium transition focus:border-brand focus:outline-none disabled:cursor-not-allowed disabled:opacity-40 ${
          value ? "border-dark-3 text-surface" : "border-dark-3 text-on-dark-muted"
        } hover:enabled:border-faint`}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-surface text-ink">
            {o.label}
          </option>
        ))}
      </select>
      <Icon name="chevronDown" className="pointer-events-none absolute right-4 top-1/2 size-5 -translate-y-1/2 text-on-dark-muted" />
    </div>
  );
}
