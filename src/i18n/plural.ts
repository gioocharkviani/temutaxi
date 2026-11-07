import type { Locale } from "./config";

/** Word forms for a number. Russian needs one, few and many; Georgian uses one form after any number. */
export type PluralForms = { one: string; other: string; few?: string; many?: string };

/** Picks the right form for n and puts n in place of "{n}": "1 order", "21 день", "5 заказов". */
export function plural(forms: PluralForms, n: number, lang: Locale) {
  const rule = new Intl.PluralRules(lang).select(n) as keyof PluralForms;
  return (forms[rule] ?? forms.other).replace("{n}", String(n));
}
