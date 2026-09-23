import "dotenv/config";
import path from "node:path";
import { defaultBackupsDir, defaultDbPath, repoRoot, runBackup } from "./lib/backup";

const dbPath = process.env.DATABASE_PATH
  ? path.resolve(repoRoot, process.env.DATABASE_PATH)
  : defaultDbPath();
const backupsDir = process.env.BACKUPS_DIR
  ? path.resolve(repoRoot, process.env.BACKUPS_DIR)
  : defaultBackupsDir();

try {
  const result = runBackup({ dbPath, backupsDir });
  console.log(`Backup criado: ${result.target}`);
  if (result.deleted.length > 0) {
    console.log(`Removidos pela retenção: ${result.deleted.length}`);
  }
} catch (err) {
  console.error("Falha no backup:", err instanceof Error ? err.message : err);
  process.exitCode = 1;
}
