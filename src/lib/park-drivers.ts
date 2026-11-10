// Is a phone number one of our park's drivers? Used before giving a driver a referral link.

import "server-only";
import { getDb } from "@/db/data-source";
import { RatingDriverEntity, RegistrationEntity } from "@/db/entities";
import { listDriverPhones } from "./fleet";
import { phoneKey } from "./rating/ranking";

const CACHE_MS = 10 * 60 * 1000;

type Cache = { at: number; phones: Set<string> | null };
const store = globalThis as unknown as { temutaxiParkPhones?: Cache; temutaxiParkPhonesLoading?: Promise<Cache> };

/** Every phone of the park's drivers from Yandex, kept for 10 minutes; null when Yandex refuses (no permission). */
async function yandexPhones(): Promise<Set<string> | null> {
  const cached = store.temutaxiParkPhones;
  if (cached && Date.now() - cached.at < CACHE_MS) return cached.phones;

  // Visitors at the same moment share one download.
  store.temutaxiParkPhonesLoading ??= listDriverPhones()
    .then((byDriver) => ({ at: Date.now(), phones: new Set([...byDriver.values()].flat().map(phoneKey).filter(Boolean)) }))
    .catch((error) => {
      console.error("Park driver list unavailable", error instanceof Error ? error.message : error);
      return { at: Date.now(), phones: null };
    })
    .then((result) => {
      store.temutaxiParkPhones = result;
      store.temutaxiParkPhonesLoading = undefined;
      return result;
    });
  return (await store.temutaxiParkPhonesLoading).phones;
}

/** Drivers we know from our own records: applications Yandex accepted, and phones from leaderboard updates. */
async function ownRecords(key: string) {
  const db = await getDb();
  const sent = await db.getRepository(RegistrationEntity).find({ select: { phone: true }, where: { status: "sent" } });
  if (sent.some((r) => phoneKey(r.phone) === key)) return true;
  return db
    .getRepository(RatingDriverEntity)
    .createQueryBuilder("d")
    .where("FIND_IN_SET(:key, d.phones) > 0", { key })
    .getExists();
}

/**
 * "yes": the number belongs to a park driver. "no": we can see the park's drivers and it is not one of them.
 * "unknown": the Yandex driver list is not available, so nobody is refused.
 */
export async function checkParkDriver(phone: string): Promise<"yes" | "no" | "unknown"> {
  const key = phoneKey(phone);
  const phones = await yandexPhones();
  if (phones) return phones.has(key) ? "yes" : "no";
  const known = await ownRecords(key).catch(() => false);
  return known ? "yes" : "unknown";
}
