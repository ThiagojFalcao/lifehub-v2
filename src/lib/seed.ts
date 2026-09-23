import { eq } from "drizzle-orm";
import { hashPassword } from "better-auth/crypto";
import { account, user } from "@/db/auth-schema";
import type { createDb } from "@/db/client";

type Db = ReturnType<typeof createDb>["db"];

export async function ensureSeedUser(
  db: Db,
  { email, password, name }: { email: string; password: string; name: string },
) {
  const existing = db.select().from(user).where(eq(user.email, email)).get();
  if (existing) return existing;

  const id = crypto.randomUUID();
  const hash = await hashPassword(password);
  const now = new Date();

  db.insert(user)
    .values({ id, name, email, emailVerified: false, createdAt: now, updatedAt: now })
    .run();
  db.insert(account)
    .values({
      id: crypto.randomUUID(),
      accountId: id,
      providerId: "credential",
      userId: id,
      password: hash,
      createdAt: now,
      updatedAt: now,
    })
    .run();

  return db.select().from(user).where(eq(user.email, email)).get();
}
