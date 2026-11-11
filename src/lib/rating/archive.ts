// Final results of finished leaderboard periods. Saved once, after the period's end, from a complete download.

import "server-only";
import type { EntityManager } from "typeorm";
import { getDb } from "@/db/data-source";
import { LeaderboardPeriodEntity, LeaderboardResultEntity, type RatingDriver, type RatingSettings } from "@/db/entities";
import { rankDrivers, withPositions } from "./ranking";
import { periodKey } from "./schedule";

const BATCH = 500;

/** Only a fixed period has an end. Its results are final once the downloaded orders reach that end. */
export function isFinalDownload(settings: Pick<RatingSettings, "periodMode">, periodEnd: Date, downloadedTo: Date) {
  return settings.periodMode === "fixed" && downloadedTo.getTime() >= periodEnd.getTime();
}

/**
 * Saves the final standings of the period, unless they were saved already.
 * Runs inside the update's transaction, so the stored leaderboard and its archive always match.
 * Returns the number of drivers saved, or null if this period was already in the archive.
 */
export async function saveFinalResults(
  manager: EntityManager,
  settings: RatingSettings,
  range: { from: Date; to: Date },
  rows: RatingDriver[],
) {
  const key = periodKey(settings);
  const periods = manager.getRepository(LeaderboardPeriodEntity);
  if (await periods.existsBy({ periodKey: key })) return null;

  const hidden = new Set(settings.hiddenDriverIds);
  const ranked = withPositions(rankDrivers(rows, settings).filter((r) => !hidden.has(r.driverId)));
  const { identifiers } = await periods.insert({
    periodKey: key,
    periodFrom: range.from,
    periodTo: range.to,
    rules: { categories: settings.categories, minOrders: settings.minOrders, tieBreak: settings.tieBreak, prizes: settings.prizes },
    drivers: ranked.length,
    totalOrders: ranked.reduce((sum, r) => sum + r.score, 0),
    savedAt: new Date(),
  });
  const periodId = identifiers[0].id as number;

  const results = ranked.map((r) => ({
    periodId,
    position: r.position,
    driverId: r.driverId,
    driverName: r.driverName.slice(0, 255),
    orders: r.score,
    lastOrderAt: r.reachedAt,
    prize: settings.prizes[r.position - 1] ?? null,
  }));
  const repo = manager.getRepository(LeaderboardResultEntity);
  for (let i = 0; i < results.length; i += BATCH) await repo.insert(results.slice(i, i + BATCH));
  return ranked.length;
}

export async function getArchivedPeriods() {
  const db = await getDb();
  return db.getRepository(LeaderboardPeriodEntity).find({ order: { periodTo: "DESC", id: "DESC" } });
}

export async function getArchivedPeriod(id: number) {
  const db = await getDb();
  const period = await db.getRepository(LeaderboardPeriodEntity).findOneBy({ id });
  if (!period) return null;
  const results = await db.getRepository(LeaderboardResultEntity).find({ where: { periodId: id }, order: { position: "ASC", id: "ASC" } });
  return { period, results };
}

/** Removes a saved period; if the leaderboard still shows that period, the next update saves it again. */
export async function deleteArchivedPeriod(id: number) {
  const db = await getDb();
  await db.getRepository(LeaderboardPeriodEntity).delete({ id });
}
