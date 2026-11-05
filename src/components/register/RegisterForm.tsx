"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useRef, useState, type FormEvent, type ReactNode } from "react";
import type { Locale } from "@/i18n/config";
import type { RegisterDictionary } from "@/i18n/dictionaries/register-en";
import { fill } from "@/i18n/fill";
import { brands, carClasses, findCar, MAX_YEAR, MIN_YEAR, modelsFor, type CarClass } from "@/data/car-classes";
import { carColors } from "@/data/car-colors";
import { tariffs } from "@/data/tariffs";
import { site } from "@/config/site";
import {
  effectiveTariff,
  emptyRegistration,
  formatDateInput,
  getTariffState,
  toPayload,
  validateRegistration,
  type RegistrationField,
  type RegistrationValues,
  type TextField,
} from "@/lib/registration";
import { Icon } from "../Icon";
import { Combobox } from "./Combobox";

const years = Array.from({ length: MAX_YEAR - MIN_YEAR + 1 }, (_, i) => String(MAX_YEAR - i));

// Order used to move focus to the first problem on submit.
const fieldOrder: RegistrationField[] = [
  "user-name",
  "user-phone",
  "city",
  "license-series",
  "issue-date",
  "expiration-date",
  "car-make",
  "car-model",
  "car-year",
  "car-color",
  "vin-code",
  "car-number",
  "tariff",
  "consent",
];

const fieldId = (f: RegistrationField) => `reg-${f}`;
const errorId = (f: RegistrationField) => `reg-${f}-error`;
const inputClass = (invalid: boolean) =>
  `h-14 w-full rounded-2xl border bg-transparent px-4 text-base outline-none transition placeholder:text-faint focus:border-ink ${
    invalid ? "border-danger" : "border-line"
  }`;

/** Pre-fills the car when arriving from the "check your car" tool. */
function initialValues(params: { get(name: string): string | null }): RegistrationValues {
  const car = findCar(params.get("brand") ?? "", params.get("model") ?? "");
  if (!car) return emptyRegistration;
  const year = params.get("year") ?? "";
  return {
    ...emptyRegistration,
    "car-make": car.brand,
    "car-model": car.model,
    "car-year": years.includes(year) ? year : "",
  };
}

