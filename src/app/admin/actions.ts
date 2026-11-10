"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { changePassword, logIn, logOut, requireAdmin } from "@/lib/admin/auth";
import { AUTO_LIST_CITIES } from "@/lib/auto-list";
import { saveCarListCity } from "@/lib/cars";
import type { Locale } from "@/i18n/config";
import { savePrivacyContent } from "@/lib/privacy";
import { promotionSchema } from "@/lib/promotion-schema";
import { deletePromotion, getPromotion, savePromotion, setPromotionEnabled } from "@/lib/promotions";
import { saveSeo, SEO_TAG } from "@/lib/seo";
import { SEO_PAGE_KEYS, seoSchema } from "@/lib/seo-schema";
import { runCarListUpdate, runRatingSync, runRatingSyncIfDue, startJob } from "@/lib/jobs";
import { deleteRegistration } from "@/lib/registrations";
import { getRatingSettings, saveRatingSettings } from "@/lib/rating/service";
import { privacySchema, ratingSettingsSchema, type SettingsErrors } from "@/lib/rating/settings-schema";

// Every admin page, including the one the form was sent from.
const revalidateAdmin = () => revalidatePath("/admin", "layout");

const text = (form: FormData, name: string) => String(form.get(name) ?? "");

export type LoginState = { error?: string };

export async function loginAction(_: LoginState, form: FormData): Promise<LoginState> {
  let ok: boolean;
  try {
    ok = await logIn(text(form, "username").trim(), text(form, "password"));
  } catch (error) {
    console.error("Admin login failed", error);
    return { error: "ბაზასთან კავშირი ვერ მოხერხდა." };
  }
  if (!ok) return { error: "მომხმარებელი ან პაროლი არასწორია. 5 წარუმატებელი ცდის შემდეგ ანგარიში 15 წუთით იბლოკება." };
  redirect("/admin");
}

export async function logoutAction() {
  await logOut();
  redirect("/admin/login");
}

export type SettingsState = { errors?: SettingsErrors; saved?: boolean };

export async function saveSettingsAction(_: SettingsState, form: FormData): Promise<SettingsState> {
  const admin = await requireAdmin();

  const contentFor = (lang: Locale) => ({
    landingTitle: text(form, `content.${lang}.landingTitle`),
    landingText: text(form, `content.${lang}.landingText`),
    pageTitle: text(form, `content.${lang}.pageTitle`),
    rules: text(form, `content.${lang}.rules`),
  });

  const parsed = ratingSettingsSchema.safeParse({
    enabled: form.get("enabled") === "on",
    landingCount: text(form, "landingCount"),
    pageCount: text(form, "pageCount"),
    tieBreak: text(form, "tieBreak"),
    syncSchedule: text(form, "syncSchedule"),
    content: { ka: contentFor("ka"), en: contentFor("en"), ru: contentFor("ru") },
    periodMode: text(form, "periodMode"),
    rollingDays: text(form, "rollingDays"),
    periodStart: text(form, "periodStart"),
    periodEnd: text(form, "periodEnd"),
    categories: form.getAll("categories").map(String),
    nameDisplay: text(form, "nameDisplay"),
    minOrders: text(form, "minOrders"),
    showScores: form.get("showScores") === "on",
    showPrizes: form.get("showPrizes") === "on",
    prizes: text(form, "prizes"),
  });

  if (!parsed.success) {
    const errors: SettingsErrors = {};
    for (const issue of parsed.error.issues) errors[issue.path.join(".")] ??= issue.message;
    return { errors };
  }

  const { periodStart, periodEnd, ...values } = parsed.data;
  await saveRatingSettings({ ...values, periodStart: periodStart || null, periodEnd: periodEnd || null });
  // Turning the rating on or changing the period needs new numbers straight away; otherwise this does nothing.
  after(() => runRatingSyncIfDue(admin.username).catch(console.error));
  revalidateAdmin();
  return { saved: true };
}

/** Hides a driver from the public rating, or shows them again. */
export async function toggleDriverAction(form: FormData) {
  await requireAdmin();
  const driverId = text(form, "driverId");
  if (!driverId) return;

  const { hiddenDriverIds } = await getRatingSettings();
  await saveRatingSettings({
    hiddenDriverIds: hiddenDriverIds.includes(driverId)
      ? hiddenDriverIds.filter((id) => id !== driverId)
      : [...hiddenDriverIds, driverId],
  });
  revalidateAdmin();
}

// The work continues after the response, and the page refreshes itself until the job finishes.
export async function startRatingSyncAction() {
  const admin = await requireAdmin();
  const jobId = await startJob("rating_sync", admin.username);
  if (jobId !== null) after(() => runRatingSync(jobId));
  revalidateAdmin();
}

export async function startCarListAction() {
  const admin = await requireAdmin();
  const jobId = await startJob("car_list_update", admin.username);
  if (jobId !== null) after(() => runCarListUpdate(jobId));
  revalidateAdmin();
}

export async function saveCarCityAction(form: FormData) {
  await requireAdmin();
  const city = text(form, "city");
  if ((AUTO_LIST_CITIES as readonly string[]).includes(city)) await saveCarListCity(city);
  revalidateAdmin();
}

