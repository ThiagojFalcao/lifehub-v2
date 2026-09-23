# Fundação LifeHub V2 — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Entregar a fundação do LifeHub V2 — repo público replicável, CI verde, scaffold Next.js + SQLite/Drizzle + Better Auth, backup automático com cópia externa e documentação completa — sem nenhuma feature de produto.

**Architecture:** App único Next.js (App Router) com SQLite local via better-sqlite3/Drizzle, autenticação de conta única com Better Auth (signup desabilitado) e proteção de rotas server-side num route group `(app)`. Operação 100% local: script de backup `VACUUM INTO` com retenção + Task Scheduler, cópia externa por pasta `backups/`. CI no GitHub Actions com guardrail anti-vazamento de dados.

**Tech Stack:** Next.js (App Router) · TypeScript strict · Tailwind + shadcn/ui · Drizzle ORM + better-sqlite3 (WAL) · Better Auth · zod · Vitest · Playwright · tsx · GitHub Actions

**Spec:** `docs/superpowers/specs/2026-09-23-fundacao-lifehub-v2-design.md`

**Progresso (2026-09-23):** Ciclo 1 concluído — Tasks 1–11 de 11 (CI verde; auditoria final com clone limpo verificado). Próximo passo: spec do Ciclo 2 (MVP fatia 1).

## Global Constraints

- Node 22 LTS (Hermes-managed, `C:\Users\Usuario\AppData\Local\hermes\node`), npm 10. Windows + PowerShell 5.1 no ambiente do criador.
- Docs em pt-BR; código (arquivos, funções, tabelas) em inglês.
- Conventional Commits; commits atômicos direto na `main`.
- Repo público `ThiagojFalcao/lifehub-v2`, licença MIT — **nunca** commitar dado pessoal (`.env`, `data/`, `backups/`, `*.db`).
- Next.js App Router + TypeScript strict, alias `@/`.
- SQLite via better-sqlite3 + Drizzle; WAL ligado; migrations versionadas em `drizzle/`.
- Better Auth com 1 conta, signup desabilitado.
- Vitest para unit/integração; Playwright para smoke local (porta 3100, banco `data/e2e.db`).
- Backup: `VACUUM INTO` + `PRAGMA integrity_check`; retenção 30 diários + 12 mensais; pasta `backups/` gitignored.
- Scripts npm canônicos: `lint`, `typecheck`, `test`, `test:watch`, `build`, `db:generate`, `db:migrate`, `seed`, `backup`, `check:data`, `e2e`, `e2e:prepare`, `format`, `format:check`.

## Review Focus

1. **Diretório `data/` inexistente** (clone novo, máquina limpa): abrir o banco deve criar o diretório automaticamente — `createDb` faz `mkdirSync` recursivo. Teste na Task 4.
2. **`.env` ausente ou variável faltando**: o app deve falhar rápido com mensagem clara (zod), nunca subir com secret vazio. Teste na Task 3.
3. **Backup agendado com cwd diferente** (Task Scheduler roda fora do repo): o script resolve caminhos a partir da raiz do repo, não do cwd. Teste na Task 7.
4. **Dado pessoal versionado por engano** (`.db`, `.env`, `data/`, `backups/`): guardrail falha local e na CI. Teste na Task 8.
5. **Restore de backup**: um backup restaurado abre íntegro e contém o usuário. Verificação real (não só unidade) na Task 7, com data registrada no runbook.

---

### Task 1: Scaffold Next.js + tooling de qualidade

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `eslint.config.mjs`, `src/app/**`, `public/**`, `README.md` (stub), `.gitignore`
- Create: `.prettierrc.json`, `.prettierignore`, `.gitattributes`, `.env.example`
- Modify: `package.json` (scripts)

**Interfaces:**
- Consumes: nada.
- Produces: app Next.js rodando (`npm run dev`), scripts `lint`/`typecheck`/`build`/`format`, `.env.example` com as 5 variáveis.

- [ ] **Step 1: Confirmar pré-requisitos**

Run: `node --version; npm --version`
Expected: `v22.x` e `10.x`.

- [ ] **Step 2: Scaffold do Next.js na raiz do repo**

Run: `npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --yes`
Expected: cria `package.json`, `src/app/`, etc. Se o CLI recusar por "directory not empty", rode em subpasta e mova: `npx create-next-app@latest _scaffold ...` (mesmas flags) → `Get-ChildItem _scaffold -Force | Move-Item -Destination .` → `Remove-Item _scaffold -Recurse -Force`.

- [ ] **Step 3: Verificar build e lint**

Run: `npm run build`
Expected: build sem erro.
Run: `npm run lint`
Expected: sem erros.

- [ ] **Step 4: Inicializar shadcn/ui**

Run: `npx shadcn@latest init -d`
Expected: cria `components.json`, `src/lib/utils.ts` e `src/components/ui/` (confirme os defaults se o CLI perguntar).
Run: `npm run build`
Expected: build ok.

- [ ] **Step 5: Adicionar Prettier**

Run: `npm i -D prettier`
Create `.prettierrc.json`:
```json
{
  "printWidth": 100
}
```
Create `.prettierignore`:
```
node_modules
.next
docs
drizzle
data
backups
package-lock.json
```
Run: `npm run format`

- [ ] **Step 6: Scripts no package.json**

