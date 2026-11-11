// The background jobs: the rating update and the car list download.

import "server-only";
import { LessThan } from "typeorm";
import { getDb } from "@/db/data-source";
import { JobRunEntity, RatingDriverEntity, RatingSettingsEntity, type JobRun, type JobType, type RatingDriver } from "@/db/entities";
import { AUTO_LIST_CITIES, fetchAutoList } from "./auto-list";
import { saveCarLists } from "./auto-list-store";
import { FleetApiError, listCompletedOrders, listDriverPhones } from "./fleet";
import { isFinalDownload, saveFinalResults } from "./rating/archive";
import { getPeriodRange } from "./rating/period";
import { phoneKey } from "./rating/ranking";
import { isSyncDue, periodKey } from "./rating/schedule";
import { getRatingSettings } from "./rating/service";
import { RATING_CATEGORIES } from "./rating/settings-schema";

const STALE_MS = 30 * 60 * 1000;
const BATCH = 500;
const KEEP_RATING_JOBS_MS = 30 * 24 * 60 * 60 * 1000;

/** Records a job as running, or returns null if the same job is already running. */
export async function startJob(type: JobType, triggeredBy: string): Promise<number | null> {
  const db = await getDb();
  const jobs = db.getRepository(JobRunEntity);

  // A job interrupted by a server restart never finishes; do not let it block new runs forever.
  await jobs.update(
    { type, status: "running", startedAt: LessThan(new Date(Date.now() - STALE_MS)) },
    { status: "failed", finishedAt: new Date(), message: "შეწყდა (სერვერი გადაიტვირთა ან დრო ამოიწურა)" },
  );

  if (await jobs.existsBy({ type, status: "running" })) return null;
  const { identifiers } = await jobs.insert({ type, status: "running", triggeredBy, startedAt: new Date() });
  return identifiers[0].id as number;
}

async function finishJob(id: number, changes: Partial<JobRun>) {
  const db = await getDb();
  await db.getRepository(JobRunEntity).update(id, { finishedAt: new Date(), ...changes });
}

export async function getRecentJobs(limit: number, type: JobType) {
  const db = await getDb();
  return db.getRepository(JobRunEntity).find({ where: { type }, order: { id: "DESC" }, take: limit });
}

export async function getLastRatingJob() {
  const db = await getDb();
  return db.getRepository(JobRunEntity).findOne({ where: { type: "rating_sync" }, order: { id: "DESC" } });
}

function explainFailure(error: unknown) {
  if (error instanceof FleetApiError) {
    if (error.status === 403) {
      return "Yandex-მა უარი თქვა: API გასაღებს შეკვეთების წაკითხვის უფლება არ აქვს (403). ჩართეთ ეს უფლება Yandex Fleet-ში გასაღების პარამეტრებში.";
    }
    return `Yandex-ის შეცდომა ${error.status}: ${error.message}`;
  }
  return error instanceof Error ? error.message : String(error);
}

/**
 * Downloads the period's orders from Yandex and stores only one summary row per driver and tariff.
 * Delivery tariffs and individual orders are never stored, and a failed download leaves the old rating in place.
 */
