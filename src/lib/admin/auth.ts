import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { LessThan } from "typeorm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getDb } from "@/db/data-source";
import { AdminSessionEntity, AdminUserEntity, type AdminUser } from "@/db/entities";
import { hashPassword, verifyPassword } from "./password";

const COOKIE = "temutaxi_admin";
const SESSION_MS = 12 * 60 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const LOCK_MS = 15 * 60 * 1000;

const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

// Compared against when the username is unknown, so response time does not reveal which usernames exist.
const unknownUserHash = hashPassword(randomBytes(16).toString("hex"));

/** Returns false for a wrong username or password, and while the account is locked. */
export async function logIn(username: string, password: string) {
  const db = await getDb();
  const users = db.getRepository(AdminUserEntity);
  const user = await users.findOneBy({ username });

  if (!user) {
    await verifyPassword(password, await unknownUserHash);
    return false;
  }
  if (user.lockedUntil && user.lockedUntil > new Date()) return false;

  if (!(await verifyPassword(password, user.passwordHash))) {
    const failedAttempts = user.failedAttempts + 1;
    const locked = failedAttempts >= MAX_ATTEMPTS;
    await users.update(user.id, {
      failedAttempts: locked ? 0 : failedAttempts,
      lockedUntil: locked ? new Date(Date.now() + LOCK_MS) : null,
    });
    return false;
  }

  await users.update(user.id, { failedAttempts: 0, lockedUntil: null, lastLoginAt: new Date() });

  const sessions = db.getRepository(AdminSessionEntity);
  await sessions.delete({ expiresAt: LessThan(new Date()) });

  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_MS);
  await sessions.insert({ tokenHash: hashToken(token), userId: user.id, expiresAt });

  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
  return true;
}

export async function logOut() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token) {
    const db = await getDb();
    await db.getRepository(AdminSessionEntity).delete({ tokenHash: hashToken(token) });
  }
  jar.delete(COOKIE);
}

export async function getCurrentAdmin(): Promise<AdminUser | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;

  const db = await getDb();
  const session = await db.getRepository(AdminSessionEntity).findOneBy({ tokenHash: hashToken(token) });
  if (!session || session.expiresAt < new Date()) return null;
  return db.getRepository(AdminUserEntity).findOneBy({ id: session.userId });
}

/** Every admin page and action starts with this. */
export async function requireAdmin(): Promise<AdminUser> {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}

/** Changing the password signs out every other session. */
export async function changePassword(admin: AdminUser, current: string, next: string) {
  if (!(await verifyPassword(current, admin.passwordHash))) return false;

  const db = await getDb();
  await db.getRepository(AdminUserEntity).update(admin.id, { passwordHash: await hashPassword(next) });

  const token = (await cookies()).get(COOKIE)?.value;
  const keep = token ? hashToken(token) : "";
  await db
    .getRepository(AdminSessionEntity)
    .createQueryBuilder()
    .delete()
    .where("user_id = :id AND token_hash <> :keep", { id: admin.id, keep })
    .execute();
  return true;
}