Adicione à seção `"scripts"`:
```json
"typecheck": "tsc --noEmit",
"format": "prettier --write .",
"format:check": "prettier --check ."
```
Run: `npm run typecheck; npm run format:check`
Expected: ambos passam.

- [ ] **Step 7: `.gitattributes`, `.gitignore` e `.env.example`**

Create `.gitattributes`:
```
* text=auto eol=lf
```
Ajuste o `.gitignore` gerado para garantir (troque a linha `.env*` se existir):
```
# env
.env
!.env.example

# dados e backups (nunca versionar)
data/
backups/
*.db
*.db-wal
*.db-shm
```
Create `.env.example`:
```
# Banco de dados SQLite (caminho relativo à raiz do repo)
DATABASE_PATH=./data/lifehub.db

# Better Auth — gere o segredo com:
# node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
BETTER_AUTH_SECRET=troque-por-um-segredo-de-64-caracteres-hexadecimais
BETTER_AUTH_URL=http://localhost:3000

# Seed do usuário único (npm run seed)
SEED_EMAIL=voce@exemplo.com
SEED_PASSWORD=troque-por-uma-senha-forte
```

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "chore: scaffold Next.js + TypeScript + Tailwind com Prettier e scripts base"
```

---

### Task 2: Repositório público no GitHub + push inicial

**Files:**
- Nenhum arquivo novo (operação de infraestrutura).

**Interfaces:**
- Consumes: commits da Task 1.
- Produces: remote `origin` → `https://github.com/ThiagojFalcao/lifehub-v2` (público).

- [ ] **Step 1: Confirmar autenticação**

Run: `gh auth status`
Expected: `Logged in to github.com account ThiagojFalcao`.

- [ ] **Step 2: Confirmar working tree limpo**

Run: `git status --short`
Expected: sem saída (nada pendente).

- [ ] **Step 3: Criar repo público e dar push**

Run:
```
gh repo create lifehub-v2 --public --source=. --remote=origin --push --description "Habit tracker pessoal self-hosted (Next.js + SQLite). Anti-streak-rígido, com base científica."
```
Expected: repo criado e `main` enviada.

- [ ] **Step 4: Adicionar topics**

Run:
```
gh repo edit --add-topic habit-tracker,nextjs,sqlite,self-hosted,pwa
```
Expected: topics aplicados.

- [ ] **Step 5: Verificar**

Run: `git remote -v; gh repo view --json name,visibility,url`
Expected: `origin` apontando para o repo; `"visibility": "PUBLIC"`.

---

### Task 3: Validação de env com zod + Vitest

**Files:**
- Create: `vitest.config.ts`, `src/lib/env.ts`, `src/instrumentation.ts`, `tests/env.test.ts`
- Modify: `package.json` (devDeps + scripts)

**Interfaces:**
- Consumes: scaffold da Task 1.
- Produces: `parseEnv(source): Env`, `getEnv(): Env`, tipo `Env` em `@/lib/env`.

- [ ] **Step 1: Instalar dependências**

Run: `npm i zod`
Run: `npm i -D vitest`

- [ ] **Step 2: Configurar Vitest**

Create `vitest.config.ts`:
```ts
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
```

- [ ] **Step 3: Escrever o teste que falha**

Create `tests/env.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { parseEnv } from "@/lib/env";

const valid = {
  DATABASE_PATH: "./data/lifehub.db",
  BETTER_AUTH_SECRET: "0123456789abcdef0123456789abcdef",
  BETTER_AUTH_URL: "http://localhost:3000",
};

describe("parseEnv", () => {
  it("aceita um ambiente válido", () => {
    const env = parseEnv(valid);
    expect(env.DATABASE_PATH).toBe("./data/lifehub.db");
    expect(env.BETTER_AUTH_SECRET).toBe(valid.BETTER_AUTH_SECRET);
  });

  it("usa default de DATABASE_PATH e BETTER_AUTH_URL quando ausentes", () => {
    const env = parseEnv({ BETTER_AUTH_SECRET: valid.BETTER_AUTH_SECRET });
    expect(env.DATABASE_PATH).toBe("./data/lifehub.db");
    expect(env.BETTER_AUTH_URL).toBe("http://localhost:3000");
  });

  it("falha se BETTER_AUTH_SECRET estiver ausente ou curto", () => {
    expect(() => parseEnv({})).toThrow();
    expect(() => parseEnv({ BETTER_AUTH_SECRET: "curto" })).toThrow();
  });
});
```

- [ ] **Step 4: Rodar e ver falhar**

Run: `npx vitest run tests/env.test.ts`
Expected: FAIL — módulo `@/lib/env` não existe.

- [ ] **Step 5: Implementar**

Create `src/lib/env.ts`:
```ts
import { z } from "zod";

const envSchema = z.object({
  DATABASE_PATH: z.string().min(1).default("./data/lifehub.db"),
  BETTER_AUTH_SECRET: z
    .string()
    .min(32, "BETTER_AUTH_SECRET precisa de pelo menos 32 caracteres"),
  BETTER_AUTH_URL: z.string().url().default("http://localhost:3000"),
});

export type Env = z.infer<typeof envSchema>;

export function parseEnv(source: Record<string, string | undefined>): Env {
  return envSchema.parse(source);
}

let cachedEnv: Env | undefined;

export function getEnv(): Env {
  if (!cachedEnv) cachedEnv = parseEnv(process.env);
  return cachedEnv;
}
```
Create `src/instrumentation.ts` (falha rápida no boot do servidor):
```ts
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { getEnv } = await import("@/lib/env");
    getEnv();
  }
}
```