export async function runRatingSync(jobId: number) {
  try {
    const settings = await getRatingSettings();
    const now = new Date();
    const range = getPeriodRange(settings, now);
    const to = range.to < now ? range.to : now;
    const orders = range.from < to ? await listCompletedOrders(range.from, to) : [];

    const counted = new Set<string>(RATING_CATEGORIES.map((c) => c.code));
    const seen = new Set<string>();
    const rows = new Map<string, RatingDriver>();
    for (const order of orders) {
      const driverId = order.driver_profile?.id;
      if (!driverId || !order.ended_at || !order.category || !counted.has(order.category) || seen.has(order.id)) continue;
      seen.add(order.id);

      const endedAt = new Date(order.ended_at);
      const key = `${driverId}:${order.category}`;
      const row = rows.get(key);
      if (!row) {
        rows.set(key, { driverId, category: order.category, driverName: order.driver_profile?.name ?? "", orders: 1, lastOrderAt: endedAt, phones: null });
        continue;
      }
      row.orders++;
      if (endedAt >= row.lastOrderAt) {
        row.lastOrderAt = endedAt;
        row.driverName = order.driver_profile?.name || row.driverName;
      }
    }

    // Phones are optional: without permission to read drivers, the leaderboard still updates.
    let phoneNote = "";
    if (rows.size > 0) {
      try {
        const phones = await listDriverPhones();
        let found = 0;
        const counted = new Set<string>();
        for (const row of rows.values()) {
          const keys = [...new Set((phones.get(row.driverId) ?? []).map(phoneKey).filter(Boolean))];
          row.phones = keys.length ? keys.join(",").slice(0, 255) : null;
          if (keys.length && !counted.has(row.driverId)) {
            counted.add(row.driverId);
            found++;
          }
        }
        phoneNote = ` · ტელეფონი: ${found} მძღოლი`;
      } catch (error) {
        console.error("Driver phones could not be read", error);
        phoneNote =
          error instanceof FleetApiError && error.status === 403
            ? " · ტელეფონები ვერ წამოვიღეთ: API გასაღებს მძღოლების სიის წაკითხვის უფლება არ აქვს (403)"
            : ` · ტელეფონები ვერ წამოვიღეთ: ${explainFailure(error)}`;
      }
    }

    const db = await getDb();
    let archived: number | null = null;
    await db.transaction(async (manager) => {
      const repo = manager.getRepository(RatingDriverEntity);
      await repo.clear();
      const list = [...rows.values()];
      for (let i = 0; i < list.length; i += BATCH) await repo.insert(list.slice(i, i + BATCH));
      await manager.getRepository(RatingSettingsEntity).update(settings.id, {
        lastSyncAt: now,
        syncPeriodKey: periodKey(settings),
        syncFrom: range.from,
        syncTo: to,
      });
      // After a fixed period ends, this download is complete: its final standings go to the archive once.
      if (isFinalDownload(settings, range.to, to)) archived = await saveFinalResults(manager, settings, range, list);
    });
    const archiveNote = archived === null ? "" : ` · პერიოდი დასრულდა: საბოლოო შედეგები შეინახა (${archived} მძღოლი)`;

    await finishJob(jobId, { status: "success", items: rows.size, message: `დამუშავდა ${seen.size} შეკვეთა${phoneNote}${archiveNote}` });
    await db.getRepository(JobRunEntity).delete({ type: "rating_sync", startedAt: LessThan(new Date(Date.now() - KEEP_RATING_JOBS_MS)) });
  } catch (error) {
    console.error("Rating update failed", error);
    await finishJob(jobId, { status: "failed", message: explainFailure(error) }).catch(console.error);
  }
}

/** Runs the update when the schedule in the admin panel says it is time. Returns whether it ran. */
export async function runRatingSyncIfDue(triggeredBy: string) {
  const [settings, lastJob] = await Promise.all([getRatingSettings(), getLastRatingJob()]);
  if (!isSyncDue(settings, lastJob, new Date())) return false;

  const jobId = await startJob("rating_sync", triggeredBy);
  if (jobId === null) return false;
  await runRatingSync(jobId);
  return true;
}

/** Downloads the official Yandex car lists into the database. */
export async function runCarListUpdate(jobId: number) {
  try {
    const lists = await fetchAutoList();
    const db = await getDb();
    const items = await saveCarLists(db, lists);

    const summary = AUTO_LIST_CITIES.map((city) => `${city}: ${lists[city].cars.length}`).join(", ");
    await finishJob(jobId, { status: "success", items, message: `${summary} · Yandex-ის განახლება: ${lists.tbilisi.lastUpdate}` });
  } catch (error) {
    console.error("Car list update failed", error);
    await finishJob(jobId, { status: "failed", message: explainFailure(error) }).catch(console.error);
  }
}
