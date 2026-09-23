import { appendFileSync, mkdirSync, readdirSync, statSync, unlinkSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Database from "better-sqlite3";

export const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

export function defaultDbPath(): string {
  return path.join(repoRoot, "data", "lifehub.db");
}

export function defaultBackupsDir(): string {
  return path.join(repoRoot, "backups");
}

function stamp(now: Date): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
}

function backupDate(name: string): Date | null {
  const match = /^lifehub-(\d{4})(\d{2})(\d{2})-(\d{2})(\d{2})(\d{2})\.db$/.exec(name);
  if (!match) return null;
  return new Date(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3]),
    Number(match[4]),
    Number(match[5]),
    Number(match[6]),
  );
}

export function pruneBackups(backupsDir: string, now: Date): string[] {
  const entries = readdirSync(backupsDir)
    .map((name) => ({ name, date: backupDate(name) }))
    .filter((entry): entry is { name: string; date: Date } => entry.date !== null)
    .filter((entry) => entry.date <= now)
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  const keep = new Set<string>();

  const latestPerDay = new Map<string, string>();
  for (const entry of entries) {
    const key = `${entry.date.getFullYear()}-${entry.date.getMonth()}-${entry.date.getDate()}`;
    if (!latestPerDay.has(key)) latestPerDay.set(key, entry.name);
  }
  for (const name of [...latestPerDay.values()].slice(0, 30)) keep.add(name);

  const earliestPerMonth = new Map<string, string>();
  for (const entry of [...entries].reverse()) {
    const key = `${entry.date.getFullYear()}-${entry.date.getMonth()}`;
    if (!earliestPerMonth.has(key)) earliestPerMonth.set(key, entry.name);
  }
  for (const [key, name] of earliestPerMonth) {
    const [year, month] = key.split("-").map(Number);
    const ageInMonths = (now.getFullYear() - year) * 12 + (now.getMonth() - month);
    if (ageInMonths < 12) keep.add(name);
  }

  const deleted: string[] = [];
  for (const entry of entries) {
    if (!keep.has(entry.name)) {
      unlinkSync(path.join(backupsDir, entry.name));
      deleted.push(entry.name);
    }
  }
  return deleted;
}

export function runBackup(options: { dbPath: string; backupsDir: string; now?: Date }): {
  target: string;
  deleted: string[];
} {
  const now = options.now ?? new Date();

  if (!statSync(options.dbPath, { throwIfNoEntry: false })) {
    throw new Error(`Banco não encontrado: ${options.dbPath}`);
  }

  mkdirSync(options.backupsDir, { recursive: true });
  const target = path.join(options.backupsDir, `lifehub-${stamp(now)}.db`);

  const db = new Database(options.dbPath);
  try {
    db.exec(`VACUUM INTO '${target.replace(/'/g, "''")}'`);
  } finally {
    db.close();
  }

  const check = new Database(target);
  try {
    const result = check.pragma("integrity_check", { simple: true });
    if (result !== "ok") {
      throw new Error(`Backup corrompido (${target}): ${String(result)}`);
    }
  } finally {
    check.close();
  }

  const deleted = pruneBackups(options.backupsDir, now);
  appendFileSync(
    path.join(options.backupsDir, "backup.log"),
    `${now.toISOString()} backup=${path.basename(target)} deleted=${deleted.length}\n`,
  );

  return { target, deleted };
}
