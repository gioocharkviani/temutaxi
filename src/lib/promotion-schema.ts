// Promotion types, colour presets, date helpers and form validation. Used by the admin form and the server.
// Messages are in Georgian: they are shown in the admin panel.

import { z } from "zod";
import type { PromotionColors } from "@/db/entities";
import { ICON_NAMES } from "@/components/Icon";

export const PROMOTION_TYPES = [
  { id: "modal", label: "მოდალი", hint: "ამოხტება საიტზე შესვლისას. ერთდროულად მხოლოდ ერთი ჩანს: ყველაზე მაღალი რიგითობის." },
  { id: "banner", label: "ბანერი მთავარ გვერდზე", hint: "სექცია მთავარ გვერდზე, Hero-ს ქვეშ. რამდენიმე ერთად შეიძლება." },
  { id: "bar", label: "ზედა ზოლი", hint: "ვიწრო ზოლი ყველა გვერდის თავში, დახურვის ღილაკით. ჩანს ყველაზე მაღალი რიგითობის." },
] as const;

export type PromotionTypeId = (typeof PROMOTION_TYPES)[number]["id"];

export const PROMOTION_THEMES = [
  { id: "solid", label: "მყარი", hint: "ერთი ფერის ფონი, სუფთა და მკაფიო." },
  { id: "glow", label: "ნათება", hint: "რბილი შუქი ღილაკის ფერით. კარგია მუქ ფონზე." },
  { id: "stripes", label: "ზოლები", hint: "ტაქსის სტილის დიაგონალური ზოლები ღილაკის ფერით." },
  { id: "outline", label: "კონტური", hint: "ჩარჩო ღილაკის ფერით. კარგია ღია ფონზე." },
] as const;

export const COLOR_PRESETS: { name: string; colors: PromotionColors }[] = [
  { name: "ყვითელი", colors: { background: "#fce000", text: "#21201f", button: "#21201f", buttonText: "#ffffff" } },
  { name: "მუქი", colors: { background: "#21201f", text: "#ffffff", button: "#fce000", buttonText: "#21201f" } },
  { name: "თეთრი", colors: { background: "#ffffff", text: "#21201f", button: "#fce000", buttonText: "#21201f" } },
  { name: "მწვანე", colors: { background: "#0f7a45", text: "#ffffff", button: "#ffffff", buttonText: "#0f7a45" } },
  { name: "წითელი", colors: { background: "#c8201f", text: "#ffffff", button: "#ffffff", buttonText: "#c8201f" } },
  { name: "ლურჯი", colors: { background: "#1f4fa8", text: "#ffffff", button: "#fce000", buttonText: "#21201f" } },
];

// Georgia is UTC+4 all year. The admin types times in Georgian time.
const OFFSET = "+04:00";
const OFFSET_MS = 4 * 60 * 60 * 1000;

/** A date as "YYYY-MM-DDTHH:mm" in Georgian time, for a datetime-local field. */
export const toTbilisiInput = (date: Date | null) => (date ? new Date(date.getTime() + OFFSET_MS).toISOString().slice(0, 16) : "");

/** "YYYY-MM-DDTHH:mm" in Georgian time back to a date; empty means no date. */
export const fromTbilisiInput = (value: string) => (value ? new Date(`${value}:00${OFFSET}`) : null);

const hex = z.string().regex(/^#[0-9a-fA-F]{6}$/, "ფერი ასე: #fce000");

const dateInput = z
  .string()
  .refine((v) => !v || (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(v) && !Number.isNaN(fromTbilisiInput(v)!.getTime())), "არასწორი თარიღი")
  .transform(fromTbilisiInput);

const text = (max: number) => z.string().trim().max(max, `მაქსიმუმ ${max} სიმბოლო`);

const localized = z.object({ title: text(120), body: text(500), buttonText: text(40) });

export const promotionSchema = z
  .object({
    name: z.string().trim().min(1, "ჩაწერეთ სახელი (ჩანს მხოლოდ ადმინში)").max(80, "მაქსიმუმ 80 სიმბოლო"),
    type: z.enum(["modal", "banner", "bar"]),
    theme: z.enum(["solid", "glow", "stripes", "outline"]),
    enabled: z.boolean(),
    priority: z.coerce.number("შეიყვანეთ რიცხვი").int("მთელი რიცხვი").min(-100, "მინიმუმ -100").max(100, "მაქსიმუმ 100"),
    startsAt: dateInput,
    endsAt: dateInput,
    colors: z.object({ background: hex, text: hex, button: hex, buttonText: hex }),
    icon: z
      .string()
      .refine((v) => !v || (ICON_NAMES as string[]).includes(v), "უცნობი იკონი")
      .transform((v) => v || null),
    // Only links to this site ("/register") or to http(s) addresses, so a link can never run a script.
    link: z
      .string()
      .trim()
      .max(500, "მაქსიმუმ 500 სიმბოლო")
      .refine((v) => !v || /^(https?:\/\/[^\s]+|\/[^\s]*)$/.test(v), "ბმული ასე: /register ან https://…")
      .transform((v) => v || null),
    newTab: z.boolean(),
    showApps: z.boolean(),
    content: z.object({
      ka: localized.extend({ title: text(120).min(1, "ქართული სათაური აუცილებელია") }),
      en: localized,
      ru: localized,
    }),
    repeat: z.enum(["session", "hours"]),
    repeatHours: z.coerce.number("შეიყვანეთ რიცხვი").int("მთელი რიცხვი").min(1, "მინიმუმ 1 საათი").max(720, "მაქსიმუმ 720 საათი (30 დღე)"),
  })
  .superRefine((v, ctx) => {
    if (v.startsAt && v.endsAt && v.endsAt <= v.startsAt) {
      ctx.addIssue({ code: "custom", path: ["endsAt"], message: "დასრულება დაწყების შემდეგ უნდა იყოს" });
    }
    const hasButton = (["ka", "en", "ru"] as const).some((l) => v.content[l].buttonText);
    if (hasButton && !v.showApps && !v.link) ctx.addIssue({ code: "custom", path: ["link"], message: "ღილაკს ბმული სჭირდება" });
  });

export type PromotionInput = z.output<typeof promotionSchema>;
