import { mkdirSync } from "node:fs";
import path from "node:path";
import "dotenv/config";
import { defineConfig } from "drizzle-kit";

const url = process.env.DATABASE_PATH ?? "./data/lifehub.db";

mkdirSync(path.dirname(path.resolve(url)), { recursive: true });

export default defineConfig({
  dialect: "sqlite",
  schema: ["./src/db/schema.ts", "./src/db/auth-schema.ts"],
  out: "./drizzle",
  dbCredentials: {
    url,
  },
});
