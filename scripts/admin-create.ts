// Creates an admin, or sets a new password if the username exists. A random password is generated and shown once.
// Run with: npm run admin:create -- <username>

import { randomBytes } from "node:crypto";
import "./load-env";
import { getDb } from "../src/db/data-source";
import { AdminSessionEntity, AdminUserEntity } from "../src/db/entities";
import { hashPassword } from "../src/lib/admin/password";

async function main() {
  const username = process.argv[2]?.trim();
  if (!username) {
    console.error("Usage: npm run admin:create -- <username>");
    process.exit(1);
  }

  const password = randomBytes(12).toString("base64url");
  const db = await getDb();
  const users = db.getRepository(AdminUserEntity);
  const existing = await users.findOneBy({ username });

  if (existing) {
    await users.update(existing.id, { passwordHash: await hashPassword(password), failedAttempts: 0, lockedUntil: null });
    await db.getRepository(AdminSessionEntity).delete({ userId: existing.id });
  } else {
    await users.insert({ username, passwordHash: await hashPassword(password) });
  }

  console.log(`${existing ? "Password reset for" : "Created"} "${username}". Password: ${password}`);
  await db.destroy();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
