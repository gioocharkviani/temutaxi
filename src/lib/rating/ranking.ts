// Turns the stored summary rows into a ranking, and finds drivers in it. No database or network here.

import type { RatingDriver, RatingSettings } from "@/db/entities";

export type RankedDriver = {
  driverId: string;
  driverName: string;
  score: number;
  /** When the driver reached this score: the time of their latest order. */
  reachedAt: Date;
  /** Last 9 digits of each phone number; never sent to the browser. */
  phones: string[];
};

type RankingRules = Pick<RatingSettings, "categories" | "minOrders" | "tieBreak">;

/** Drivers best first, counting only the chosen tariffs. Ties follow the admin's choice, then the driver id so the order is stable. */
export function rankDrivers(rows: RatingDriver[], rules: RankingRules): RankedDriver[] {
  const categories = new Set(rules.categories);
  const drivers = new Map<string, { name: string; score: number; latest: number; phones: Set<string> }>();

  for (const row of rows) {
    if (!categories.has(row.category)) continue;
    const time = row.lastOrderAt.getTime();
    const driver = drivers.get(row.driverId);
    if (!driver) {
      drivers.set(row.driverId, { name: row.driverName, score: row.orders, latest: time, phones: new Set(row.phones?.split(",").filter(Boolean)) });
      continue;
    }
    driver.score += row.orders;
    for (const phone of row.phones?.split(",") ?? []) if (phone) driver.phones.add(phone);
    if (time >= driver.latest) {
      driver.latest = time;
      driver.name = row.driverName || driver.name;
    }
  }

  const direction = rules.tieBreak === "last" ? -1 : 1;
  return [...drivers.entries()]
    .filter(([, d]) => d.score >= rules.minOrders)
    .sort(([idA, a], [idB, b]) => b.score - a.score || direction * (a.latest - b.latest) || idA.localeCompare(idB))
    .map(([driverId, d]) => ({ driverId, driverName: d.name, score: d.score, reachedAt: new Date(d.latest), phones: [...d.phones] }));
}

/** Positions after hiding drivers: equal score and equal time share a place. */
export function withPositions<T extends RankedDriver>(rows: T[]) {
  let position = 0;
  return rows.map((row, i) => {
    const previous = rows[i - 1];
    const tied = previous && previous.score === row.score && previous.reachedAt.getTime() === row.reachedAt.getTime();
    position = tied ? position : i + 1;
    return { ...row, position };
  });
}

const LETTERS: Record<string, string> = {
  ა: "a", ბ: "b", გ: "g", დ: "d", ე: "e", ვ: "v", ზ: "z", თ: "t", ი: "i", კ: "k", ლ: "l", მ: "m", ნ: "n", ო: "o", პ: "p",
  ჟ: "zh", რ: "r", ს: "s", ტ: "t", უ: "u", ფ: "p", ქ: "k", ღ: "g", ყ: "k", შ: "sh", ჩ: "ch", ც: "ts", ძ: "dz", წ: "ts", ჭ: "ch", ხ: "kh", ჯ: "j", ჰ: "h",
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z", и: "i", й: "i", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p",
  р: "r", с: "s", т: "t", у: "u", ф: "p", х: "kh", ц: "ts", ч: "ch", ш: "sh", щ: "shch", ъ: "", ы: "i", ь: "", э: "e", ю: "iu", я: "ia",
};

/**
 * One spelling for any script. Yandex holds names in Latin letters while a driver may type in Georgian
 * or Russian, and Georgian names are spelled several ways in Latin (Qavtaradze, Kavtaradze).
 */
export function normalizeName(text: string) {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .replace(/[^\s]/g, (char) => LETTERS[char] ?? char)
    .replace(/ph/g, "p")
    .replace(/th/g, "t")
    .replace(/gh/g, "g")
    .replace(/q/g, "k")
    .replace(/x/g, "kh")
    .replace(/w/g, "v")
    .replace(/y/g, "i")
    .replace(/c(?!h)/g, "ts")
    .replace(/i+/g, "i")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export const MIN_SEARCH_LENGTH = 3;
const PHONE_DIGITS = 9;

/** A phone number reduced to its last 9 digits, so +995 599 12 34 56 and 599123456 match. Empty if too short. */
export function phoneKey(raw: string) {
  const digits = raw.replace(/\D/g, "");
  return digits.length >= PHONE_DIGITS ? digits.slice(-PHONE_DIGITS) : "";
}

/** "full" for a whole phone number, "partial" while one is being typed, null for a name. */
export function isPhoneQuery(query: string): "full" | "partial" | null {
  const compact = query.replace(/[\s()+.-]/g, "");
  if (!/^\d+$/.test(compact)) return null;
  return compact.length >= PHONE_DIGITS ? "full" : "partial";
}

/** Letters and digits in a name search, ignoring spaces. */
export const searchableLength = (query: string) => normalizeName(query).replace(/\s/g, "").length;

/**
 * Drivers whose full name contains every typed word, in any order, or whose phone is the typed number.
 * A phone only matches in full, so nobody can list drivers by typing a few digits.
 */
export function searchDrivers<T extends RankedDriver>(rows: T[], query: string): T[] {
  const phone = isPhoneQuery(query);
  if (phone === "partial") return [];
  if (phone === "full") {
    const key = phoneKey(query);
    return rows.filter((row) => row.phones.includes(key));
  }
  const words = normalizeName(query).split(" ").filter(Boolean);
  if (words.join("").length < MIN_SEARCH_LENGTH) return [];
  return rows.filter((row) => {
    const name = normalizeName(row.driverName);
    return words.every((word) => name.includes(word));
  });
}
