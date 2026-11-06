"use client";

import { useActionState, useState, type ReactNode } from "react";
import { saveSettingsAction } from "@/app/admin/actions";
import type { NameDisplay, PeriodMode, RatingContent, RatingSettings, RatingText, SyncSchedule, TieBreak } from "@/db/entities";
import { RATING_CATEGORIES } from "@/lib/rating/settings-schema";
import { adminCard, adminInput, adminTextarea, primaryButton } from "./styles";

type FormSettings = Omit<RatingSettings, "updatedAt" | "id" | "hiddenDriverIds" | "content" | "lastSyncAt" | "syncPeriodKey" | "syncFrom" | "syncTo"> & { content: RatingContent };

const LANGUAGES: { code: keyof RatingContent; label: string }[] = [
  { code: "ka", label: "ქართული" },
  { code: "en", label: "English" },
  { code: "ru", label: "Русский" },
];

export function SettingsForm({ settings }: { settings: FormSettings }) {
  const [state, action, pending] = useActionState(saveSettingsAction, {});
  const [language, setLanguage] = useState<keyof RatingContent>("ka");
  const [values, setValues] = useState({
    ...settings,
    periodStart: settings.periodStart ?? "",
    periodEnd: settings.periodEnd ?? "",
    prizes: settings.prizes.join(", "),
  });
  const set = <K extends keyof typeof values>(key: K, value: (typeof values)[K]) =>
    setValues((v) => ({ ...v, [key]: value }));
  const error = (name: string) => state.errors?.[name];
  const setText = (lang: keyof RatingContent, field: keyof RatingText, value: string) =>
    set("content", { ...values.content, [lang]: { ...values.content[lang], [field]: value } });
  const languageHasError = (lang: string) => Object.keys(state.errors ?? {}).some((key) => key.startsWith(`content.${lang}.`));

  return (
    <form noValidate action={action} className={`${adminCard} space-y-7`}>
      <label className="flex items-center justify-between gap-4 rounded-2xl bg-surface-2 p-4">
        <span>
          <span className="block font-semibold">რეიტინგი საიტზე</span>
          <span className="block text-sm text-muted">გამორთვისას საიტზე აღარ ჩანს აღარც მთავარი გვერდის სექცია და აღარც რეიტინგის გვერდი.</span>
        </span>
        <input
          type="checkbox"
          name="enabled"
          checked={values.enabled}
          onChange={(e) => set("enabled", e.target.checked)}
          className="size-6 shrink-0 accent-ink"
        />
      </label>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="რამდენი მძღოლი ჩანდეს მთავარ გვერდზე" hint="0-ის შემთხვევაში ჩანს მხოლოდ პირობები." error={error("landingCount")}>
          <input name="landingCount" type="number" min={0} max={50} value={values.landingCount} onChange={(e) => set("landingCount", Number(e.target.value))} className={adminInput} />
        </Field>
        <Field label="რამდენი მძღოლი ჩანდეს რეიტინგის გვერდზე" hint="დანარჩენები თავიანთ ადგილს ძიებით იპოვიან." error={error("pageCount")}>
          <input name="pageCount" type="number" min={1} max={100} value={values.pageCount} onChange={(e) => set("pageCount", Number(e.target.value))} className={adminInput} />
        </Field>
        <Field label="რიგითობა თანაბარი შეკვეთებისას" hint="ყოველთვის წინაა ის, ვისაც მეტი შეკვეთა აქვს." error={error("tieBreak")}>
          <select name="tieBreak" value={values.tieBreak} onChange={(e) => set("tieBreak", e.target.value as TieBreak)} className={adminInput}>
            <option value="first">წინ ის, ვინც ეს რაოდენობა პირველმა შეაგროვა</option>
            <option value="last">წინ ის, ვინც ბოლო შეკვეთა უფრო გვიან შეასრულა</option>
          </select>
        </Field>
        <Field label="რეიტინგის განახლების განრიგი" hint="განახლება Yandex-იდან წამოიღებს მონაცემებს და ბაზაში შეინახავს." error={error("syncSchedule")}>
          <select name="syncSchedule" value={values.syncSchedule} onChange={(e) => set("syncSchedule", e.target.value as SyncSchedule)} className={adminInput}>
            <option value="hourly">ყოველ საათში</option>
            <option value="daily">დღეში ერთხელ, ღამის 12 საათზე</option>
          </select>
        </Field>
        <Field label="მინიმალური შეკვეთები რეიტინგში მოსახვედრად" error={error("minOrders")}>
          <input name="minOrders" type="number" min={1} value={values.minOrders} onChange={(e) => set("minOrders", Number(e.target.value))} className={adminInput} />
        </Field>
      </div>

      <fieldset>
        <legend className="text-sm font-semibold">პირობები და წესები</legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {LANGUAGES.map(({ code, label }) => (
            <button
              key={code}
              type="button"
              aria-pressed={language === code}
              onClick={() => setLanguage(code)}
              className={`h-9 rounded-lg px-3 text-sm font-semibold transition ${language === code ? "bg-ink text-surface" : "border border-line hover:border-ink-2"}`}
            >
              {label}
              {languageHasError(code) && <span className="ml-1.5 text-danger">●</span>}
            </button>
          ))}
        </div>
        {/* Every language stays in the form, so saving sends all three. */}
        {LANGUAGES.map(({ code }) => (
          <div key={code} hidden={language !== code} className="mt-4 space-y-5">
            <Field label="მთავარი გვერდი: სათაური" error={error(`content.${code}.landingTitle`)}>
              <input name={`content.${code}.landingTitle`} value={values.content[code].landingTitle} onChange={(e) => setText(code, "landingTitle", e.target.value)} className={adminInput} />
            </Field>
            <Field label="მთავარი გვერდი: მოკლე პირობები" error={error(`content.${code}.landingText`)}>
              <textarea name={`content.${code}.landingText`} rows={3} value={values.content[code].landingText} onChange={(e) => setText(code, "landingText", e.target.value)} className={adminTextarea} />
            </Field>
            <Field label="რეიტინგის გვერდი: სათაური" error={error(`content.${code}.pageTitle`)}>
              <input name={`content.${code}.pageTitle`} value={values.content[code].pageTitle} onChange={(e) => setText(code, "pageTitle", e.target.value)} className={adminInput} />
            </Field>
            <Field
              label="რეიტინგის გვერდი: სრული წესები და პირობები"
              hint="„# “ ხაზის დასაწყისში ქმნის სათაურს, „- “ ჩამონათვალს, ცარიელი ხაზი ახალ აბზაცს."
              error={error(`content.${code}.rules`)}
            >
              <textarea name={`content.${code}.rules`} rows={14} value={values.content[code].rules} onChange={(e) => setText(code, "rules", e.target.value)} className={adminTextarea} />
            </Field>
          </div>
        ))}
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold">პერიოდი</legend>
        <div className="flex flex-wrap gap-4 text-sm">
          {(
            [
              ["rolling", "ბოლო N დღე (ავტომატურად მოძრაობს)"],
              ["fixed", "კონკრეტული თარიღები"],
            ] as [PeriodMode, string][]
          ).map(([mode, label]) => (
            <label key={mode} className="flex items-center gap-2">
              <input type="radio" name="periodMode" value={mode} checked={values.periodMode === mode} onChange={() => set("periodMode", mode)} className="accent-ink" />
              {label}
            </label>
          ))}
        </div>
        {values.periodMode === "rolling" ? (
          <Field label="დღეების რაოდენობა (მაგალითად, 2 კვირა = 14)" error={error("rollingDays")}>
            <input name="rollingDays" type="number" min={1} max={365} value={values.rollingDays} onChange={(e) => set("rollingDays", Number(e.target.value))} className={`${adminInput} sm:max-w-40`} />
          </Field>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2">
            <input type="hidden" name="rollingDays" value={values.rollingDays} />
            <Field label="დაწყება (თბილისის დროით)" error={error("periodStart")}>
              <input name="periodStart" type="date" value={values.periodStart} onChange={(e) => set("periodStart", e.target.value)} className={adminInput} />
            </Field>
            <Field label="დასასრული (ეს დღეც ჩათვლით)" error={error("periodEnd")}>
              <input name="periodEnd" type="date" value={values.periodEnd} onChange={(e) => set("periodEnd", e.target.value)} className={adminInput} />
            </Field>
          </div>
        )}
        {values.periodMode === "rolling" && (
          <>
            <input type="hidden" name="periodStart" value={values.periodStart} />
            <input type="hidden" name="periodEnd" value={values.periodEnd} />
          </>
        )}
      </fieldset>

      <fieldset>
        <legend className="text-sm font-semibold">რომელი ტარიფების შეკვეთები ითვლება</legend>
        <p className="mt-1 text-xs text-muted">Yandex-ის კოდების მიხედვით. მიტანა აქ არ არის, ის რეიტინგში არასდროს ჩაითვლება.</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {RATING_CATEGORIES.map((c) => (
            <label key={c.code} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="categories"
                value={c.code}
                checked={values.categories.includes(c.code)}
                onChange={(e) =>
                  set("categories", e.target.checked ? [...values.categories, c.code] : values.categories.filter((x) => x !== c.code))
                }
                className="accent-ink"
              />
              {c.label}
            </label>
          ))}
        </div>
        {error("categories") && <p className="mt-2 text-sm text-danger">{error("categories")}</p>}
      </fieldset>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="როგორ ჩანდეს სახელი საიტზე" error={error("nameDisplay")}>
          <select name="nameDisplay" value={values.nameDisplay} onChange={(e) => set("nameDisplay", e.target.value as NameDisplay)} className={adminInput}>
            <option value="short">სახელი და გვარის პირველი ასო (რეკომენდებული)</option>
            <option value="first">მხოლოდ სახელი</option>
            <option value="full">სრული სახელი და გვარი</option>
          </select>
        </Field>
        <div className="space-y-3 self-end text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" name="showScores" checked={values.showScores} onChange={(e) => set("showScores", e.target.checked)} className="accent-ink" />
            შეკვეთების რაოდენობის ჩვენება
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" name="showPrizes" checked={values.showPrizes} onChange={(e) => set("showPrizes", e.target.checked)} className="accent-ink" />
            პრიზების ჩვენება
          </label>
        </div>
      </div>

      <Field label="პრიზები ადგილების მიხედვით, ლარში" hint="1-ლი ადგილიდან დაწყებული, მძიმით: 500, 300, 200" error={error("prizes")}>
        <input name="prizes" value={values.prizes} onChange={(e) => set("prizes", e.target.value)} className={adminInput} />
      </Field>

      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" disabled={pending} className={primaryButton}>
          {pending ? "ინახება…" : "შენახვა"}
        </button>
        {state.saved && !pending && (
          <p role="status" className="text-sm font-medium text-up">
            შენახულია. საიტზე მაშინვე აისახება.
          </p>
        )}
        {state.errors && !pending && (
          <p role="alert" className="text-sm font-medium text-danger">
            შეასწორეთ მონიშნული ველები.
          </p>
        )}
      </div>
    </form>
  );
}

function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: ReactNode }) {
  return (
    <label className="block text-sm font-semibold">
      {label}
      <span className="mt-2 block">{children}</span>
      {hint && <span className="mt-1 block text-xs font-normal text-muted">{hint}</span>}
      {error && <span className="mt-1 block text-sm font-normal text-danger">{error}</span>}
    </label>
  );
}