- [ ] **Step 6: Rodar e ver passar**

Run: `npx vitest run tests/env.test.ts`
Expected: PASS (3 testes).

- [ ] **Step 7: Scripts de teste**

Adicione ao `package.json`:
```json
"test": "vitest run",
"test:watch": "vitest"
```
Run: `npm test; npm run build`
Expected: testes passam; build passa.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: validação de variáveis de ambiente com zod + Vitest configurado"
```

---

### Task 4: Cliente SQLite/Drizzle com WAL + migrations

**Files:**
- Create: `src/db/schema.ts`, `src/db/client.ts`, `drizzle.config.ts`, `tests/db.test.ts`
- Modify: `next.config.ts`, `package.json` (scripts)

**Interfaces:**
- Consumes: `getEnv()` de `@/lib/env` (Task 3).
- Produces: `createDb(dbPath) => { db, sqlite }`, `getDb() => { db, sqlite }` em `@/db/client`; scripts `db:generate`, `db:migrate`.

- [ ] **Step 1: Instalar dependências**

Run: `npm i drizzle-orm better-sqlite3`
Run: `npm i -D drizzle-kit @types/better-sqlite3 dotenv`

- [ ] **Step 2: Escrever o teste que falha**

Create `tests/db.test.ts`:
```ts
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
```

- [ ] **Step 3: Rodar e ver falhar**

Run: `npx vitest run tests/db.test.ts`
Expected: FAIL — `@/db/client` não existe.

- [ ] **Step 4: Implementar**

Create `src/db/schema.ts`:
```ts
export {};
```
Create `src/db/client.ts`:
```ts
import { mkdirSync } from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { getEnv } from "@/lib/env";
import * as schema from "./schema";

export function createDb(dbPath: string) {
  mkdirSync(path.dirname(path.resolve(dbPath)), { recursive: true });
  const sqlite = new Database(dbPath);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");
  const db = drizzle(sqlite, { schema });
  return { db, sqlite };
}

let cached: ReturnType<typeof createDb> | undefined;

export function getDb() {
  if (!cached) cached = createDb(getEnv().DATABASE_PATH);
  return cached;
}
```
Modify `next.config.ts`:
```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["better-sqlite3"],
};

export default nextConfig;
```
(Se a versão instalada do Next usar outra chave, consulte a doc de `serverExternalPackages` da versão e ajuste.)

- [ ] **Step 5: Rodar e ver passar**

Run: `npx vitest run tests/db.test.ts`
Expected: PASS.

- [ ] **Step 6: Configurar drizzle-kit e scripts**

Create `drizzle.config.ts`:
```ts
import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "sqlite",
  schema: ["./src/db/schema.ts"],
  out: "./drizzle",
  dbCredentials: {
    url: process.env.DATABASE_PATH ?? "./data/lifehub.db",
  },
});
```
Adicione ao `package.json`:
```json
"db:generate": "drizzle-kit generate",
"db:migrate": "drizzle-kit migrate"
```

- [ ] **Step 7: Verificação final + commit**

Run: `npm test; npm run build`
Expected: tudo passa.
```bash
git add -A
git commit -m "feat: cliente SQLite/Drizzle com WAL e configuração de migrations"
```

---

### Task 5: Better Auth + schema gerado + seed do usuário

**Files:**
- Create: `.env` (local, gitignored), `src/lib/auth.ts`, `src/app/api/auth/[...all]/route.ts`, `src/db/auth-schema.ts` (gerado), `src/lib/seed.ts`, `scripts/seed.ts`, `tests/seed.test.ts`, `drizzle/0000_*.sql` (gerado)
- Modify: `src/db/client.ts` (incluir auth-schema), `drizzle.config.ts` (schema array), `package.json` (`seed`)

**Interfaces:**
- Consumes: `createDb`/`getDb` (Task 4), `getEnv` (Task 3).
- Produces: `auth` em `@/lib/auth`; `ensureSeedUser(db, { email, password, name })` em `@/lib/seed`; script `npm run seed`.

- [ ] **Step 1: Instalar dependências**

Run: `npm i better-auth`
Run: `npm i -D tsx`

- [ ] **Step 2: Criar o `.env` local**

Run: `Copy-Item .env.example .env`
Edite `.env`: gere o segredo com
```
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
e preencha `BETTER_AUTH_SECRET`, `SEED_EMAIL` e `SEED_PASSWORD`.
Expected: `.env` existe e **não** aparece no `git status`.

- [ ] **Step 3: Implementar auth e rota**

Create `src/lib/auth.ts`:
```ts
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { getDb } from "@/db/client";
import { getEnv } from "@/lib/env";

const { db } = getDb();
const env = getEnv();

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "sqlite" }),
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  emailAndPassword: { enabled: true, disableSignUp: true },
});
```
Create `src/app/api/auth/[...all]/route.ts`:
```ts
import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth";

export const { GET, POST } = toNextJsHandler(auth);
```

- [ ] **Step 4: Gerar o schema de auth**

Run: `npx @better-auth/cli@latest generate --config ./src/lib/auth.ts --output ./src/db/auth-schema.ts -y`
Expected: `src/db/auth-schema.ts` criado com as tabelas `user`, `session`, `account`, `verification`. Se o CLI pedir confirmação, aceite.

