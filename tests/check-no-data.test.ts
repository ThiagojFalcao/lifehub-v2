import { describe, expect, it } from "vitest";
import { findViolations } from "../scripts/lib/check-no-data";

describe("findViolations", () => {
  it("não acusa arquivos normais do projeto", () => {
    const files = [
      ".env.example",
      "src/app/page.tsx",
      "src/db/schema.ts",
      "drizzle/0000_init.sql",
      "docs/runbook.md",
    ];
    expect(findViolations(files)).toEqual([]);
  });

  it("acusa .env, data/, backups/ e arquivos .db", () => {
    const files = [
      ".env",
      "data/lifehub.db",
      "data/lifehub.db-wal",
      "backups/lifehub-20260923-220000.db",
      "foo.db",
    ];
    expect(findViolations(files)).toEqual(files);
  });
});
