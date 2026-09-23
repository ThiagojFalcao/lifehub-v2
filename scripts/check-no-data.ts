import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { findEnvExampleViolations, findViolations } from "./lib/check-no-data";

const files = execSync("git ls-files", { encoding: "utf8" }).split("\n").filter(Boolean);
const violations = findViolations(files);
const envExampleViolations = files.includes(".env.example")
  ? findEnvExampleViolations(readFileSync(".env.example", "utf8"))
  : [];

if (violations.length > 0 || envExampleViolations.length > 0) {
  console.error("Arquivos proibidos versionados (dados/segredos):");
  for (const violation of violations) console.error(` - ${violation}`);
  if (envExampleViolations.length > 0) {
    console.error(" - .env.example com valores reais (use os placeholders documentados):");
    for (const key of envExampleViolations) console.error(`   - ${key}`);
  }
  process.exit(1);
}

console.log("Guardrail ok: nenhum dado pessoal versionado.");
