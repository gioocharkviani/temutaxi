// Validation of the SEO form. Messages are in Georgian: they are shown in the admin panel.

import { z } from "zod";

export const SEO_PAGE_KEYS = [
  "home",
  "tariffs",
  "register",
  "rating",
  "privacy",
] as const;

const verificationCode = z
  .string()
  .trim()
  .max(300, "ძალიან გრძელია")
  .transform((value) => value.match(/content=["']([^"']+)["']/)?.[1] ?? value)
  .refine(
    (value) => /^[\w.+=-]*$/.test(value),
    "ჩასვით მხოლოდ კოდი ან სრული meta ტეგი",
  );

const seoText = z.object({
  title: z
    .string()
    .trim()
    .min(1, "შეავსეთ სათაური")
    .max(120, "მაქსიმუმ 120 სიმბოლო"),
  description: z
    .string()
    .trim()
    .min(1, "შეავსეთ აღწერა")
    .max(320, "მაქსიმუმ 320 სიმბოლო"),
});
const seoPage = z.object({ ka: seoText, en: seoText, ru: seoText });

export const seoSchema = z.object({
  siteUrl: z
    .string()
    .trim()
    .regex(/^https?:\/\/[^\s/]+$/, "ჩაწერეთ მისამართი ასე: https://temutaxi.ge")
    .refine((value) => URL.canParse(value), "არასწორი მისამართი"),
  siteName: z
    .string()
    .trim()
    .min(1, "შეავსეთ სახელი")
    .max(60, "მაქსიმუმ 60 სიმბოლო"),
  ogImage: z
    .string()
    .trim()
    .max(500, "ძალიან გრძელია")
    .refine(
      (value) => !value || /^(https?:\/\/|\/)\S+$/.test(value),
      "ჩაწერეთ https://… ან /სურათი.png",
    ),
  googleVerification: verificationCode,
  bingVerification: verificationCode,
  yandexVerification: verificationCode,
  indexing: z.boolean(),
  hiddenPages: z.array(z.enum(SEO_PAGE_KEYS)),
  pages: z.object({
    home: seoPage,
    tariffs: seoPage,
    register: seoPage,
    rating: seoPage,
    privacy: seoPage,
  }),
});
