import "dotenv/config";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { createDb } from "../src/db/client";
import { ensureSeedUser } from "../src/lib/seed";

async function main() {
  const dbPath = process.env.DATABASE_PATH ?? "./data/lifehub.db";
  const email = process.env.SEED_EMAIL;
  const password = process.env.SEED_PASSWORD;

  if (!email || !password) {
    console.error("Defina SEED_EMAIL e SEED_PASSWORD no .env antes de rodar o seed.");
    process.exit(1);
  }

  const { db } = createDb(dbPath);
  migrate(db, { migrationsFolder: "./drizzle" });
  const seeded = await ensureSeedUser(db, { email, password, name: "Thiago" });
  console.log(`Seed ok: ${seeded?.email}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
