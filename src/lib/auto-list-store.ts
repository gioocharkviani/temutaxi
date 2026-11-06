import type { DataSource } from "typeorm";
import { CarListEntryEntity } from "../db/entities";
import { AUTO_LIST_CITIES, type fetchAutoList } from "./auto-list";

const BATCH = 500;

/** Replaces the stored car lists in one transaction, so a failure leaves the old lists in place. */
export async function saveCarLists(db: DataSource, lists: Awaited<ReturnType<typeof fetchAutoList>>) {
  let items = 0;
  await db.transaction(async (manager) => {
    const repo = manager.getRepository(CarListEntryEntity);
    await repo.createQueryBuilder().delete().execute();
    for (const city of AUTO_LIST_CITIES) {
      const rows = lists[city].cars.map((car) => ({
        city,
        brand: car.brand,
        model: car.model,
        years: car.years,
        viaSupport: car.viaSupport ?? null,
      }));
      items += rows.length;
      for (let i = 0; i < rows.length; i += BATCH) await repo.insert(rows.slice(i, i + BATCH));
    }
  });
  return items;
}
