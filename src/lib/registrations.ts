import "server-only";
import { getDb } from "@/db/data-source";
import { RegistrationEntity } from "@/db/entities";
import { toE164, type RegistrationValues } from "./registration";

const orNull = (value: string) => value.trim() || null;

/**
 * Stores an application before it goes to Yandex, so it is never lost if Yandex refuses it.
 * The same request id (a retry from the form) updates the existing row.
 */
export async function saveRegistration(v: RegistrationValues, tariff: string, requestId: string) {
  const db = await getDb();
  const repo = db.getRepository(RegistrationEntity);
  const existing = await repo.findOneBy({ requestId });
  if (existing?.status === "sent") return { id: existing.id, alreadySent: true, refusedBefore: false };
  // Yandex refused the earlier try (a 4xx answer), so nothing was created there and a corrected retry is a new request.
  const refusedBefore = existing?.status === "failed" && /^4\d\d\b/.test(existing.error ?? "");

  const fields = {
    requestId,
    status: "received" as const,
    fullName: v["user-name"].trim(),
    phone: v["user-phone"].trim(),
    city: orNull(v.city),
    licenseNumber: v["license-series"].trim(),
    licenseIssueDate: v["issue-date"],
    licenseExpiryDate: v["expiration-date"],
    carMake: orNull(v["car-make"]),
    carModel: orNull(v["car-model"]),
    carYear: orNull(v["car-year"]),
    carColor: orNull(v["car-color"]),
    vinCode: orNull(v["vin-code"]),
    carNumber: orNull(v["car-number"]),
    tariff: orNull(tariff),
    referrerPhone: v["referrer-phone"].trim() ? toE164(v["referrer-phone"]) : null,
    error: null,
  };

  if (existing) {
    await repo.update(existing.id, fields);
    return { id: existing.id, alreadySent: false, refusedBefore };
  }
  const { identifiers } = await repo.insert(fields);
  return { id: identifiers[0].id as number, alreadySent: false, refusedBefore: false };
}

export async function markRegistrationSent(id: number, fleetProfileId: string) {
  const db = await getDb();
  await db.getRepository(RegistrationEntity).update(id, { status: "sent", fleetProfileId, error: null });
}

export async function markRegistrationFailed(id: number, error: string) {
  const db = await getDb();
  await db.getRepository(RegistrationEntity).update(id, { status: "failed", error });
}

export async function getRecentRegistrations(limit = 50, onlyReferrals = false) {
  const db = await getDb();
  const query = db.getRepository(RegistrationEntity).createQueryBuilder("r").orderBy("r.id", "DESC").take(limit);
  if (onlyReferrals) query.where("r.referrer_phone IS NOT NULL");
  return query.getMany();
}

/** Who referred most drivers, best first. */
export async function getTopReferrers(limit = 10): Promise<{ phone: string; count: number; sent: number }[]> {
  const db = await getDb();
  const rows: { phone: string; count: string; sent: string }[] = await db.query(
    `SELECT referrer_phone AS phone, COUNT(*) AS count, SUM(status = 'sent') AS sent
     FROM registrations WHERE referrer_phone IS NOT NULL
     GROUP BY referrer_phone ORDER BY count DESC, phone ASC LIMIT ?`,
    [limit],
  );
  return rows.map((r) => ({ phone: r.phone, count: Number(r.count), sent: Number(r.sent) }));
}

export async function deleteRegistration(id: number) {
  const db = await getDb();
  await db.getRepository(RegistrationEntity).delete(id);
}
