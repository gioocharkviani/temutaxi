"use client";

import { useActionState, useState } from "react";
import { savePrivacyAction } from "@/app/admin/actions";
import type { PrivacyContent, PrivacyText } from "@/db/entities";
import { adminCard, adminInput, adminTextarea, primaryButton } from "./styles";

const LANGUAGES: { code: keyof PrivacyContent; label: string }[] = [
  { code: "ka", label: "ქართული" },
  { code: "en", label: "English" },
  { code: "ru", label: "Русский" },
];

export function PrivacyForm({ content }: { content: PrivacyContent }) {
  const [state, action, pending] = useActionState(savePrivacyAction, {});
  const [language, setLanguage] = useState<keyof PrivacyContent>("ka");
  const [values, setValues] = useState(content);
  const set = (lang: keyof PrivacyContent, field: keyof PrivacyText, value: string) =>
    setValues((v) => ({ ...v, [lang]: { ...v[lang], [field]: value } }));
  const error = (name: string) => state.errors?.[name];
  const languageHasError = (lang: string) => Object.keys(state.errors ?? {}).some((key) => key.startsWith(`${lang}.`));

  return (
    <form noValidate action={action} className={`${adminCard} space-y-5`}>
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

      {/* Every language stays in the form, so saving sends all three. */}
      {LANGUAGES.map(({ code }) => (
        <div key={code} hidden={language !== code} className="space-y-5">
          <label className="block text-sm font-semibold">
            სათაური
            <input name={`privacy.${code}.title`} value={values[code].title} onChange={(e) => set(code, "title", e.target.value)} className={`${adminInput} mt-2`} />
            {error(`${code}.title`) && <span className="mt-1 block font-normal text-danger">{error(`${code}.title`)}</span>}
          </label>
          <label className="block text-sm font-semibold">
            ტექსტი
            <textarea name={`privacy.${code}.body`} rows={22} value={values[code].body} onChange={(e) => set(code, "body", e.target.value)} className={`${adminTextarea} mt-2`} />
            <span className="mt-1 block text-xs font-normal text-muted">
              „# “ ხაზის დასაწყისში ქმნის სათაურს, „- “ ჩამონათვალს, ცარიელი ხაზი ახალ აბზაცს. {"{company}, {companyId}, {address}, {email}, {phone}"} ავტომატურად ჩაანაცვლებს კომპანიის მონაცემებით.
            </span>
            {error(`${code}.body`) && <span className="mt-1 block font-normal text-danger">{error(`${code}.body`)}</span>}
          </label>
        </div>
      ))}

      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" disabled={pending} className={primaryButton}>{pending ? "ინახება…" : "შენახვა"}</button>
        {state.saved && !pending && <p role="status" className="text-sm font-medium text-up">შენახულია. საიტზე მაშინვე აისახება.</p>}
        {state.errors && !pending && <p role="alert" className="text-sm font-medium text-danger">შეასწორეთ მონიშნული ველები.</p>}
      </div>
    </form>
  );
}