- [ ] **Step 5: Incluir o schema de auth no client e no drizzle-kit**

Modify `src/db/client.ts` (trocar o import do schema):
```ts
import * as authSchema from "./auth-schema";
import * as schema from "./schema";
```
e usar no drizzle:
```ts
  const db = drizzle(sqlite, { schema: { ...schema, ...authSchema } });
```
Modify `drizzle.config.ts`:
```ts
  schema: ["./src/db/schema.ts", "./src/db/auth-schema.ts"],
```

- [ ] **Step 6: Gerar e aplicar a migration**

Run: `npm run db:generate`
Expected: `drizzle/0000_*.sql` criado com as tabelas de auth.
Run: `npm run db:migrate`
Expected: `data/lifehub.db` criado com as tabelas.

- [ ] **Step 7: Escrever o teste que falha**

Create `tests/seed.test.ts`:
```ts
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { eq } from "drizzle-orm";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { afterEach, expect, it } from "vitest";
import { verifyPassword } from "better-auth/crypto";
import { account, user } from "@/db/auth-schema";
import { createDb } from "@/db/client";
import { ensureSeedUser } from "@/lib/seed";

const dirs: string[] = [];

afterEach(() => {
  for (const dir of dirs) rmSync(dir, { recursive: true, force: true });
  dirs.length = 0;
});

it("cria o usuário e a credencial uma única vez (idempotente)", async () => {
  const dir = mkdtempSync(path.join(tmpdir(), "lifehub-seed-"));
  dirs.push(dir);
  const { db } = createDb(path.join(dir, "lifehub.db"));
  migrate(db, { migrationsFolder: "./drizzle" });

  const input = { email: "seed@test.local", password: "senha-de-teste-123", name: "Seed" };
  await ensureSeedUser(db, input);
  await ensureSeedUser(db, input);

  const users = db.select().from(user).all();
  expect(users).toHaveLength(1);
  expect(users[0].email).toBe("seed@test.local");

  const credential = db.select().from(account).where(eq(account.userId, users[0].id)).get();
  expect(credential?.providerId).toBe("credential");
  expect(await verifyPassword({ password: input.password, hash: credential!.password! })).toBe(true);
});
```
(Se a exportação `better-auth/crypto` mudar na versão instalada, confira a doc do Better Auth para o caminho atual de hashing.)

- [ ] **Step 8: Rodar e ver falhar**

Run: `npx vitest run tests/seed.test.ts`
Expected: FAIL — `@/lib/seed` não existe.

- [ ] **Step 9: Implementar o seed**

Create `src/lib/seed.ts`:
```ts
import { eq } from "drizzle-orm";
import { hashPassword } from "better-auth/crypto";
import { account, user } from "@/db/auth-schema";
import type { createDb } from "@/db/client";

type Db = ReturnType<typeof createDb>["db"];

export async function ensureSeedUser(
  db: Db,
  { email, password, name }: { email: string; password: string; name: string },
) {
  const existing = db.select().from(user).where(eq(user.email, email)).get();
  if (existing) return existing;

  const id = crypto.randomUUID();
  const hash = await hashPassword(password);
  const now = new Date();

  db.insert(user)
    .values({ id, name, email, emailVerified: false, createdAt: now, updatedAt: now })
    .run();
  db.insert(account)
    .values({
      id: crypto.randomUUID(),
      accountId: id,
      providerId: "credential",
      userId: id,
      password: hash,
      createdAt: now,
      updatedAt: now,
    })
    .run();

  return db.select().from(user).where(eq(user.email, email)).get();
}
```
(Ajuste nomes/modos de colunas conforme o `auth-schema.ts` gerado, se divergirem.)

- [ ] **Step 10: Rodar e ver passar**

Run: `npx vitest run tests/seed.test.ts`
Expected: PASS.

- [ ] **Step 11: CLI do seed + execução real**

Create `scripts/seed.ts`:
```ts
import "dotenv/config";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { createDb } from "../src/db/client";
import { ensureSeedUser } from "../src/lib/seed";

async function main() {
  const dbPath = process.env.DATABASE_PATH ?? "./data/lifehub.db";
  const email = process.env.SEED_EMAIL;
  const password = process.env.SEED_PASSWORD;

  if (!email || !password) {
    console.error("Defina SEED_EMAIL e SEED_PASSWORD no .env antes de rodar o seed.");
    process.exit(1);
  }

  const { db } = createDb(dbPath);
  migrate(db, { migrationsFolder: "./drizzle" });
  const seeded = await ensureSeedUser(db, { email, password, name: "Thiago" });
  console.log(`Seed ok: ${seeded?.email}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
```
Adicione ao `package.json`:
```json
"seed": "tsx scripts/seed.ts"
```
Run: `npm run seed`
Expected: `Seed ok: <seu email>`.

- [ ] **Step 12: Commit**

```bash
git add -A
git commit -m "feat: Better Auth com schema Drizzle, migration inicial e seed do usuário"
```

---

### Task 6: Login + rota protegida + smoke e2e (Playwright)

**Files:**
- Create: `src/lib/auth-client.ts`, `src/app/login/page.tsx`, `src/app/(app)/layout.tsx`, `src/app/(app)/page.tsx`, `playwright.config.ts`, `e2e/login.spec.ts`, `scripts/prepare-e2e.ts`
- Delete: `src/app/page.tsx` (substituído pelo route group)
- Modify: `package.json` (`e2e`, `e2e:prepare`)

**Interfaces:**
- Consumes: `auth` (Task 5), `createDb` (Task 4), `ensureSeedUser` (Task 5).
- Produces: fluxo de login e2e; scripts `e2e`, `e2e:prepare`.

- [ ] **Step 1: Instalar Playwright**

Run: `npm i -D @playwright/test`
Run: `npx playwright install chromium`

- [ ] **Step 2: Script de preparação do e2e**

Create `scripts/prepare-e2e.ts`:
```ts
import { rmSync } from "node:fs";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { createDb } from "../src/db/client";
import { ensureSeedUser } from "../src/lib/seed";

