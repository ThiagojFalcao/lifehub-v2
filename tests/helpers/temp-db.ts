import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { createDb } from "@/db/client";

export function createTempDb() {
  const dir = mkdtempSync(path.join(tmpdir(), "lifehub-habits-"));
  const { db, sqlite } = createDb(path.join(dir, "lifehub.db"));
  migrate(db, { migrationsFolder: "./drizzle" });
  return {
    db,
    cleanup: () => {
      sqlite.close();
      rmSync(dir, { recursive: true, force: true });
    },
  };
}
