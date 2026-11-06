import "server-only";
import { getDb } from "@/db/data-source";
import { CarListEntryEntity, SiteSettingsEntity } from "@/db/entities";
import type { CarModel, ClassYears } from "@/data/car-classes";

const DEFAULT_CITY = "tbilisi";

export async function getCarListCity() {
  const db = await getDb();
  const settings = await db.getRepository(SiteSettingsEntity).findOneBy({ id: 1 });
  return settings?.carListCity ?? DEFAULT_CITY;
}

export async function saveCarListCity(city: string) {
  const db = await getDb();
  await db.getRepository(SiteSettingsEntity).save({ id: 1, carListCity: city });
}

/** The official car list for the chosen city. Empty when it has not been downloaded or the database is down. */
export async function getCars(): Promise<CarModel[]> {
  try {
    const db = await getDb();
    const city = await getCarListCity();
    const rows = await db.getRepository(CarListEntryEntity).find({
      select: { brand: true, model: true, years: true },
      where: { city },
      order: { brand: "ASC", model: "ASC" },
    });
    return rows.map((row) => ({ brand: row.brand, model: row.model, years: row.years as ClassYears }));
  } catch (error) {
    console.error("Car list unavailable", error);
    return [];
  }
}
