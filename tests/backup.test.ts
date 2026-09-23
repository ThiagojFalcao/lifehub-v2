import { mkdirSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import Database from "better-sqlite3";
import { afterEach, expect, it } from "vitest";
import { defaultBackupsDir, pruneBackups, runBackup } from "../scripts/lib/backup";

const dirs: string[] = [];

afterEach(() => {
  for (const dir of dirs) rmSync(dir, { recursive: true, force: true });
  dirs.length = 0;
});

function makeDir() {
  const dir = mkdtempSync(path.join(tmpdir(), "lifehub-backup-"));
  dirs.push(dir);
  return dir;
}

function makeSourceDb(dbPath: string) {
  mkdirSync(path.dirname(dbPath), { recursive: true });
  const db = new Database(dbPath);
  db.exec("create table user (id text primary key, email text not null)");
  db.prepare("insert into user (id, email) values (?, ?)").run("1", "seed@test.local");
  db.close();
}

it("cria um backup íntegro com os dados e registra no log", () => {
  const dir = makeDir();
  const dbPath = path.join(dir, "data", "lifehub.db");
  const backupsDir = path.join(dir, "backups");
  makeSourceDb(dbPath);

  const result = runBackup({ dbPath, backupsDir, now: new Date(2026, 8, 23, 22, 0, 0) });

  expect(path.basename(result.target)).toBe("lifehub-20260923-220000.db");
  const copy = new Database(result.target, { readonly: true });
  expect(copy.pragma("integrity_check", { simple: true })).toBe("ok");
  expect(copy.prepare("select count(*) as c from user").get()).toEqual({ c: 1 });
  copy.close();
  expect(readdirSync(backupsDir)).toContain("backup.log");
});

it("falha se o banco de origem não existe", () => {
  const dir = makeDir();
  expect(() =>
    runBackup({ dbPath: path.join(dir, "nao-existe.db"), backupsDir: path.join(dir, "backups") }),
  ).toThrow(/não encontrado/i);
});

it("retenção: mantém 30 dias + primeiro de cada mês e apaga o resto", () => {
  const dir = makeDir();
  const backupsDir = path.join(dir, "backups");
  mkdirSync(backupsDir, { recursive: true });
  const start = new Date(2026, 7, 1, 22, 0, 0);

  for (let day = 1; day <= 40; day++) {
    const date = new Date(start);
    date.setDate(start.getDate() + day - 1);
    const pad = (n: number) => String(n).padStart(2, "0");
    const name = `lifehub-${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}-220000.db`;
    writeFileSync(path.join(backupsDir, name), "");
  }

  const now = new Date(start);
  now.setDate(start.getDate() + 39);
  const deleted = pruneBackups(backupsDir, now);

  expect(deleted).toHaveLength(9);
  expect(deleted).toContain("lifehub-20260802-220000.db");
  expect(readdirSync(backupsDir)).toContain("lifehub-20260801-220000.db");
});

it("resolve caminhos a partir da raiz do repo, não do cwd", () => {
  const before = defaultBackupsDir();
  const originalCwd = process.cwd();
  process.chdir(tmpdir());
  try {
    expect(defaultBackupsDir()).toBe(before);
    expect(path.isAbsolute(defaultBackupsDir())).toBe(true);
  } finally {
    process.chdir(originalCwd);
  }
});
