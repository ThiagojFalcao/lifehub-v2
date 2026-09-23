import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, expect, it } from "vitest";
import { createDb } from "@/db/client";

const dirs: string[] = [];

afterEach(() => {
  for (const dir of dirs) rmSync(dir, { recursive: true, force: true });
  dirs.length = 0;
});

it("cria o diretório e o arquivo do banco, com WAL ligado", () => {
  const dir = mkdtempSync(path.join(tmpdir(), "lifehub-"));
  dirs.push(dir);
  const dbPath = path.join(dir, "nested", "lifehub.db");

  const { sqlite } = createDb(dbPath);

  expect(sqlite.pragma("journal_mode", { simple: true })).toBe("wal");
  expect(sqlite.prepare("select 1 as ok").get()).toEqual({ ok: 1 });
  sqlite.close();
});
