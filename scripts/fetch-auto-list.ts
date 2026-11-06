// Downloads the official Yandex Pro car lists into the database.
// Run with: npm run cars:update. The admin panel has a button for the same download.

import "./load-env";
import { getDb } from "../src/db/data-source";
import { AUTO_LIST_CITIES, fetchAutoList } from "../src/lib/auto-list";
import { saveCarLists } from "../src/lib/auto-list-store";

async function main() {
  const lists = await fetchAutoList();
  for (const city of AUTO_LIST_CITIES) {
    const { classes, cars, lastUpdate } = lists[city];
    console.log(`${city}: ${cars.length} cars, ${classes.join(", ")} (updated ${lastUpdate})`);
  }
  const db = await getDb();
  console.log(`Saved ${await saveCarLists(db, lists)} rows to the database`);
  await db.destroy();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
