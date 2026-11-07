import "server-only";
import { getDb } from "@/db/data-source";
import { RatingDriverEntity, RatingSettingsEntity, type RatingSettings } from "@/db/entities";
import { displayName } from "./names";
import { rankDrivers, searchDrivers, withPositions, type RankedDriver } from "./ranking";
import { periodKey } from "./schedule";
import { RATING_CATEGORIES } from "./settings-schema";

const SETTINGS_ID = 1;

// Used if the settings row is ever missing. Off, so nothing appears on the site until an admin turns it on.
const DEFAULT_SETTINGS = {
  id: SETTINGS_ID,
  enabled: false,
  landingCount: 3,
  pageCount: 10,
  tieBreak: "first" as const,
  content: null,
  syncSchedule: "hourly" as const,
  lastSyncAt: null,
  syncPeriodKey: null,
  syncFrom: null,
  syncTo: null,
  periodMode: "rolling" as const,
  rollingDays: 14,
  periodStart: null,
  periodEnd: null,
  categories: RATING_CATEGORIES.map((c) => c.code),
  nameDisplay: "short" as const,
  minOrders: 1,
  showScores: true,
  showPrizes: false,
  prizes: [],
  hiddenDriverIds: [],
};

export async function getRatingSettings(): Promise<RatingSettings> {
  const db = await getDb();
  const repo = db.getRepository(RatingSettingsEntity);
  const settings = await repo.findOneBy({ id: SETTINGS_ID });
  if (settings) return settings;

  console.error("rating_settings row was missing; restoring the defaults");
  await repo.createQueryBuilder().insert().values(DEFAULT_SETTINGS).orIgnore().execute();
  return repo.findOneByOrFail({ id: SETTINGS_ID });
}

export async function saveRatingSettings(changes: Partial<RatingSettings>) {
  await getRatingSettings();
  const db = await getDb();
  await db.getRepository(RatingSettingsEntity).update(SETTINGS_ID, changes);
}

/**
 * The stored rating: every driver, plus the public order with hidden drivers removed.
 * Null until an update has counted the chosen period, so rows from another period are never shown.
 */
export async function getRating(settings: RatingSettings) {
  if (!settings.lastSyncAt || settings.syncPeriodKey !== periodKey(settings)) return null;

  const db = await getDb();
  const all = rankDrivers(await db.getRepository(RatingDriverEntity).find(), settings);
  const hidden = new Set(settings.hiddenDriverIds);
  return {
    all,
    visible: withPositions(all.filter((r) => !hidden.has(r.driverId))),
    from: settings.syncFrom,
    to: settings.syncTo,
    syncedAt: settings.lastSyncAt,
  };
}

export type PublicRow = { position: number; name: string; score: number; prize: number | null };

// The only way a driver reaches the public pages: the full name and driver id stop here.
const toPublicRow = (row: RankedDriver & { position: number }, settings: RatingSettings): PublicRow => ({
  position: row.position,
  name: displayName(row.driverName, settings.nameDisplay),
  score: row.score,
  prize: settings.showPrizes ? (settings.prizes[row.position - 1] ?? null) : null,
});

export async function getPublicTop(settings: RatingSettings, count: number) {
  const rating = await getRating(settings);
  return rating && { rows: rating.visible.slice(0, count).map((row) => toPublicRow(row, settings)), syncedAt: rating.syncedAt };
}

/** Whether any stored driver has a phone, so the page can offer phone search. */
export async function hasStoredPhones() {
  const db = await getDb();
  return db.getRepository(RatingDriverEntity).createQueryBuilder("d").where("d.phones IS NOT NULL").getExists();
}

const MAX_SEARCH_RESULTS = 10;

/** Matches against the full name, but shows the name only in the form the admin chose. */
export async function searchPublicRating(settings: RatingSettings, query: string) {
  const rating = await getRating(settings);
  if (!rating) return null;
  const matches = searchDrivers(rating.visible, query);
  return {
    rows: matches.slice(0, MAX_SEARCH_RESULTS).map((row) => toPublicRow(row, settings)),
    limited: matches.length > MAX_SEARCH_RESULTS ? MAX_SEARCH_RESULTS : null,
  };
}
