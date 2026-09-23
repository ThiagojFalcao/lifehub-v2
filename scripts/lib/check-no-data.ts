export function findViolations(files: string[]): string[] {
  return files.filter((file) => {
    const normalized = file.replace(/\\/g, "/");
    const base = normalized.split("/").pop() ?? normalized;

    if (base === ".env.example") return false;
    if (base === ".env" || base.startsWith(".env.")) return true;
    if (normalized.startsWith("data/") || normalized.startsWith("backups/")) return true;
    return /\.(db|db-wal|db-shm|sqlite|sqlite3)$/i.test(base);
  });
}