async function main() {
  const dbPath = process.env.DATABASE_PATH ?? "./data/e2e.db";
  for (const suffix of ["", "-wal", "-shm"]) {
    rmSync(`${dbPath}${suffix}`, { force: true });
  }

  const { db } = createDb(dbPath);
  migrate(db, { migrationsFolder: "./drizzle" });
  await ensureSeedUser(db, {
    email: process.env.SEED_EMAIL ?? "e2e@test.local",
    password: process.env.SEED_PASSWORD ?? "e2e-password-123",
    name: "E2E",
  });
  console.log(`Ambiente e2e pronto: ${dbPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

- [ ] **Step 3: Config do Playwright**

Create `playwright.config.ts`:
```ts
import { defineConfig } from "@playwright/test";

const PORT = 3100;

export default defineConfig({
  testDir: "./e2e",
  use: { baseURL: `http://localhost:${PORT}` },
  webServer: {
    command: `npm run e2e:prepare && npm run dev -- -p ${PORT}`,
    url: `http://localhost:${PORT}/login`,
    reuseExistingServer: false,
    timeout: 120_000,
    env: {
      DATABASE_PATH: "./data/e2e.db",
      BETTER_AUTH_SECRET: "e2e-secret-e2e-secret-e2e-secret-1234",
      BETTER_AUTH_URL: `http://localhost:${PORT}`,
      SEED_EMAIL: "e2e@test.local",
      SEED_PASSWORD: "e2e-password-123",
    },
  },
});
```

- [ ] **Step 4: Escrever o teste e2e que falha**

Create `e2e/login.spec.ts`:
```ts
import { expect, test } from "@playwright/test";

test("rota protegida sem sessão redireciona para /login", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/login/);
});

test("login com a conta seed leva ao dashboard", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill("e2e@test.local");
  await page.getByLabel("Senha").fill("e2e-password-123");
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page.getByRole("heading", { name: "LifeHub" })).toBeVisible();
});
```
Adicione ao `package.json`:
```json
"e2e": "playwright test",
"e2e:prepare": "tsx scripts/prepare-e2e.ts"
```
Run: `npm run e2e`
Expected: FAIL — `/login` não existe (404).

- [ ] **Step 5: Implementar client de auth, login e área protegida**

Create `src/lib/auth-client.ts`:
```ts
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient();
```
Create `src/app/login/page.tsx`:
```tsx
"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const { error: signInError } = await authClient.signIn.email({ email, password });
    if (signInError) {
      setError("Não foi possível entrar. Confira email e senha.");
      setLoading(false);
      return;
    }
    window.location.href = "/";
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-semibold">LifeHub</h1>
        <div className="space-y-1">
          <label htmlFor="email" className="text-sm">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded border px-3 py-2"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="senha" className="text-sm">
            Senha
          </label>
          <input
            id="senha"
            type="password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded border px-3 py-2"
          />
        </div>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-black px-3 py-2 text-white disabled:opacity-50"
        >
          Entrar
        </button>
      </form>
    </main>
  );
}
```
Create `src/app/(app)/layout.tsx`:
```tsx
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  return <>{children}</>;
}
```
Create `src/app/(app)/page.tsx`:
```tsx
"use client";

import { authClient } from "@/lib/auth-client";

export default function DashboardPage() {
  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold">LifeHub</h1>
      <p className="mt-2 text-sm text-neutral-500">
        Fundação pronta. O habit tracker chega no Ciclo 2.
      </p>
      <button
        type="button"
        className="mt-4 rounded border px-3 py-2"
        onClick={() =>
          authClient.signOut().then(() => {
            window.location.href = "/login";
          })
        }
      >
        Sair
      </button>
    </main>
  );
}
```
Delete `src/app/page.tsx` (o route group `(app)` já cobre `/`).

- [ ] **Step 6: Rodar e ver passar**

Run: `npm run e2e`
Expected: 2 testes passando.
Run: `npm run build; npm test`
Expected: build e unit tests passando.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: login com Better Auth, rota protegida e smoke e2e com Playwright"
```

---

### Task 7: Backup com retenção + agendamento + restore testado

**Files:**
- Create: `scripts/lib/backup.ts`, `scripts/backup.ts`, `tests/backup.test.ts`, `docs/runbook.md` (seções de backup/restore)
- Modify: `package.json` (`backup`)

**Interfaces:**
- Consumes: banco em `data/lifehub.db` (Task 5).
- Produces: `runBackup({ dbPath, backupsDir, now })`, `pruneBackups(backupsDir, now)`, `repoRoot`, `defaultDbPath()`, `defaultBackupsDir()` em `scripts/lib/backup.ts`; script `npm run backup`.