export function RegisterForm({
  t,
  names,
  lang,
}: {
  t: RegisterDictionary;
  names: Record<CarClass, string>;
  lang: Locale;
}) {
  const params = useSearchParams();
  const [values, setValues] = useState(() => initialValues(params));
  const [touched, setTouched] = useState<Partial<Record<RegistrationField, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendFailed, setSendFailed] = useState(false);
  const [done, setDone] = useState(false);
  // Stays the same across retries, so the receiver can spot a repeated submission.
  const requestId = useRef<string | null>(null);

  const state = getTariffState(values);
  const tariff = effectiveTariff(values, state);
  const errors = validateRegistration(values);

  const set = (field: TextField | "tariff", value: string) => setValues((v) => ({ ...v, [field]: value }));
  const touch = (field: RegistrationField) => setTouched((s) => ({ ...s, [field]: true }));

  const setBrand = (brand: string) =>
    setValues((v) => ({
      ...v,
      "car-make": brand,
      // A different brand means the entered model no longer applies; a case fix keeps it.
      "car-model": brand.trim().toLowerCase() === v["car-make"].trim().toLowerCase() ? v["car-model"] : "",
    }));

  const errorFor = (field: RegistrationField) => {
    const code = errors[field];
    if (!code || !(touched[field] || submitted)) return undefined;
    return fill(t.errors[code], { max: MAX_YEAR });
  };

  const props = (field: TextField) => {
    const error = errorFor(field);
    return {
      id: fieldId(field),
      "aria-invalid": error ? true : undefined,
      "aria-describedby": error ? errorId(field) : undefined,
      onBlur: () => touch(field),
      placeholder: t.fields[field].placeholder,
      value: values[field],
      className: inputClass(Boolean(error)),
    };
  };

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (sending) return;
    setSubmitted(true);
    setSendFailed(false);

    const first = fieldOrder.find((f) => errors[f]);
    if (first) {
      document.getElementById(fieldId(first))?.focus();
      return;
    }

    setSending(true);
    requestId.current ??= crypto.randomUUID();
    try {
      const response = await fetch("/api/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toPayload(values, requestId.current)),
      });
      if (!response.ok) throw new Error(String(response.status));
      setDone(true);
      window.scrollTo({ top: 0 });
    } catch {
      setSendFailed(true);
    } finally {
      setSending(false);
    }
  }

  if (done) {
    return (
      <div className="tariff-card-in mx-auto max-w-xl rounded-[32px] border border-line bg-surface p-8 text-center sm:p-12">
        <span className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-up text-surface">
          <Icon name="check" className="size-8" strokeWidth={3} />
        </span>
        <h2 ref={(el) => el?.focus()} tabIndex={-1} className="mt-6 text-3xl font-bold tracking-tight outline-none">
          {t.success.title}
        </h2>
        <p role="status" className="mt-3 leading-relaxed text-muted">
          {t.success.body}
        </p>
        <Link
          href={`/${lang}`}
          className="mt-8 inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-ink px-7 font-semibold text-surface transition hover:bg-dark-2"
        >
          {t.success.home}
          <Icon name="arrowRight" className="size-5 text-brand" />
        </Link>
      </div>
    );
  }

  const canChoose = state.status === "ready" && state.available.length > 0;
  const firstAvailable = state.status === "ready" ? state.available[0] : undefined;
  const carLabel = [values["car-make"], values["car-model"], values["car-year"]].filter((s) => s.trim()).join(" ");
  const color = carColors.find((c) => c.value === values["car-color"]);
  const brandModels = modelsFor(values["car-make"]).map((m) => m.model);

  return (
    <form noValidate onSubmit={handleSubmit} className="grid items-start gap-6 lg:grid-cols-[1fr_340px]">
      <fieldset disabled={sending} className="min-w-0 space-y-5">
        <Section n={1} title={t.sections.personal.title} hint={t.sections.personal.hint}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field field="user-name" t={t} error={errorFor("user-name")} required>
              <input
                {...props("user-name")}
                name="user-name"
                autoComplete="name"
                maxLength={120}
                aria-required
                onChange={(e) => set("user-name", e.target.value)}
              />
            </Field>
            <Field field="user-phone" t={t} error={errorFor("user-phone")} required>
              <input
                {...props("user-phone")}
                name="user-phone"
                type="tel"
                autoComplete="tel"
                maxLength={24}
                aria-required
                onChange={(e) => set("user-phone", e.target.value.replace(/[^\d+\s()-]/g, ""))}
              />
            </Field>
            <Field field="city" t={t} className="sm:col-span-2">
              <Combobox
                id={fieldId("city")}
                value={values.city}
                options={t.cities}
                placeholder={t.fields.city.placeholder}
                onChange={(v) => set("city", v.slice(0, 120))}
              />
            </Field>
          </div>
        </Section>

        <Section n={2} title={t.sections.licence.title} hint={t.sections.licence.hint} tag={t.optional}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field field="license-series" t={t} className="sm:col-span-2">
              <input
                {...props("license-series")}
                name="license-series"
                autoComplete="off"
                maxLength={24}
                onChange={(e) => set("license-series", e.target.value.toUpperCase())}
              />
            </Field>
            {(["issue-date", "expiration-date"] as const).map((f) => (
              <Field key={f} field={f} t={t} error={errorFor(f)}>
                <input
                  {...props(f)}
                  name={f}
                  inputMode="numeric"
                  autoComplete="off"
                  onChange={(e) => set(f, formatDateInput(e.target.value))}
                />
              </Field>
            ))}
          </div>
        </Section>

        <Section n={3} title={t.sections.car.title} hint={t.sections.car.hint}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field field="car-make" t={t}>
              <Combobox
                id={fieldId("car-make")}
                value={values["car-make"]}
                options={brands}
                placeholder={t.fields["car-make"].placeholder}
                onChange={(v) => setBrand(v.slice(0, 60))}
              />
            </Field>
            <Field field="car-model" t={t}>
              <Combobox
                id={fieldId("car-model")}
                value={values["car-model"]}
                options={brandModels}
                placeholder={t.fields["car-model"].placeholder}
                disabled={!values["car-make"].trim()}
                onChange={(v) => set("car-model", v.slice(0, 60))}
              />
            </Field>
            <Field field="car-year" t={t} error={errorFor("car-year")}>
              <Combobox
                id={fieldId("car-year")}
                value={values["car-year"]}
                options={years}
                inputMode="numeric"
                placeholder={t.fields["car-year"].placeholder}
                invalid={Boolean(errorFor("car-year"))}
                describedBy={errorFor("car-year") ? errorId("car-year") : undefined}
                onBlur={() => touch("car-year")}
                onChange={(v) => set("car-year", v.replace(/\D/g, "").slice(0, 4))}
              />
            </Field>
            <Field field="car-number" t={t}>
              <input
                {...props("car-number")}
                name="car-number"
                autoComplete="off"
                maxLength={16}
                onChange={(e) => set("car-number", e.target.value.toUpperCase())}
              />
            </Field>
            <Field field="vin-code" t={t} className="sm:col-span-2">
              {/* No 17-character check: cars imported from Japan often carry shorter frame numbers. */}
              <input
                {...props("vin-code")}
                name="vin-code"
                autoComplete="off"
                maxLength={30}
                onChange={(e) => set("vin-code", e.target.value.toUpperCase())}
              />
            </Field>
            <fieldset className="sm:col-span-2">
              <legend className="mb-2 text-sm font-semibold">{t.fields["car-color"].label}</legend>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                {carColors.map((c, i) => (
                  <label key={c.id} className="relative cursor-pointer">
                    <input
                      id={i === 0 ? fieldId("car-color") : undefined}
                      type="radio"
                      name="car-color"
                      value={c.value}
                      checked={values["car-color"] === c.value}
                      onChange={() => set("car-color", c.value)}
                      className="peer sr-only"
                    />
                    <span className="flex h-12 items-center gap-2.5 rounded-xl border border-line px-3 text-sm font-medium transition hover:border-ink-2 peer-checked:border-ink peer-checked:bg-brand-tint peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-focus">
                      <span className="size-5 shrink-0 rounded-full ring-1 ring-ink/20" style={{ backgroundColor: c.hex }} />
                      <span className="truncate">{t.colors[c.id]}</span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
        </Section>

        <Section n={4} title={t.sections.tariff.title} hint={t.sections.tariff.hint}>
          <div aria-live="polite">
            {state.status === "locked" && (
              <Notice icon="lock" title={t.tariff.lockedTitle}>
                {fill(t.tariff.missing, { fields: state.missing.map((f) => t.fields[f].label).join(", ") })}
              </Notice>
            )}
            {state.status === "unknown" && (
              <Notice icon="info" title={t.tariff.unknownTitle}>
                {t.tariff.unknownBody}
              </Notice>
            )}
            {state.status === "ready" && state.available.length === 0 && (
              <Notice icon="info" title={t.tariff.noneTitle}>
                {t.tariff.noneBody}
              </Notice>
            )}
          </div>

          <fieldset
            key={canChoose ? `${values["car-make"]}-${values["car-model"]}-${values["car-year"]}` : "locked"}
            className="mt-4 grid gap-3 sm:grid-cols-2"
            aria-label={t.sections.tariff.title}
            aria-describedby={errorFor("tariff") ? errorId("tariff") : undefined}
          >
            {carClasses.map((c, i) => {
              const result = state.status === "ready" ? state.results[i] : undefined;
              const selected = tariff === c;
              const icon = tariffs.find((x) => x.id === c)?.icon ?? "car";
              return (
                <label
                  key={c}
                  style={canChoose ? { animationDelay: `${i * 50}ms` } : undefined}
                  className={`relative ${canChoose ? "tariff-card-in" : ""} ${result?.ok ? "cursor-pointer" : "cursor-not-allowed"}`}
                >
                  <input
                    id={c === firstAvailable ? fieldId("tariff") : undefined}
                    type="radio"
                    name="tariff"
                    value={c}
                    disabled={!result?.ok}
                    checked={selected}
                    onChange={() => set("tariff", c)}
                    className="peer sr-only"
                  />
                  <span
                    className={`flex items-center gap-3 rounded-2xl border p-3.5 transition peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-focus ${
                      selected
                        ? "border-ink bg-brand-tint"
                        : result?.ok
                          ? "border-brand hover:bg-brand-tint"
                          : "border-line-soft bg-surface-2"
                    }`}
                  >
                    <span
                      className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${
                        result?.ok ? "bg-brand text-ink" : "bg-surface text-faint ring-1 ring-line-soft"
                      }`}
                    >
                      <Icon name={icon} className="size-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className={`block font-semibold ${result?.ok ? "text-ink" : "text-muted"}`}>{names[c]}</span>
                      {result && (
                        <span className={`block text-xs ${result.ok ? "text-up" : "text-muted"}`}>
                          {result.ok
                            ? t.tariff.available
                            : result.from
                              ? fill(t.tariff.fromYear, { year: result.from })
                              : t.tariff.notForModel}
                        </span>
                      )}
                    </span>
                    <span
                      className={`flex size-7 shrink-0 items-center justify-center rounded-full ${
                        selected
                          ? "bg-ink text-brand"
                          : result?.ok
                            ? "border-2 border-line"
                            : "text-faint"
                      }`}
                    >
                      {selected ? (
                        <Icon name="check" className="size-3.5" strokeWidth={3} />
                      ) : (
                        !result?.ok && <Icon name="lock" className="size-3.5" />
                      )}
                    </span>
                  </span>
                </label>
              );
            })}
          </fieldset>
          <ErrorText field="tariff" error={errorFor("tariff")} />
        </Section>

        <div className="rounded-[28px] border border-line bg-surface p-5 sm:p-7">
          <label className="flex cursor-pointer items-start gap-3">
            <input
              id={fieldId("consent")}
              type="checkbox"
              checked={values.consent}
              aria-invalid={errorFor("consent") ? true : undefined}
              aria-describedby={errorFor("consent") ? errorId("consent") : undefined}
              onChange={(e) => {
                setValues((v) => ({ ...v, consent: e.target.checked }));
                touch("consent");
              }}
              className="mt-0.5 size-5 shrink-0 accent-ink"
            />
            <span className="text-sm leading-relaxed text-ink-2">{t.consent}</span>
          </label>
          <ErrorText field="consent" error={errorFor("consent")} />

          {sendFailed && (
            <p role="alert" className="mt-4 rounded-2xl bg-danger-soft p-4 text-sm text-danger">
              {t.sendError}{" "}
              <a href={site.whatsapp.href} target="_blank" rel="noopener" className="font-semibold underline">
                {t.messageManager}
              </a>
            </p>
          )}

          <button
            type="submit"
            aria-busy={sending}
            className="mt-5 inline-flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-brand px-8 text-base font-semibold text-ink transition hover:bg-brand-hover active:bg-brand-press disabled:opacity-60 sm:w-auto"
          >
            {sending ? t.sending : t.submit}
            {!sending && <Icon name="arrowRight" className="size-5" />}
          </button>
        </div>
      </fieldset>

      <aside className="hidden rounded-[28px] bg-dark p-7 text-surface lg:sticky lg:top-24 lg:block">
        <p className="font-display text-xl">{t.summary.title}</p>
        <dl className="mt-6 space-y-5">
          <div>
            <dt className="text-sm text-on-dark-muted">{t.summary.car}</dt>
            <dd className="mt-1 flex items-center gap-2 font-semibold">
              {color && <span className="size-4 shrink-0 rounded-full ring-1 ring-surface/30" style={{ backgroundColor: color.hex }} />}
              {carLabel || <span className="font-normal text-on-dark-muted">{t.summary.carEmpty}</span>}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-on-dark-muted">{t.summary.tariff}</dt>
            <dd className="mt-1 font-semibold">
              {tariff ? (
                <span className="text-brand">{names[tariff as CarClass]}</span>
              ) : (
                <span className="font-normal text-on-dark-muted">{t.summary.tariffEmpty}</span>
              )}
            </dd>
          </div>
        </dl>
        <a
          href={site.whatsapp.href}
          target="_blank"
          rel="noopener"
          className="mt-6 flex items-center gap-2 border-t border-dark-3 pt-5 text-sm text-on-dark-muted transition hover:text-brand"
        >
          <Icon name="message" className="size-4 shrink-0" />
          {t.summary.help}
        </a>
      </aside>
    </form>
  );
}

function Section({
  n,
  title,
  hint,
  tag,
  children,
}: {
  n: number;
  title: string;
  hint: string;
  tag?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[28px] border border-line bg-surface p-5 sm:p-7">
      <div className="flex items-start gap-4">
        <span aria-hidden="true" className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-ink font-bold text-brand">
          {n}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight">{title}</h2>
            {tag && <span className="rounded-full bg-surface-2 px-2.5 py-0.5 text-xs font-medium text-muted">{tag}</span>}
          </div>
          <p className="mt-1 text-sm leading-relaxed text-muted">{hint}</p>
        </div>
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function Field({
  field,
  t,
  error,
  required = false,
  className = "",
  children,
}: {
  field: TextField;
  t: RegisterDictionary;
  error?: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={className}>
      <label htmlFor={fieldId(field)} className="mb-2 block text-sm font-semibold">
        {t.fields[field].label}
        {required && (
          <span aria-hidden="true" className="ml-1 text-danger">
            *
          </span>
        )}
      </label>
      {children}
      <ErrorText field={field} error={error} />
    </div>
  );
}

function ErrorText({ field, error }: { field: RegistrationField; error?: string }) {
  if (!error) return null;
  return (
    <p id={errorId(field)} className="mt-2 text-sm text-danger">
      {error}
    </p>
  );
}

function Notice({ icon, title, children }: { icon: "lock" | "info"; title: string; children: ReactNode }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-surface-2 p-4">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-surface text-muted ring-1 ring-line-soft">
        <Icon name={icon} className="size-4" />
      </span>
      <div>
        <p className="font-semibold">{title}</p>
        <p className="mt-0.5 text-sm text-muted">{children}</p>
      </div>
    </div>
  );
}
