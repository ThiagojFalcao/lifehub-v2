import { execSync } from "node:child_process";
import { findViolations } from "./lib/check-no-data";

const files = execSync("git ls-files", { encoding: "utf8" }).split("\n").filter(Boolean);
const violations = findViolations(files);

if (violations.length > 0) {
  console.error("Arquivos proibidos versionados (dados/segredos):");
  for (const violation of violations) console.error(` - ${violation}`);
  process.exit(1);
}

console.log("Guardrail ok: nenhum dado pessoal versionado.");