export async function deleteRegistrationAction(form: FormData) {
  await requireAdmin();
  const id = Number(text(form, "id"));
  if (Number.isInteger(id) && id > 0) await deleteRegistration(id);
  revalidateAdmin();
}

export type PrivacyState = { errors?: SettingsErrors; saved?: boolean };

export async function savePrivacyAction(_: PrivacyState, form: FormData): Promise<PrivacyState> {
  await requireAdmin();

  const textFor = (lang: Locale) => ({ title: text(form, `privacy.${lang}.title`), body: text(form, `privacy.${lang}.body`) });
  const parsed = privacySchema.safeParse({ ka: textFor("ka"), en: textFor("en"), ru: textFor("ru") });
  if (!parsed.success) {
    const errors: SettingsErrors = {};
    for (const issue of parsed.error.issues) errors[issue.path.join(".")] ??= issue.message;
    return { errors };
  }

  await savePrivacyContent(parsed.data);
  revalidateAdmin();
  return { saved: true };
}

export type SeoState = { errors?: SettingsErrors; saved?: boolean };

export async function saveSeoAction(_: SeoState, form: FormData): Promise<SeoState> {
  await requireAdmin();

  const langs: Locale[] = ["ka", "en", "ru"];
  const page = (key: string) =>
    Object.fromEntries(
      langs.map((lang) => [lang, { title: text(form, `pages.${key}.${lang}.title`), description: text(form, `pages.${key}.${lang}.description`) }]),
    );
  const parsed = seoSchema.safeParse({
    siteUrl: text(form, "siteUrl"),
    siteName: text(form, "siteName"),
    ogImage: text(form, "ogImage"),
    googleVerification: text(form, "googleVerification"),
    bingVerification: text(form, "bingVerification"),
    yandexVerification: text(form, "yandexVerification"),
    indexing: form.get("indexing") === "on",
    hiddenPages: form.getAll("hiddenPages").map(String),
    pages: Object.fromEntries(SEO_PAGE_KEYS.map((key) => [key, page(key)])),
  });
  if (!parsed.success) {
    const errors: SettingsErrors = {};
    for (const issue of parsed.error.issues) errors[issue.path.join(".")] ??= issue.message;
    return { errors };
  }

  await saveSeo(parsed.data);
  updateTag(SEO_TAG);
  revalidateAdmin();
  return { saved: true };
}

export type PromotionState = { errors?: SettingsErrors };

export async function savePromotionAction(_: PromotionState, form: FormData): Promise<PromotionState> {
  await requireAdmin();
  const rawId = text(form, "id");
  const id = rawId === "new" ? null : Number(rawId);
  if (id !== null && !(Number.isInteger(id) && id > 0)) return { errors: { name: "უცნობი პრომოუშენი" } };

  const langText = (lang: Locale) => ({
    title: text(form, `content.${lang}.title`),
    body: text(form, `content.${lang}.body`),
    buttonText: text(form, `content.${lang}.buttonText`),
  });
  const parsed = promotionSchema.safeParse({
    name: text(form, "name"),
    type: text(form, "type"),
    theme: text(form, "theme"),
    enabled: form.get("enabled") === "on",
    priority: text(form, "priority"),
    startsAt: text(form, "startsAt"),
    endsAt: text(form, "endsAt"),
    colors: {
      background: text(form, "colors.background"),
      text: text(form, "colors.text"),
      button: text(form, "colors.button"),
      buttonText: text(form, "colors.buttonText"),
    },
    icon: text(form, "icon"),
    link: text(form, "link"),
    newTab: form.get("newTab") === "on",
    content: { ka: langText("ka"), en: langText("en"), ru: langText("ru") },
    repeat: text(form, "repeat") || "hours",
    repeatHours: text(form, "repeatHours") || "24",
  });
  if (!parsed.success) {
    const errors: SettingsErrors = {};
    for (const issue of parsed.error.issues) errors[issue.path.join(".")] ??= issue.message;
    return { errors };
  }
  if (id !== null && !(await getPromotion(id))) return { errors: { name: "პრომოუშენი წაშლილია" } };

  await savePromotion(id, parsed.data);
  revalidateAdmin();
  redirect("/admin/promotions");
}

export async function togglePromotionAction(form: FormData) {
  await requireAdmin();
  const id = Number(text(form, "id"));
  const promotion = Number.isInteger(id) && id > 0 ? await getPromotion(id) : null;
  if (promotion) await setPromotionEnabled(id, !promotion.enabled);
  revalidateAdmin();
}

export async function deletePromotionAction(form: FormData) {
  await requireAdmin();
  const id = Number(text(form, "id"));
  if (Number.isInteger(id) && id > 0) await deletePromotion(id);
  revalidateAdmin();
}

export type PasswordState = { error?: string; saved?: boolean };

export async function changePasswordAction(_: PasswordState, form: FormData): Promise<PasswordState> {
  const admin = await requireAdmin();
  const next = text(form, "next");
  if (next.length < 10) return { error: "ახალი პაროლი მინიმუმ 10 სიმბოლო უნდა იყოს." };
  if (next !== text(form, "repeat")) return { error: "ახალი პაროლები ერთმანეთს არ ემთხვევა." };
  if (!(await changePassword(admin, text(form, "current"), next))) return { error: "მიმდინარე პაროლი არასწორია." };
  return { saved: true };
}
