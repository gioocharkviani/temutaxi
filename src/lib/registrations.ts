import "server-only";
import { getDb } from "@/db/data-source";
import { RegistrationEntity } from "@/db/entities";
import type { RegistrationValues } from "./registration";

const orNull = (value: string) => value.trim() || null;

/**
 * Stores an application before it goes to Yandex, so it is never lost if Yandex refuses it.
 * The same request id (a retry from the form) updates the existing row.
 */
export async function saveRegistration(v: RegistrationValues, tariff: string, requestId: string) {
  const db = await getDb();
  const repo = db.getRepository(RegistrationEntity);
  const existing = await repo.findOneBy({ requestId });
  if (existing?.status === "sent") return { id: existing.id, alreadySent: true };

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
    error: null,
  };

  if (existing) {
    await repo.update(existing.id, fields);
    return { id: existing.id, alreadySent: false };
  }
  const { identifiers } = await repo.insert(fields);
  return { id: identifiers[0].id as number, alreadySent: false };
}

export async function markRegistrationSent(id: number, fleetProfileId: string) {
  const db = await getDb();
  await db.getRepository(RegistrationEntity).update(id, { status: "sent", fleetProfileId, error: null });
}

export async function markRegistrationFailed(id: number, error: string) {
  const db = await getDb();
  await db.getRepository(RegistrationEntity).update(id, { status: "failed", error });
}

export async function getRecentRegistrations(limit = 50) {
  const db = await getDb();
  return db.getRepository(RegistrationEntity).find({ order: { id: "DESC" }, take: limit });
}

export async function deleteRegistration(id: number) {
  const db = await getDb();
  await db.getRepository(RegistrationEntity).delete(id);
}
