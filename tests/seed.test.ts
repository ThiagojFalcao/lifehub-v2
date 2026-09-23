import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { eq } from "drizzle-orm";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { afterEach, expect, it } from "vitest";
import { verifyPassword } from "better-auth/crypto";
import { account, user } from "@/db/auth-schema";
import { createDb } from "@/db/client";
import { ensureSeedUser } from "@/lib/seed";

const dirs: string[] = [];
const closers: (() => void)[] = [];

afterEach(() => {
  for (const close of closers) close();
  closers.length = 0;
  for (const dir of dirs) rmSync(dir, { recursive: true, force: true });
  dirs.length = 0;
});

it("cria o usuário e a credencial uma única vez (idempotente)", async () => {
  const dir = mkdtempSync(path.join(tmpdir(), "lifehub-seed-"));
  dirs.push(dir);
  const { db, sqlite } = createDb(path.join(dir, "lifehub.db"));
  closers.push(() => sqlite.close());
  migrate(db, { migrationsFolder: "./drizzle" });

  const input = { email: "seed@test.local", password: "senha-de-teste-123", name: "Seed" };
  await ensureSeedUser(db, input);
  await ensureSeedUser(db, input);

  const users = db.select().from(user).all();
  expect(users).toHaveLength(1);
  expect(users[0].email).toBe("seed@test.local");

  const credential = db.select().from(account).where(eq(account.userId, users[0].id)).get();
  expect(credential?.providerId).toBe("credential");
  expect(await verifyPassword({ password: input.password, hash: credential!.password! })).toBe(true);
});
