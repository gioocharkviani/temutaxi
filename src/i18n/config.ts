export const locales = ["ka", "en", "ru"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "ka";
export const LOCALE_COOKIE = "temutaxi_lang";

export const localeLabels: Record<Locale, { short: string; name: string }> = {
  ka: { short: "GEO", name: "ქართული" },
  en: { short: "ENG", name: "English" },
  ru: { short: "RUS", name: "Русский" },
};

export const hasLocale = (value: string): value is Locale =>
  (locales as readonly string[]).includes(value);
