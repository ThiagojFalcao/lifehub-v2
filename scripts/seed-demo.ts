import "dotenv/config";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { user } from "../src/db/auth-schema";
import { createDb } from "../src/db/client";
import { seedDemo } from "../src/lib/habits/demo";

async function main() {
  const dbPath = process.env.DATABASE_PATH ?? "./data/lifehub.db";
  const { db } = createDb(dbPath);
  migrate(db, { migrationsFolder: "./drizzle" });

  const seeded = db.select().from(user).limit(1).all()[0];
  if (!seeded) {
    console.error("Nenhum usuário encontrado. Rode `npm run seed` antes do seed de demonstração.");
    process.exit(1);
  }

  const result = seedDemo(db, seeded.id);
  console.log(`Demo ok: ${result.habits} hábitos e ${result.entries} registros criados.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
