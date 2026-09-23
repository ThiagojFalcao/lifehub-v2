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

const envExamplePlaceholders: Record<string, string> = {
  BETTER_AUTH_SECRET: "troque-por-um-segredo-de-64-caracteres-hexadecimais",
  SEED_EMAIL: "voce@exemplo.com",
  SEED_PASSWORD: "troque-por-uma-senha-forte",
};

export function findEnvExampleViolations(content: string): string[] {
  const violations: string[] = [];

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (line.length === 0 || line.startsWith("#")) continue;

    const separator = line.indexOf("=");
    if (separator === -1) continue;

    const key = line.slice(0, separator).trim();
    const value = line.slice(separator + 1).trim();
    const placeholder = envExamplePlaceholders[key];

    if (placeholder === undefined) continue;
    if (value.length > 0 && value !== placeholder) violations.push(key);
  }

  return violations;
}