- [ ] **Step 1: Escrever os testes que falham**

Create `tests/backup.test.ts`:
```ts
import { mkdtempSync, readdirSync, rmSync, writeFileSync } from "node:fs";
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
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run tests/backup.test.ts`
Expected: FAIL — `scripts/lib/backup` não existe.

- [ ] **Step 3: Implementar a lib e o CLI**

Create `scripts/lib/backup.ts`:
```ts
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
```
Create `scripts/backup.ts`:
```ts
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
```
Adicione ao `package.json`:
```json
"backup": "tsx scripts/backup.ts"
```

- [ ] **Step 4: Rodar e ver passar**

Run: `npx vitest run tests/backup.test.ts`
Expected: PASS (4 testes).

- [ ] **Step 5: Backup real + restore testado**

Run: `npm run backup`
Expected: arquivo `backups/lifehub-<stamp>.db` criado.
Restore de verdade (restaura uma cópia e abre):
```powershell
$latest = (Get-ChildItem backups\lifehub-*.db | Sort-Object LastWriteTime -Descending | Select-Object -First 1).FullName
Copy-Item $latest data\restore-test.db
node -e "const D=require('better-sqlite3');const db=new D('data/restore-test.db',{readonly:true});console.log('integrity:', db.pragma('integrity_check',{simple:true}));console.log('users:', db.prepare('select count(*) as c from user').get().c);"
Remove-Item data\restore-test.db
```
Expected: `integrity: ok` e `users: 1`. **Registre a data do teste no runbook.**

- [ ] **Step 6: Criar runbook (seções de backup/restore) e agendar no Windows**

Create `docs/runbook.md` com (por enquanto) as seções `## Backup` e `## Restore`, contendo: backup manual (`npm run backup`), o comando do agendador, a política de retenção, o passo a passo do restore acima e a **data do teste de restore realizado**.

Agendar:
```powershell
schtasks /Create /TN "LifeHub Backup" /TR "cmd /c cd /d C:\Users\Usuario\Documents\LifeHubV2 && npm run backup" /SC DAILY /ST 22:00 /F
schtasks /Query /TN "LifeHub Backup"
schtasks /Run /TN "LifeHub Backup"
Start-Sleep -Seconds 20
Get-ChildItem backups\lifehub-*.db | Sort-Object LastWriteTime -Descending | Select-Object -First 3
```
Expected: tarefa criada, executada e um backup novo aparecendo na listagem.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: backup do SQLite com retenção, agendamento e restore testado"
```

---

### Task 8: CI + guardrail de dados + push verificado

**Files:**
- Create: `scripts/lib/check-no-data.ts`, `scripts/check-no-data.ts`, `tests/check-no-data.test.ts`, `.github/workflows/ci.yml`
- Modify: `package.json` (`check:data`)

**Interfaces:**
- Consumes: scripts `lint`, `typecheck`, `test`, `build` (Tasks 1–6).
- Produces: `findViolations(files)` em `scripts/lib/check-no-data.ts`; script `check:data`; CI verde no push.

- [ ] **Step 1: Escrever o teste que falha**

Create `tests/check-no-data.test.ts`:
```ts
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
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run tests/check-no-data.test.ts`
Expected: FAIL — módulo não existe.

- [ ] **Step 3: Implementar**

Create `scripts/lib/check-no-data.ts`:
```ts
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
```
Create `scripts/check-no-data.ts`:
```ts
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
```
Adicione ao `package.json`:
```json
"check:data": "tsx scripts/check-no-data.ts"
```

- [ ] **Step 4: Rodar e ver passar**

Run: `npx vitest run tests/check-no-data.test.ts; npm run check:data`
Expected: PASS e `Guardrail ok`.

- [ ] **Step 5: Workflow de CI**

Create `.github/workflows/ci.yml`:
```yaml
name: CI

on:
  push:
  pull_request:

jobs:
  ci:
    runs-on: ubuntu-latest
    env:
      DATABASE_PATH: ./data/ci.db
      BETTER_AUTH_SECRET: ci-secret-ci-secret-ci-secret-ci-1234
      BETTER_AUTH_URL: http://localhost:3000
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm test
      - run: npm run check:data
      - run: npm run build
```

- [ ] **Step 6: Commit, push e verificar verde**

```bash
git add -A
git commit -m "ci: workflow de lint/typecheck/test/build + guardrail de dados"
git push
```
Run: `gh run list --limit 3`
Expected: run do push com status `completed` / `success`. Se falhar, leia o log com `gh run view --log-failed`, corrija e repita.

---

### Task 9: Documentação final (README, AGENTS.md, LICENSE, ADRs, runbook completo)

**Files:**
- Create: `AGENTS.md`, `LICENSE`, `docs/adr/0001-*.md` … `docs/adr/0015-*.md`
- Modify: `README.md` (substituir stub), `docs/runbook.md` (completar)

**Interfaces:**
- Consumes: tudo das Tasks 1–8.
- Produces: documentação completa do repo.

- [ ] **Step 1: LICENSE (MIT)**

Create `LICENSE` com o texto padrão MIT e `Copyright (c) 2026 Thiago Falcão`.

- [ ] **Step 2: ADRs**

Template de cada arquivo:
```markdown
# ADR NNNN: <título>

- **Status:** Aceito
- **Data:** <data da decisão>

## Contexto

<1-3 linhas>

## Decisão

