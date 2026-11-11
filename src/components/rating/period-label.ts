import type { RatingSettings } from "@/db/entities";
import type { Locale } from "@/i18n/config";
import { plural, type PluralForms } from "@/i18n/plural";
import { getPeriodRange } from "@/lib/rating/period";

export const INTL_LOCALE: Record<Locale, string> = { ka: "ka-GE", en: "en-GB", ru: "ru-RU" };

export function formatUpdated(date: Date, lang: Locale) {
  return new Intl.DateTimeFormat(INTL_LOCALE[lang], { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Tbilisi" }).format(date);
}

export function formatLongDate(date: Date, lang: Locale) {
  return new Intl.DateTimeFormat(INTL_LOCALE[lang], { dateStyle: "long", timeZone: "Asia/Tbilisi" }).format(date);
}

/** "Last 14 days", or the dates of a fixed period. */
export function periodLabel(settings: RatingSettings, rollingText: PluralForms, lang: Locale) {
  if (settings.periodMode === "rolling") return plural(rollingText, settings.rollingDays, lang);

  const format = (date: Date) =>
    new Intl.DateTimeFormat(INTL_LOCALE[lang], { day: "numeric", month: "short", timeZone: "Asia/Tbilisi" }).format(date);
  const { from, to } = getPeriodRange(settings);
  // A fixed period's `to` is the start of the following day.
  return `${format(from)} — ${format(new Date(to.getTime() - 1))}`;
}

/** The dates a countdown needs, or null when the period has no end (the last N days). */
export function countdownRange(settings: RatingSettings) {
  if (settings.periodMode !== "fixed" || !settings.periodStart || !settings.periodEnd) return null;
  const { from, to } = getPeriodRange(settings);
  return { from: from.toISOString(), to: to.toISOString() };
}
