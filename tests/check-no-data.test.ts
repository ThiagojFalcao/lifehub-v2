import { describe, expect, it } from "vitest";
import { findEnvExampleViolations, findViolations } from "../scripts/lib/check-no-data";

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

describe("findEnvExampleViolations", () => {
  it("aceita o .env.example com os placeholders documentados", () => {
    const content = [
      "DATABASE_PATH=./data/lifehub.db",
      "BETTER_AUTH_SECRET=troque-por-um-segredo-de-64-caracteres-hexadecimais",
      "BETTER_AUTH_URL=http://localhost:3000",
      "SEED_EMAIL=voce@exemplo.com",
      "SEED_PASSWORD=troque-por-uma-senha-forte",
    ].join("\n");

    expect(findEnvExampleViolations(content)).toEqual([]);
  });

  it("acusa valores reais de email, senha e segredo", () => {
    const content = [
      "SEED_EMAIL=alguem@real.com",
      "SEED_PASSWORD=senha-real-123",
      "BETTER_AUTH_SECRET=abc123",
    ].join("\n");

    expect(findEnvExampleViolations(content)).toEqual([
      "SEED_EMAIL",
      "SEED_PASSWORD",
      "BETTER_AUTH_SECRET",
    ]);
  });

  it("ignora chaves não sensíveis, comentários e linhas vazias", () => {
    const content =
      "# comentário\nDATABASE_PATH=/tmp/x.db\nBETTER_AUTH_URL=http://localhost:3000\n";
    expect(findEnvExampleViolations(content)).toEqual([]);
  });
});
