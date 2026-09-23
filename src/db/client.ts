import { mkdirSync } from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { getEnv } from "@/lib/env";
import * as schema from "./schema";

export function createDb(dbPath: string) {
  mkdirSync(path.dirname(path.resolve(dbPath)), { recursive: true });
  const sqlite = new Database(dbPath);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");
  const db = drizzle(sqlite, { schema });
  return { db, sqlite };
}

let cached: ReturnType<typeof createDb> | undefined;

export function getDb() {
  if (!cached) cached = createDb(getEnv().DATABASE_PATH);
  return cached;
}
