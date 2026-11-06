// Turns the stored summary rows into a ranking, and finds drivers in it. No database or network here.

import type { RatingDriver, RatingSettings } from "@/db/entities";

export type RankedDriver = {
  driverId: string;
  driverName: string;
  score: number;
  /** When the driver reached this score: the time of their latest order. */
  reachedAt: Date;
};

type RankingRules = Pick<RatingSettings, "categories" | "minOrders" | "tieBreak">;

/** Drivers best first, counting only the chosen tariffs. Ties follow the admin's choice, then the driver id so the order is stable. */
export function rankDrivers(rows: RatingDriver[], rules: RankingRules): RankedDriver[] {
  const categories = new Set(rules.categories);
  const drivers = new Map<string, { name: string; score: number; latest: number }>();

  for (const row of rows) {
    if (!categories.has(row.category)) continue;
    const time = row.lastOrderAt.getTime();
    const driver = drivers.get(row.driverId);
    if (!driver) {
      drivers.set(row.driverId, { name: row.driverName, score: row.orders, latest: time });
      continue;
    }
    driver.score += row.orders;
    if (time >= driver.latest) {
      driver.latest = time;
      driver.name = row.driverName || driver.name;
    }
  }

  const direction = rules.tieBreak === "last" ? -1 : 1;
  return [...drivers.entries()]
    .filter(([, d]) => d.score >= rules.minOrders)
    .sort(([idA, a], [idB, b]) => b.score - a.score || direction * (a.latest - b.latest) || idA.localeCompare(idB))
    .map(([driverId, d]) => ({ driverId, driverName: d.name, score: d.score, reachedAt: new Date(d.latest) }));
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

/** Drivers whose full name contains every typed word, in any order. */
export function searchDrivers<T extends RankedDriver>(rows: T[], query: string): T[] {
  const words = normalizeName(query).split(" ").filter(Boolean);
  if (words.join("").length < MIN_SEARCH_LENGTH) return [];
  return rows.filter((row) => {
    const name = normalizeName(row.driverName);
    return words.every((word) => name.includes(word));
  });
}
