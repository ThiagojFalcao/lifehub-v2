import { rmSync } from "node:fs";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { createDb } from "../src/db/client";
import { ensureSeedUser } from "../src/lib/seed";

async function main() {
  const dbPath = process.env.DATABASE_PATH ?? "./data/e2e.db";
  for (const suffix of ["", "-wal", "-shm"]) {
    rmSync(`${dbPath}${suffix}`, { force: true });
  }

  const { db } = createDb(dbPath);
  migrate(db, { migrationsFolder: "./drizzle" });
  await ensureSeedUser(db, {
    email: process.env.SEED_EMAIL ?? "e2e@test.local",
    password: process.env.SEED_PASSWORD ?? "e2e-password-123",
    name: "E2E",
  });
  console.log(`Ambiente e2e pronto: ${dbPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
