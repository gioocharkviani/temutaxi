"use client";

import { useSearchParams } from "next/navigation";
import { useMemo, useRef, useState, type FormEvent } from "react";
import type { Locale } from "@/i18n/config";
import type { RegisterDictionary } from "@/i18n/dictionaries/register-en";
import { fill } from "@/i18n/fill";
import { brandsOf, findCar, MAX_YEAR, MIN_YEAR, modelsFor, type CarClass, type CarModel } from "@/data/car-classes";
import { site } from "@/config/site";
import {
  effectiveTariff,
  emptyRegistration,
  formatDateInput,
  getTariffState,
  toPayload,
  type RegistrationField,
  type RegistrationValues,
  type TextField,
} from "@/lib/registration";
import { validateRegistration } from "@/lib/registration-schema";
import { Icon } from "../Icon";
import { ApplicationSummary } from "./ApplicationSummary";
import { ColorPicker } from "./ColorPicker";
import { Combobox } from "./Combobox";
import { errorId, ErrorText, Field, fieldId, Section } from "./parts";
import { SuccessMessage } from "./SuccessMessage";
import { TariffPicker } from "./TariffPicker";

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

const inputClass = (invalid: boolean) =>
  `h-14 w-full rounded-2xl border bg-transparent px-4 text-base outline-none transition placeholder:text-faint focus:border-ink ${
    invalid ? "border-danger" : "border-line"
  }`;

/** Pre-fills the car when arriving from the "check your car" tool. */
function initialValues(params: { get(name: string): string | null }, cars: CarModel[]): RegistrationValues {
  const car = findCar(cars, params.get("brand") ?? "", params.get("model") ?? "");
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
  cars,
}: {
  t: RegisterDictionary;
  names: Record<CarClass, string>;
  lang: Locale;
  /** Read from the database on the server and delivered with the page. */
  cars: CarModel[];
}) {
  const params = useSearchParams();
  const [values, setValues] = useState(() => initialValues(params, cars));
  const [touched, setTouched] = useState<Partial<Record<RegistrationField, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendFailed, setSendFailed] = useState(false);
  const [done, setDone] = useState(false);
  // Stays the same across retries, so the receiver can spot a repeated submission.
  const requestId = useRef<string | null>(null);

  const brands = useMemo(() => brandsOf(cars), [cars]);
  const state = getTariffState(values, cars);
  const tariff = effectiveTariff(values, state);
  const errors = validateRegistration(values, cars);

  const set = (field: TextField | "tariff", value: string) => setValues((v) => ({ ...v, [field]: value }));
  const touch = (field: RegistrationField) => setTouched((s) => ({ ...s, [field]: true }));

  const setBrand = (brand: string) =>
    setValues((v) => ({
      ...v,
      "car-make": brand,
      // A different brand means the entered model no longer applies; a case fix keeps it.
      "car-model": brand.trim().toLowerCase() === v["car-make"].trim().toLowerCase() ? v["car-model"] : "",
    }));

  /** The translated error to show, once the field was left or the form submitted. */
  const errorFor = (field: RegistrationField) => {
    const code = errors[field];
    if (!code || !(touched[field] || submitted)) return undefined;
    return fill(t.errors[code], { max: MAX_YEAR });
  };

  /** The props every plain text input shares. */
  const inputProps = (field: TextField) => {
    const error = errorFor(field);
    return {
      id: fieldId(field),
      name: field,
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
      const response = await fetch("/api/contractor/registration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toPayload(values, tariff, requestId.current)),
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

  if (done) return <SuccessMessage t={t} lang={lang} />;

  return (
    <form noValidate onSubmit={handleSubmit} className="grid items-start gap-6 lg:grid-cols-[1fr_340px]">
      <fieldset disabled={sending} className="min-w-0 space-y-5">
        <Section n={1} title={t.sections.personal.title} hint={t.sections.personal.hint}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field field="user-name" t={t} error={errorFor("user-name")} required>
              <input
                {...inputProps("user-name")}
                autoComplete="name"
                maxLength={120}
                aria-required
                onChange={(e) => set("user-name", e.target.value)}
              />
            </Field>
            <Field field="user-phone" t={t} error={errorFor("user-phone")} required>
              <input
                {...inputProps("user-phone")}
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

        <Section n={2} title={t.sections.licence.title} hint={t.sections.licence.hint}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field field="license-series" t={t} error={errorFor("license-series")} required className="sm:col-span-2">
              <input
                {...inputProps("license-series")}
                autoComplete="off"
                maxLength={24}
                aria-required
                onChange={(e) => set("license-series", e.target.value.toUpperCase())}
              />
            </Field>
            {(["issue-date", "expiration-date"] as const).map((f) => (
              <Field key={f} field={f} t={t} error={errorFor(f)} required>
                <input
                  {...inputProps(f)}
                  inputMode="numeric"
                  autoComplete="off"
                  aria-required
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
                options={modelsFor(cars, values["car-make"]).map((m) => m.model)}
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
                {...inputProps("car-number")}
                autoComplete="off"
                maxLength={16}
                onChange={(e) => set("car-number", e.target.value.toUpperCase())}
              />
            </Field>
            <Field field="vin-code" t={t} className="sm:col-span-2">
              {/* No 17-character check: cars imported from Japan often carry shorter frame numbers. */}
              <input
                {...inputProps("vin-code")}
                autoComplete="off"
                maxLength={30}
                onChange={(e) => set("vin-code", e.target.value.toUpperCase())}
              />
            </Field>
            <ColorPicker t={t} value={values["car-color"]} onChange={(v) => set("car-color", v)} />
          </div>
        </Section>

        <Section n={4} title={t.sections.tariff.title} hint={t.sections.tariff.hint}>
          <TariffPicker
            t={t}
            names={names}
            state={state}
            selected={tariff}
            carKey={`${values["car-make"]}-${values["car-model"]}-${values["car-year"]}`}
            error={errorFor("tariff")}
            onChange={(c) => set("tariff", c)}
          />
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
            <span className="text-sm leading-relaxed text-ink-2">
              {t.consent}{" "}
              <a href={`/${lang}/privacy`} target="_blank" rel="noopener" className="font-semibold underline underline-offset-2">
                {t.consentLink}
              </a>
            </span>
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

      <ApplicationSummary t={t} names={names} values={values} tariff={tariff} />
    </form>
  );
}
