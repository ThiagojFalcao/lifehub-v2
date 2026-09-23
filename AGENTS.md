<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Estado do projeto (handoff)

- **Ciclo 1 (Fundação) em andamento — Tasks 1–8 de 11 concluídas.** Último commit: `a92ef95` (CI verde no GitHub Actions).
- **Ao retomar:** leia `docs/superpowers/plans/2026-09-23-fundacao-lifehub-v2.md` (progresso no topo) e o ledger local `.superpowers/sdd/2026-09-23-fundacao-lifehub-v2/progress.md` (registro task a task: commits, testes, rulings). Próxima task: **Task 9 — Documentação final** (README, AGENTS.md, LICENSE, ADRs, runbook completo).
- Contexto e decisões: `docs/01-briefing-projeto.md` (§9–§10) e spec em `docs/superpowers/specs/2026-09-23-fundacao-lifehub-v2-design.md`.
- Processo: superpowers — `executing-plans` inline (ledger + scripts `task-start`/`task-done`); TDD obrigatório.
- Comandos: `npm run dev`, `npm test`, `npm run e2e` (porta 3210), `npm run db:migrate`, `npm run seed`, `npm run backup`, `npm run check:data`, `npm run lint`, `npm run typecheck`, `npm run build`.
- **Nunca** commitar `.env`, `data/`, `backups/`, `*.db` — há guardrail na CI.
