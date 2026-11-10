"use client";

import Link from "next/link";
import { useActionState, useState, type ReactNode } from "react";
import { savePromotionAction } from "@/app/admin/actions";
import type { PromotionColors, PromotionText, PromotionTheme } from "@/db/entities";
import { Icon, ICON_NAMES, type IconName } from "@/components/Icon";
import { PromoBannerView, PromoBarView, PromoModalCard, CloseButton } from "@/components/promo/PromoView";
import { COLOR_PRESETS, PROMOTION_THEMES, PROMOTION_TYPES, type PromotionTypeId } from "@/lib/promotion-schema";
import { adminCard, adminInput, adminTextarea, primaryButton, secondaryButton } from "./styles";

type Lang = "ka" | "en" | "ru";

export type PromotionFormValues = {
  id: number | null;
  name: string;
  type: PromotionTypeId;
  theme: PromotionTheme;
  enabled: boolean;
  priority: number;
  startsAt: string;
  endsAt: string;
  colors: PromotionColors;
  icon: string;
  link: string;
  newTab: boolean;
  showApps: boolean;
  content: Record<Lang, PromotionText>;
  repeat: "session" | "hours";
  repeatHours: number;
};

const LANGUAGES: { code: Lang; label: string }[] = [
  { code: "ka", label: "ქართული" },
  { code: "en", label: "English" },
  { code: "ru", label: "Русский" },
];

const PREVIEW_APPS = { appStore: "ჩამოტვირთეთ", googlePlay: "ჩამოტვირთეთ" };

const COLOR_FIELDS: { key: keyof PromotionColors; label: string }[] = [
  { key: "background", label: "ფონი" },
  { key: "text", label: "ტექსტი" },
  { key: "button", label: "ღილაკი და იკონი" },
  { key: "buttonText", label: "ღილაკის ტექსტი" },
];

