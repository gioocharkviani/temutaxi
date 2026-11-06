// Validation of the rating settings form. Messages are in Georgian: they are shown in the admin panel.

import { z } from "zod";

/** Yandex order categories an admin can count. Delivery (express, cargo) is deliberately not offered. */
export const RATING_CATEGORIES = [
  { code: "econom", label: "ეკონომი" },
  { code: "comfort", label: "comfort" },
  { code: "business", label: "business (თბილისში კომფორტი)" },
  { code: "comfort_plus", label: "კომფორტი+" },
  { code: "minivan", label: "მინივენი" },
  { code: "standart", label: "standart (თბილისში ელექტრო)" },
  { code: "vip", label: "vip (თბილისში Business)" },
  { code: "wagon", label: "wagon" },
  { code: "pool", label: "pool" },
  { code: "start", label: "start" },
  { code: "child_tariff", label: "ბავშვთა" },
  { code: "ultimate", label: "ultimate" },
  { code: "maybach", label: "maybach" },
  { code: "premium_van", label: "premium_van" },
  { code: "premium_suv", label: "premium_suv" },
  { code: "suv", label: "suv" },
  { code: "personal_driver", label: "პირადი მძღოლი" },
] as const;

const codes = RATING_CATEGORIES.map((c) => c.code) as string[];

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "აირჩიეთ თარიღი")
  .refine((s) => !Number.isNaN(Date.parse(`${s}T00:00:00Z`)), "არასწორი თარიღი");

const requiredText = (max: number) =>
  z
    .string()
    .trim()
    .min(1, "შეავსეთ ეს ველი")
    .max(max, `მაქსიმუმ ${max} სიმბოლო`)
    // Browsers send line breaks in form fields as \r\n.
    .transform((text) => text.replace(/\r\n?/g, "\n"));

const ratingText = z.object({
  landingTitle: requiredText(120),
  landingText: requiredText(600),
  pageTitle: requiredText(120),
  rules: requiredText(20000),
});

export const ratingSettingsSchema = z
  .object({
    enabled: z.boolean(),
    landingCount: z.coerce.number("შეიყვანეთ რიცხვი").int("მთელი რიცხვი უნდა იყოს").min(0, "მინიმუმ 0").max(50, "მაქსიმუმ 50"),
    pageCount: z.coerce.number("შეიყვანეთ რიცხვი").int("მთელი რიცხვი უნდა იყოს").min(1, "მინიმუმ 1").max(100, "მაქსიმუმ 100"),
    tieBreak: z.enum(["first", "last"]),
    syncSchedule: z.enum(["hourly", "daily"]),
    content: z.object({ ka: ratingText, en: ratingText, ru: ratingText }),
    periodMode: z.enum(["rolling", "fixed"]),
    rollingDays: z.coerce.number("შეიყვანეთ რიცხვი").int("მთელი რიცხვი უნდა იყოს").min(1, "მინიმუმ 1 დღე").max(365, "მაქსიმუმ 365 დღე"),
    periodStart: z.string(),
    periodEnd: z.string(),
    categories: z.array(z.string()).min(1, "აირჩიეთ მინიმუმ ერთი კატეგორია").refine((list) => list.every((c) => codes.includes(c)), "უცნობი კატეგორია"),
    nameDisplay: z.enum(["full", "short", "first"]),
    minOrders: z.coerce.number("შეიყვანეთ რიცხვი").int("მთელი რიცხვი უნდა იყოს").min(1, "მინიმუმ 1").max(100000, "ძალიან დიდი რიცხვია"),
    showScores: z.boolean(),
    showPrizes: z.boolean(),
    prizes: z
      .string()
      .transform((text) => text.split(/[\s,]+/).filter(Boolean).map(Number))
      .refine((list) => list.length <= 100 && list.every((n) => Number.isFinite(n) && n >= 0), "ჩაწერეთ თანხები მძიმით: 500, 300, 200"),
  })
  .superRefine((v, ctx) => {
    if (v.periodMode !== "fixed") return;
    const start = isoDate.safeParse(v.periodStart);
    const end = isoDate.safeParse(v.periodEnd);
    if (!start.success) ctx.addIssue({ code: "custom", path: ["periodStart"], message: "აირჩიეთ თარიღი" });
    if (!end.success) ctx.addIssue({ code: "custom", path: ["periodEnd"], message: "აირჩიეთ თარიღი" });
    if (start.success && end.success && v.periodEnd < v.periodStart) {
      ctx.addIssue({ code: "custom", path: ["periodEnd"], message: "დასასრული დაწყებამდე არ უნდა იყოს" });
    }
  });

const privacyText = z.object({ title: requiredText(120), body: requiredText(50000) });

export const privacySchema = z.object({ ka: privacyText, en: privacyText, ru: privacyText });

export type SettingsErrors = Partial<Record<string, string>>;
