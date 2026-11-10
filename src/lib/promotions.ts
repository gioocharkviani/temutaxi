// Promotions in the database, and the active ones a visitor sees.

import "server-only";
import { getDb } from "@/db/data-source";
import { PromotionEntity, type Promotion, type PromotionColors } from "@/db/entities";
import type { Locale } from "@/i18n/config";
import type { PromotionInput } from "./promotion-schema";

export async function listPromotions() {
  const db = await getDb();
  return db.getRepository(PromotionEntity).find({ order: { priority: "DESC", id: "DESC" } });
}

export async function getPromotion(id: number) {
  const db = await getDb();
  return db.getRepository(PromotionEntity).findOneBy({ id });
}

export async function savePromotion(id: number | null, data: PromotionInput) {
  const db = await getDb();
  const repo = db.getRepository(PromotionEntity);
  if (id === null) {
    const { identifiers } = await repo.insert(data);
    return identifiers[0].id as number;
  }
  await repo.update(id, data);
  return id;
}

export async function deletePromotion(id: number) {
  const db = await getDb();
  await db.getRepository(PromotionEntity).delete(id);
}

export async function setPromotionEnabled(id: number, enabled: boolean) {
  const db = await getDb();
  await db.getRepository(PromotionEntity).update(id, { enabled });
}

export type PromotionStatus = "off" | "scheduled" | "ended" | "active";

export function promotionStatus(p: Pick<Promotion, "enabled" | "startsAt" | "endsAt">, now = new Date()): PromotionStatus {
  if (!p.enabled) return "off";
  if (p.startsAt && p.startsAt > now) return "scheduled";
  if (p.endsAt && p.endsAt <= now) return "ended";
  return "active";
}

/** What the public site needs for one promotion, already in the visitor's language. */
export type PublicPromotion = {
  id: number;
  /** Changes when the promotion is edited, so a changed modal is shown again. */
  version: string;
  type: Promotion["type"];
  theme: Promotion["theme"];
  colors: PromotionColors;
  icon: string | null;
  title: string;
  body: string;
  buttonText: string;
  link: string | null;
  newTab: boolean;
  showApps: boolean;
  repeat: Promotion["repeat"];
  repeatHours: number;
};

/** Site links get the visitor's language, so "/register" opens /en/register for an English visitor. */
const localizeLink = (link: string | null, lang: Locale) =>
  link && link.startsWith("/") && !/^\/(ka|en|ru)(\/|$|\?|#)/.test(link) ? `/${lang}${link === "/" ? "" : link}` : link;

export function toPublicPromotion(p: Promotion, lang: Locale): PublicPromotion {
  // A field left empty in English or Russian falls back to Georgian.
  const pick = (field: "title" | "body" | "buttonText") => p.content[lang]?.[field] || p.content.ka[field];
  return {
    id: p.id,
    version: `${p.id}-${p.updatedAt.getTime()}`,
    type: p.type,
    theme: p.theme,
    colors: p.colors,
    icon: p.icon,
    title: pick("title"),
    body: pick("body"),
    buttonText: pick("buttonText"),
    link: localizeLink(p.link, lang),
    newTab: p.newTab,
    showApps: p.showApps,
    repeat: p.repeat,
    repeatHours: p.repeatHours,
  };
}

/** Promotions switched on and inside their dates, best first. Empty when the database is unavailable. */
export async function getActivePromotions(lang: Locale): Promise<PublicPromotion[]> {
  try {
    const db = await getDb();
    const now = new Date();
    const rows = await db
      .getRepository(PromotionEntity)
      .createQueryBuilder("p")
      .where("p.enabled = :on", { on: true })
      .andWhere("(p.starts_at IS NULL OR p.starts_at <= :now)", { now })
      .andWhere("(p.ends_at IS NULL OR p.ends_at > :now)", { now })
      .orderBy("p.priority", "DESC")
      .addOrderBy("p.id", "DESC")
      .getMany();
    return rows.map((p) => toPublicPromotion(p, lang));
  } catch (error) {
    console.error("Promotions could not be read", error);
    return [];
  }
}
