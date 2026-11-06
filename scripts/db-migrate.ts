// Applies database migrations. Run with: npm run db:migrate

import "./load-env";
import { getDb } from "../src/db/data-source";

async function main() {
  const db = await getDb();
  const applied = await db.runMigrations({ transaction: "each" });
  console.log(applied.length ? `Applied: ${applied.map((m) => m.name).join(", ")}` : "Already up to date");
  await db.destroy();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