<1-3 linhas>

## Consequências

<1-3 linhas>
```
Arquivos e decisões (conteúdo detalhado: briefing §9 e §10):

| Arquivo | Decisão |
|---|---|
| `0001-web-app-pwa.md` | Web app responsivo/PWA, codebase único |
| `0002-stack-nextjs.md` | Next.js + TypeScript, frontend e API juntos |
| `0003-sqlite-drizzle.md` | SQLite + Drizzle, arquivo local |
| `0004-self-hosted.md` | Self-hosted na máquina do criador, dados locais |
| `0005-auth-better-auth.md` | Better Auth, 1 conta, signup desabilitado |
| `0006-tailscale.md` | Acesso pelo celular via Tailscale |
| `0007-online-only-mvp.md` | Online-only no MVP; sync offline só se virar dor |
| `0008-metricas-json.md` | Métricas em JSON flexível validado por zod |
| `0009-checkin-emocional.md` | Tabela própria diária de check-in emocional |
| `0010-corte-semana-2.md` | Prioridade de corte: histórico e métricas primeiro |
| `0011-start-manual.md` | `npm run start` manual; serviço Windows só se houver fricção |
| `0012-relogio-samsung-health.md` | Samsung Health via Health Connect/CSV, pós-MVP |
| `0013-repo-publico-mit.md` | Repo público (portfólio), MIT, sem dado pessoal |
| `0014-backup-automatico.md` | Backup diário com retenção 30d/12m + cópia externa |
| `0015-ciclos-fundacao-mvp.md` | 3 ciclos: Fundação → MVP fatia 1 → MVP fatia 2 |

- [ ] **Step 3: AGENTS.md**

Create `AGENTS.md`:
```markdown
# AGENTS.md — LifeHub V2

Guia para agentes de IA que trabalharem neste repositório.

## O que é

LifeHub V2: habit tracker pessoal, self-hosted, dados 100% locais (SQLite).
Base científica e decisões em `docs/01-briefing-projeto.md` e `docs/pesquisa-cientifica.md`.

## Comandos

