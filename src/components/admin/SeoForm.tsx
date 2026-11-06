"use client";

import { useActionState, useState } from "react";
import { saveSeoAction } from "@/app/admin/actions";
import type { SeoPageKey, SeoSettings, SeoText } from "@/db/entities";
import { adminCard, adminInput, adminTextarea, primaryButton } from "./styles";

type Lang = "ka" | "en" | "ru";

const LANGUAGES: { code: Lang; label: string }[] = [
  { code: "ka", label: "ქართული" },
  { code: "en", label: "English" },
  { code: "ru", label: "Русский" },
];

const PAGES: { key: SeoPageKey; label: string }[] = [
  { key: "home", label: "მთავარი გვერდი" },
  { key: "register", label: "რეგისტრაცია" },
  { key: "tariffs", label: "ტარიფები" },
  { key: "rating", label: "რეიტინგი" },
  { key: "privacy", label: "Privacy Policy" },
];

const TITLE_LIMIT = 60;
const DESCRIPTION_LIMIT = 160;

export function SeoForm({ seo }: { seo: SeoSettings }) {
  const [state, action, pending] = useActionState(saveSeoAction, {});
  const [language, setLanguage] = useState<Lang>("ka");
  const [values, setValues] = useState(seo);
  const set = <K extends keyof SeoSettings>(key: K, value: SeoSettings[K]) => setValues((v) => ({ ...v, [key]: value }));
  const setText = (page: SeoPageKey, lang: Lang, field: keyof SeoText, value: string) =>
    setValues((v) => ({ ...v, pages: { ...v.pages, [page]: { ...v.pages[page], [lang]: { ...v.pages[page][lang], [field]: value } } } }));
  const error = (name: string) => state.errors?.[name];
  const languageHasError = (lang: string) => Object.keys(state.errors ?? {}).some((key) => key.startsWith("pages.") && key.includes(`.${lang}.`));

  return (
    <form noValidate action={action} className="space-y-6">
      <div className={`${adminCard} space-y-5`}>
        <h2 className="text-lg font-bold">საიტი</h2>
        <label className="flex items-center justify-between gap-4 rounded-2xl bg-surface-2 p-4">
          <span>
            <span className="block font-semibold">საძიებო სისტემებში გამოჩენა</span>
            <span className="block text-sm text-muted">გამორთვისას მთელი საიტი იღებს noindex-ს და sitemap ცარიელდება.</span>
          </span>
          <input type="checkbox" name="indexing" checked={values.indexing} onChange={(e) => set("indexing", e.target.checked)} className="size-6 shrink-0 accent-ink" />
        </label>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="საიტის მისამართი" hint="საბოლოო დომენი, ბოლოში / -ის გარეშე." error={error("siteUrl")}>
            <input name="siteUrl" value={values.siteUrl} onChange={(e) => set("siteUrl", e.target.value)} className={adminInput} />
          </Field>
          <Field label="საიტის სახელი" error={error("siteName")}>
            <input name="siteName" value={values.siteName} onChange={(e) => set("siteName", e.target.value)} className={adminInput} />
          </Field>
          <Field label="გაზიარების სურათი (სურვილისამებრ)" hint="ცარიელი: თითო ენის მზა სურათი. ზომა: 1200×630." error={error("ogImage")}>
            <input name="ogImage" value={values.ogImage} onChange={(e) => set("ogImage", e.target.value)} className={adminInput} />
          </Field>
        </div>
      </div>

      <div className={`${adminCard} space-y-5`}>
        <div>
          <h2 className="text-lg font-bold">საიტის დადასტურება</h2>
          <p className="mt-1 text-sm text-muted">ჩასვით კოდი ან სრული meta ტეგი, რომელსაც სერვისი გაჩვენებთ.</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-3">
          <Field label="Google Search Console" error={error("googleVerification")}>
            <input name="googleVerification" value={values.googleVerification} onChange={(e) => set("googleVerification", e.target.value)} className={adminInput} />
          </Field>
          <Field label="Bing Webmaster" error={error("bingVerification")}>
            <input name="bingVerification" value={values.bingVerification} onChange={(e) => set("bingVerification", e.target.value)} className={adminInput} />
          </Field>
          <Field label="Yandex Webmaster" error={error("yandexVerification")}>
            <input name="yandexVerification" value={values.yandexVerification} onChange={(e) => set("yandexVerification", e.target.value)} className={adminInput} />
          </Field>
        </div>
      </div>

      <div className={`${adminCard} space-y-6`}>
        <div>
          <h2 className="text-lg font-bold">გვერდების სათაურები და აღწერები</h2>
          <p className="mt-1 text-sm text-muted">Google-ის შედეგში ჩვეულებრივ ჩანს სათაურის დაახლოებით {TITLE_LIMIT} და აღწერის {DESCRIPTION_LIMIT} სიმბოლო. Google-ს შეუძლია ტექსტი თავად შეცვალოს.</p>
        </div>
        <div className="flex flex-wrap gap-2">
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

        {PAGES.map(({ key, label }) => (
          <fieldset key={key} className="space-y-4 border-t border-line-soft pt-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <legend className="font-semibold">{label}</legend>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="hiddenPages"
                  value={key}
                  checked={values.hiddenPages.includes(key)}
                  onChange={(e) => set("hiddenPages", e.target.checked ? [...values.hiddenPages, key] : values.hiddenPages.filter((p) => p !== key))}
                  className="accent-ink"
                />
                Google-ისგან დამალვა (noindex)
              </label>
            </div>
            {/* Every language stays in the form, so saving sends all three. */}
            {LANGUAGES.map(({ code }) => {
              const text = values.pages[key][code];
              return (
                <div key={code} hidden={language !== code} className="space-y-4">
                  <Field label={`სათაური (${text.title.length} / ${TITLE_LIMIT})`} error={error(`pages.${key}.${code}.title`)}>
                    <input name={`pages.${key}.${code}.title`} value={text.title} onChange={(e) => setText(key, code, "title", e.target.value)} className={adminInput} />
                  </Field>
                  <Field label={`აღწერა (${text.description.length} / ${DESCRIPTION_LIMIT})`} error={error(`pages.${key}.${code}.description`)}>
                    <textarea name={`pages.${key}.${code}.description`} rows={3} value={text.description} onChange={(e) => setText(key, code, "description", e.target.value)} className={adminTextarea} />
                  </Field>
                </div>
              );
            })}
          </fieldset>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" disabled={pending} className={primaryButton}>{pending ? "ინახება…" : "შენახვა"}</button>
        {state.saved && !pending && <p role="status" className="text-sm font-medium text-up">შენახულია. საიტზე მაშინვე აისახება, Google-ში კი მომდევნო შემოვლისას.</p>}
        {state.errors && !pending && <p role="alert" className="text-sm font-medium text-danger">შეასწორეთ მონიშნული ველები.</p>}
      </div>
    </form>
  );
}

function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm font-semibold">
      {label}
      <span className="mt-2 block">{children}</span>
      {hint && <span className="mt-1 block text-xs font-normal text-muted">{hint}</span>}
      {error && <span className="mt-1 block text-sm font-normal text-danger">{error}</span>}
    </label>
  );
}