export function PromotionForm({ initial }: { initial: PromotionFormValues }) {
  const [state, action, pending] = useActionState(savePromotionAction, {});
  const [v, setValues] = useState(initial);
  const [language, setLanguage] = useState<Lang>("ka");
  const set = <K extends keyof PromotionFormValues>(key: K, value: PromotionFormValues[K]) => setValues((old) => ({ ...old, [key]: value }));
  const setText = (lang: Lang, field: keyof PromotionText, value: string) =>
    setValues((old) => ({ ...old, content: { ...old.content, [lang]: { ...old.content[lang], [field]: value } } }));
  const error = (name: string) => state.errors?.[name];
  const languageHasError = (lang: string) => Object.keys(state.errors ?? {}).some((k) => k.startsWith(`content.${lang}.`));

  // The preview shows the language being edited, falling back to Georgian like the site does.
  const pick = (field: keyof PromotionText) => v.content[language][field] || v.content.ka[field];
  const preview = {
    theme: v.theme,
    colors: v.colors,
    icon: v.icon || null,
    title: pick("title") || "სათაური",
    body: pick("body"),
    buttonText: pick("buttonText"),
    link: v.link || (pick("buttonText") ? "#" : null),
    newTab: false,
    showApps: v.showApps,
  };

  return (
    <form noValidate action={action} className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
      <input type="hidden" name="id" value={v.id ?? "new"} />
      <div className="min-w-0 space-y-6">
        <section className={`${adminCard} space-y-5`}>
          <label className="flex items-center justify-between gap-4 rounded-2xl bg-surface-2 p-4">
            <span>
              <span className="block font-semibold">ჩართულია</span>
              <span className="block text-sm text-muted">გამორთული პრომოუშენი საიტზე არ ჩანს, მაგრამ ინახება.</span>
            </span>
            <input type="checkbox" name="enabled" checked={v.enabled} onChange={(e) => set("enabled", e.target.checked)} className="size-6 shrink-0 accent-ink" />
          </label>
          <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_160px]">
            <Field label="სახელი (ჩანს მხოლოდ ადმინში)" error={error("name")}>
              <input name="name" value={v.name} onChange={(e) => set("name", e.target.value)} className={adminInput} />
            </Field>
            <Field label="რიგითობა" hint="მეტი = უფრო წინ" error={error("priority")}>
              <input name="priority" type="number" value={v.priority} onChange={(e) => set("priority", Number(e.target.value))} className={adminInput} />
            </Field>
          </div>
          <fieldset>
            <legend className="text-sm font-semibold">ტიპი</legend>
            <div className="mt-3 grid gap-3 md:grid-cols-3">
              {PROMOTION_TYPES.map((t) => (
                <Choice key={t.id} name="type" value={t.id} checked={v.type === t.id} onChange={() => set("type", t.id)} title={t.label} hint={t.hint} />
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend className="text-sm font-semibold">თემა</legend>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 md:grid-cols-4">
              {PROMOTION_THEMES.map((t) => (
                <Choice key={t.id} name="theme" value={t.id} checked={v.theme === t.id} onChange={() => set("theme", t.id)} title={t.label} hint={t.hint} />
              ))}
            </div>
          </fieldset>
        </section>

        <section className={`${adminCard} space-y-5`}>
          <h2 className="text-lg font-bold">ფერები</h2>
          <div className="flex flex-wrap gap-2">
            {COLOR_PRESETS.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => set("colors", preset.colors)}
                className="inline-flex h-9 items-center gap-2 rounded-lg border border-line px-3 text-xs font-semibold transition hover:border-ink-2"
              >
                <span aria-hidden="true" className="flex">
                  <span className="size-4 rounded-l-full border border-line" style={{ background: preset.colors.background }} />
                  <span className="size-4 rounded-r-full border border-line" style={{ background: preset.colors.button }} />
                </span>
                {preset.name}
              </button>
            ))}
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {COLOR_FIELDS.map(({ key, label }) => (
              <Field key={key} label={label} error={error(`colors.${key}`)}>
                <span className="flex items-center gap-2">
                  <input
                    type="color"
                    aria-label={label}
                    value={/^#[0-9a-fA-F]{6}$/.test(v.colors[key]) ? v.colors[key] : "#000000"}
                    onChange={(e) => set("colors", { ...v.colors, [key]: e.target.value })}
                    className="h-11 w-12 shrink-0 cursor-pointer rounded-xl border border-line bg-surface p-1"
                  />
                  <input name={`colors.${key}`} value={v.colors[key]} onChange={(e) => set("colors", { ...v.colors, [key]: e.target.value })} className={`${adminInput} font-mono`} />
                </span>
              </Field>
            ))}
          </div>
        </section>

        <section className={`${adminCard} space-y-5`}>
          <h2 className="text-lg font-bold">ტექსტი</h2>
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
          <p className="text-xs text-muted">ინგლისური ან რუსული ველი ცარიელი თუ დარჩა, საიტზე ქართული ტექსტი გამოჩნდება.</p>
          {/* Every language stays in the form, so saving sends all three. */}
          {LANGUAGES.map(({ code }) => (
            <div key={code} hidden={language !== code} className="space-y-4">
              <Field label="სათაური" error={error(`content.${code}.title`)}>
                <input name={`content.${code}.title`} value={v.content[code].title} onChange={(e) => setText(code, "title", e.target.value)} className={adminInput} />
              </Field>
              <Field label="ტექსტი (სურვილისამებრ)" error={error(`content.${code}.body`)}>
                <textarea name={`content.${code}.body`} rows={3} value={v.content[code].body} onChange={(e) => setText(code, "body", e.target.value)} className={adminTextarea} />
              </Field>
              <Field label="ღილაკის ტექსტი (სურვილისამებრ)" error={error(`content.${code}.buttonText`)}>
                <input name={`content.${code}.buttonText`} value={v.content[code].buttonText} onChange={(e) => setText(code, "buttonText", e.target.value)} className={adminInput} />
              </Field>
            </div>
          ))}
          <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
            <Field label="ღილაკის ბმული" hint="საიტის გვერდი (/register, /tariffs) ან სრული მისამართი (https://…). საიტის გვერდს ენა თავისით ემატება." error={error("link")}>
              <input name="link" value={v.link} onChange={(e) => set("link", e.target.value)} placeholder="/register" className={adminInput} />
            </Field>
            <label className="flex h-11 items-center gap-2 text-sm">
              <input type="checkbox" name="newTab" checked={v.newTab} onChange={(e) => set("newTab", e.target.checked)} className="accent-ink" />
              ახალ ჩანართში
            </label>
          </div>
        </section>

        <section className={`${adminCard} space-y-3`}>
          <label className="flex items-center justify-between gap-4 rounded-2xl bg-surface-2 p-4">
            <span>
              <span className="block font-semibold">App Store და Google Play ღილაკები</span>
              <span className="block text-sm text-muted">Yandex Pro-ს ჩამოტვირთვის ორი ღილაკი, ღილაკის ფერებში. ჩართვისას ზემოთ მითითებული ერთი ღილაკი აღარ ჩანს.</span>
            </span>
            <input type="checkbox" name="showApps" checked={v.showApps} onChange={(e) => set("showApps", e.target.checked)} className="size-6 shrink-0 accent-ink" />
          </label>
        </section>

        <section className={`${adminCard} space-y-5`}>
          <h2 className="text-lg font-bold">იკონი</h2>
          <div className="flex flex-wrap gap-2">
            <IconChoice selected={!v.icon} onClick={() => set("icon", "")} label="იკონის გარეშე">
              <span className="text-xs font-semibold">—</span>
            </IconChoice>
            {ICON_NAMES.map((name) => (
              <IconChoice key={name} selected={v.icon === name} onClick={() => set("icon", name)} label={name}>
                <Icon name={name as IconName} className="size-5" />
              </IconChoice>
            ))}
          </div>
          <input type="hidden" name="icon" value={v.icon} />
          {error("icon") && <p className="text-sm text-danger">{error("icon")}</p>}
        </section>

        <section className={`${adminCard} space-y-5`}>
          <h2 className="text-lg font-bold">როდის ჩანს</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="დაწყება (სურვილისამებრ)" hint="თბილისის დროით. ცარიელი: მაშინვე." error={error("startsAt")}>
              <input name="startsAt" type="datetime-local" value={v.startsAt} onChange={(e) => set("startsAt", e.target.value)} className={adminInput} />
            </Field>
            <Field label="დასრულება (სურვილისამებრ)" hint="ამ დროის შემდეგ თავისით ქრება. ცარიელი: სანამ არ გამორთავ." error={error("endsAt")}>
              <input name="endsAt" type="datetime-local" value={v.endsAt} onChange={(e) => set("endsAt", e.target.value)} className={adminInput} />
            </Field>
          </div>
          <fieldset hidden={v.type !== "modal"} className="space-y-3">
            <legend className="text-sm font-semibold">რამდენად ხშირად ამოხტეს მოდალი ერთ ვიზიტორთან</legend>
            <label className="flex items-center gap-2 text-sm">
              <input type="radio" name="repeat" value="session" checked={v.repeat === "session"} onChange={() => set("repeat", "session")} className="accent-ink" />
              ერთხელ სესიაზე: ბრაუზერის დახურვამდე აღარ ამოხტება
            </label>
            <label className="flex flex-wrap items-center gap-2 text-sm">
              <input type="radio" name="repeat" value="hours" checked={v.repeat === "hours"} onChange={() => set("repeat", "hours")} className="accent-ink" />
              ერთხელ, შემდეგ ისევ
              <input name="repeatHours" type="number" min={1} max={720} value={v.repeatHours} onChange={(e) => set("repeatHours", Number(e.target.value))} className={`${adminInput} w-24`} />
              საათის შემდეგ (24 = ერთი დღე)
            </label>
            {error("repeatHours") && <p className="text-sm text-danger">{error("repeatHours")}</p>}
            <p className="text-xs text-muted">ტექსტის ან ფერის შეცვლისას მოდალი ყველასთან თავიდან ამოხტება.</p>
          </fieldset>
        </section>

        <div className="flex flex-wrap items-center gap-4">
          <button type="submit" disabled={pending} className={primaryButton}>{pending ? "ინახება…" : "შენახვა"}</button>
          <Link href="/admin/promotions" className={secondaryButton}>გაუქმება</Link>
          {state.errors && !pending && <p role="alert" className="text-sm font-medium text-danger">შეასწორეთ მონიშნული ველები.</p>}
        </div>
      </div>

      <aside className="xl:sticky xl:top-24 xl:self-start">
        <p className="mb-3 text-sm font-semibold">გადახედვა</p>
        <div className="overflow-hidden rounded-[20px] border border-line bg-surface-2 p-4">
          {v.type === "banner" && <PromoBannerView p={preview} apps={PREVIEW_APPS} />}
          {v.type === "bar" && (
            <div className="-mx-4 -mt-4">
              <PromoBarView p={preview} apps={PREVIEW_APPS} close={<CloseButton label="დახურვა" color={v.colors.text} />} />
            </div>
          )}
          {v.type === "modal" && (
            <div className="flex justify-center rounded-2xl bg-ink/50 p-4">
              <PromoModalCard p={preview} apps={PREVIEW_APPS} close={<CloseButton label="დახურვა" color={v.colors.text} />} />
            </div>
          )}
        </div>
      </aside>
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

function Choice({ name, value, checked, onChange, title, hint }: { name: string; value: string; checked: boolean; onChange: () => void; title: string; hint: string }) {
  return (
    <label className={`block cursor-pointer rounded-2xl border p-4 transition ${checked ? "border-ink bg-brand-tint" : "border-line hover:border-ink-2"}`}>
      <span className="flex items-start gap-2 font-semibold">
        <input type="radio" name={name} value={value} checked={checked} onChange={onChange} className="mt-1 shrink-0 accent-ink" />
        <span>{title}</span>
      </span>
      <span className="mt-1 block pl-6 text-xs text-muted">{hint}</span>
    </label>
  );
}

function IconChoice({ selected, onClick, label, children }: { selected: boolean; onClick: () => void; label: string; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      title={label}
      aria-label={label}
      className={`flex size-11 items-center justify-center rounded-xl border transition ${selected ? "border-ink bg-ink text-brand" : "border-line hover:border-ink-2"}`}
    >
      {children}
    </button>
  );
}