- `npm run dev` — servidor de desenvolvimento (http://localhost:3000)
- `npm run build` / `npm run start` — produção local
- `npm test` — Vitest (unit + integração)
- `npm run e2e` — Playwright smoke (porta 3100, banco `data/e2e.db`)
- `npm run db:generate` / `npm run db:migrate` — migrations Drizzle
- `npm run seed` — cria o usuário único (usa `SEED_EMAIL`/`SEED_PASSWORD`)
- `npm run backup` — backup do banco (retenção automática)
- `npm run check:data` — guardrail: falha se dado pessoal estiver versionado
- `npm run lint` / `npm run typecheck` / `npm run format`

## Convenções

- Docs em pt-BR; código (arquivos, funções, tabelas) em inglês.
- Conventional Commits, commits atômicos direto na `main`.
- ADRs numeradas e imutáveis (`docs/adr/`): decisão nova = ADR nova.
- Specs e planos em `docs/superpowers/specs/` e `docs/superpowers/plans/`.
- **Nunca** commitar `.env`, `data/`, `backups/` ou qualquer `.db` — há guardrail na CI.
- Processo de features: superpowers (brainstorming → spec → writing-plans → execução com TDD).

## Ciclos

1. **Fundação** (atual): repo, CI, scaffold, auth, backup, docs.
2. **MVP fatia 1**: schema de hábitos, CRUD, registro rápido, dashboard (gráfico de linha + calendário de mês).
3. **MVP fatia 2**: métricas quantitativas, Regra dos 2 Dias + Floor Plan, check-in emocional, histórico.
```

- [ ] **Step 4: README.md**

Substitua o stub. Estrutura e conteúdo:
```markdown
# LifeHub

[![CI](https://github.com/ThiagojFalcao/lifehub-v2/actions/workflows/ci.yml/badge.svg)](https://github.com/ThiagojFalcao/lifehub-v2/actions/workflows/ci.yml)

Habit tracker pessoal, self-hosted e com dados 100% locais — desenhado para
construir consistência sem punição: nada de streaks rígidos, nada de "você falhou".

> 🚧 Em construção — Ciclo 1 (fundação) concluído; o tracker chega nos próximos ciclos.

## Visão

Três camadas:

1. **Ação (hoje):** registro rápido do dia (binário + métricas opcionais) e check-in emocional.
2. **Consistência (semanas/meses):** hábitos com Regra dos 2 Dias e Floor Plan para dias difíceis.
3. **Identidade (longo prazo):** trilha de estudos (analista de dados JR → Pleno → Sênior) com projeto prático por nível.

A base científica (streaks, TDAH/RSD, gamificação White-Hat) está documentada em
[`docs/01-briefing-projeto.md`](docs/01-briefing-projeto.md) e
[`docs/pesquisa-cientifica.md`](docs/pesquisa-cientifica.md).

## Stack

Next.js (App Router) · TypeScript · Tailwind + shadcn/ui · SQLite (better-sqlite3) +
Drizzle · Better Auth · Vitest + Playwright · GitHub Actions.

## Rodando localmente

Pré-requisitos: Node 22+ e npm. Passo a passo completo no
[`docs/runbook.md`](docs/runbook.md). Resumo:

```bash
npm ci
Copy-Item .env.example .env   # preencha BETTER_AUTH_SECRET, SEED_EMAIL, SEED_PASSWORD
npm run db:migrate
npm run seed
npm run dev
```

## Estrutura

- `src/app` — rotas (grupo `(app)` protegido, `/login` público)
- `src/db` — client, schema e schema de auth (Drizzle)
- `src/lib` — auth, env, seed
- `scripts` — backup, seed, guardrail, preparação de e2e
- `docs/` — briefing, pesquisa, ADRs, runbook, specs e planos

## Decisões

Todas as decisões técnicas estão registradas como ADRs em [`docs/adr/`](docs/adr/).

## Roadmap

- [x] Ciclo 1 — Fundação (repo, CI, auth, backup, docs)
- [ ] Ciclo 2 — MVP fatia 1 (schema de hábitos, CRUD, registro, dashboard)
- [ ] Ciclo 3 — MVP fatia 2 (métricas, recuperação, check-in emocional)
- [ ] Pós-MVP — relógio (Samsung Health), XP/níveis, árvore de habilidades

## Licença

MIT — veja [`LICENSE`](LICENSE).
```

- [ ] **Step 5: Completar o runbook**

Adicione ao `docs/runbook.md` as seções:
- `## Pré-requisitos` — Node 22+ (ou o Node do Hermes), npm, Git.
- `## Setup` — `git clone` → `npm ci` → `.env` → `npm run db:migrate` → `npm run seed` → `npm run dev`.
- `## Produção local` — `npm run build` e `npm run start` (porta 3000).
- `## Acesso pelo celular (Tailscale)` — instalar Tailscale na máquina e no celular; `tailscale serve --bg 3000` para HTTPS via MagicDNS (PWA instalável exige HTTPS); nunca usar Funnel.
- `## Cópia externa dos backups` — sincronizar a pasta `backups/` (OneDrive/Drive) ou copiar para pendrive; **nunca** sincronizar `data/lifehub.db` ao vivo.
- `## Troubleshooting` — porta ocupada (`npm run dev -- -p 3001`), `better-sqlite3` pedindo rebuild (`npm rebuild better-sqlite3`), e2e falhando com servidor já rodando (fechar o dev da 3000; o e2e usa a 3100), CI vermelha (`gh run view --log-failed`).

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "docs: README, AGENTS.md, LICENSE, ADRs e runbook completo"
git push
```

---

### Task 10: Manifest PWA + ícone placeholder

**Files:**
- Create: `src/app/manifest.ts`, `public/icon.svg`, `tests/manifest.test.ts`

**Interfaces:**
- Consumes: app Next.js (Task 1).
- Produces: manifest servido em `/manifest.webmanifest`.

- [ ] **Step 1: Escrever o teste que falha**

Create `tests/manifest.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import manifest from "@/app/manifest";

describe("manifest", () => {
  it("declara o app como instalável", () => {
    const result = manifest();
    expect(result.name).toBe("LifeHub");
    expect(result.display).toBe("standalone");
    expect(result.icons?.length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run tests/manifest.test.ts`
Expected: FAIL — `@/app/manifest` não existe.

- [ ] **Step 3: Implementar**

Create `src/app/manifest.ts`:
```ts
import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "LifeHub",
    short_name: "LifeHub",
    description: "Habit tracker pessoal com dados locais",
    start_url: "/",
    display: "standalone",
    background_color: "#0b0b0f",
    theme_color: "#0b0b0f",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
```
Create `public/icon.svg`:
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="96" fill="#0b0b0f"/>
  <path d="M112 336l96-96 64 64 128-128" fill="none" stroke="#22c55e" stroke-width="40" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
```

- [ ] **Step 4: Rodar e ver passar**

Run: `npx vitest run tests/manifest.test.ts; npm run build`
Expected: PASS e build ok.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: manifest PWA com ícone placeholder"
```

---

### Task 11: Auditoria final do Ciclo 1

**Files:**
- Modify: `docs/superpowers/specs/2026-09-23-fundacao-lifehub-v2-design.md` (status + checkboxes do DoD)

**Interfaces:**
- Consumes: tudo.
- Produces: DoD do Ciclo 1 verificado e registrado.

- [ ] **Step 1: Rodar a suíte completa local**

Run: `npm run lint; npm run typecheck; npm test; npm run e2e; npm run build; npm run check:data`
Expected: tudo verde.

- [ ] **Step 2: Simular "clone e rode" em máquina limpa**

```powershell
$clone = Join-Path $env:TEMP "lifehub-clone-test"
if (Test-Path $clone) { Remove-Item $clone -Recurse -Force }
git clone . $clone
Set-Location $clone
Copy-Item C:\Users\Usuario\Documents\LifeHubV2\.env .
npm ci
npm run db:migrate
npm run seed
npm run build
npm run e2e
Set-Location C:\Users\Usuario\Documents\LifeHubV2
Remove-Item $clone -Recurse -Force
```
Expected: migrate/seed/build/e2e passam no clone (diretórios `data/` e `backups/` não vêm do git — o app os cria).

- [ ] **Step 3: Atualizar a spec**

No arquivo da spec: mude o `**Status:**` para `Ciclo 1 implementado e verificado em <data>` e marque os checkboxes do §8 (DoD) que passaram.

- [ ] **Step 4: Commit final + push**

```bash
git add -A
git commit -m "chore: auditoria final do Ciclo 1 (fundação)"
git push
```
Run: `gh run list --limit 1`
Expected: CI verde no push final.
