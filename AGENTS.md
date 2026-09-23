<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# AGENTS.md — LifeHub V2

Guia para agentes de IA que trabalharem neste repositório.

## O que é

LifeHub V2: habit tracker pessoal, self-hosted, dados 100% locais (SQLite).
Base científica e decisões em `docs/01-briefing-projeto.md` e `docs/pesquisa-cientifica.md`.

## Comandos

- `npm run dev` — servidor de desenvolvimento (http://localhost:3000)
- `npm run build` / `npm run start` — produção local
- `npm test` — Vitest (unit + integração)
- `npm run e2e` — Playwright smoke (porta 3210, banco `data/e2e.db`)
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
- Instalação npm sem lifecycle scripts (`.npmrc`, ADR 0016) — better-sqlite3 usa prebuilds do pacote; se um pacote precisar, `npm_config_ignore_scripts=false npm rebuild <pacote>`.
- Processo de features: superpowers (brainstorming → spec → writing-plans → execução com TDD).

## Ciclos

1. **Fundação** (concluindo): repo, CI, scaffold, auth, backup, docs.
2. **MVP fatia 1**: schema de hábitos, CRUD, registro rápido, dashboard (gráfico de linha + calendário de mês).
3. **MVP fatia 2**: métricas quantitativas, Regra dos 2 Dias + Floor Plan, check-in emocional, histórico.

## Estado do projeto (handoff)

- **Ciclo 1 (Fundação) em andamento — Tasks 1–9 de 11 concluídas.** Último commit: `c744ef3` (CI verde no GitHub Actions).
- **Ao retomar:** leia `docs/superpowers/plans/2026-09-23-fundacao-lifehub-v2.md` (progresso no topo) e o ledger local `.superpowers/sdd/2026-09-23-fundacao-lifehub-v2/progress.md` (registro task a task: commits, testes, rulings). Próxima task: **Task 10 — Manifest PWA + ícone placeholder**.
- Contexto e decisões: `docs/01-briefing-projeto.md` (§9–§10), ADRs em `docs/adr/` e spec em `docs/superpowers/specs/2026-09-23-fundacao-lifehub-v2-design.md`.
- Processo: superpowers — `executing-plans` inline (ledger + scripts `task-start`/`task-done`); TDD obrigatório.
- Comandos: `npm run dev`, `npm test`, `npm run e2e` (porta 3210), `npm run db:migrate`, `npm run seed`, `npm run backup`, `npm run check:data`, `npm run lint`, `npm run typecheck`, `npm run build`.
- **Nunca** commitar `.env`, `data/`, `backups/`, `*.db` — há guardrail na CI.
