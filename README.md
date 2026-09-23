# LifeHub

[![CI](https://github.com/ThiagojFalcao/lifehub-v2/actions/workflows/ci.yml/badge.svg)](https://github.com/ThiagojFalcao/lifehub-v2/actions/workflows/ci.yml)

Habit tracker pessoal, self-hosted e com dados 100% locais — desenhado para
construir consistência sem punição: nada de streaks rígidos, nada de "você falhou".

> 🚧 Em construção — Ciclos 1–2 concluídos: o tracker já registra hábitos (dashboard com gráfico e calendário); métricas, recuperação e check-in emocional chegam no Ciclo 3.

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
- [x] Ciclo 2 — MVP fatia 1 (schema de hábitos, CRUD, registro, dashboard)
- [ ] Ciclo 3 — MVP fatia 2 (métricas, recuperação, check-in emocional)
- [ ] Pós-MVP — relógio (Samsung Health), XP/níveis, árvore de habilidades

## Licença

MIT — veja [`LICENSE`](LICENSE).
