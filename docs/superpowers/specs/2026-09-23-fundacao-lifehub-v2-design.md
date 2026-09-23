# LifeHub V2 — Spec do Ciclo 1: Fundação

**Data:** 2026-09-23
**Status:** Aprovada em 2026-09-23 — implementação em andamento (Tasks 1–8 de 11 concluídas; CI verde)
**Ciclo:** 1 de 3 (Fundação → MVP fatia 1 → MVP fatia 2)
**Contexto:** `docs/01-briefing-projeto.md` (§9–§10) e `docs/pesquisa-cientifica.md`

---

## 1. Objetivo

Entregar a fundação técnica e documental do LifeHub V2 para que os ciclos de produto (habit tracker) comecem sobre terreno firme: repositório público replicável, CI verde, scaffold da stack funcionando, backup automático com cópia externa e documentação completa.

**Critério-guia:** uma máquina limpa consegue clonar o repo, seguir o runbook e terminar com o app rodando, login funcionando, CI verde e backup agendado.

## 2. Escopo

### Entra no Ciclo 1

1. Repositório público `lifehub-v2` (MIT) com estrutura de pastas e `.gitignore` protetivo.
2. Documentação: ADRs das decisões travadas, runbook, README, AGENTS.md, briefing atualizado.
3. Scaffold: Next.js (App Router) + TypeScript strict + Tailwind + shadcn/ui.
4. Banco: Drizzle + better-sqlite3 (WAL), migrations via drizzle-kit, banco local em `data/lifehub.db`.
5. Auth: Better Auth (1 conta semeada, signup desabilitado, rotas protegidas server-side).
6. Seed do usuário único (dados demo de hábitos entram no Ciclo 2, junto com o schema).
7. Testes: Vitest (unit/integração com SQLite em memória) + Playwright (smoke de login, local).
8. CI no GitHub Actions: lint, typecheck, test, build + guardrail de dados.
9. Backup: script `VACUUM INTO` + `integrity_check` + retenção (30 diários + 12 mensais), agendado no Windows, cópia externa da pasta `backups/`.
10. Restore documentado e testado uma vez.
11. Manifest PWA (instalação real no celular fica para o Ciclo 2, com Tailscale).

### Não entra (YAGNI)

- Schema de hábitos, CRUD, registro rápido, dashboard (gráfico de linha/calendário de mês), métricas, check-in emocional → Ciclos 2 e 3.
- Recharts, Tailscale ativo, service worker/offline, gamificação, árvore de habilidades, integração com relógio → pós-MVP.
- Ideias registradas no briefing §10 para não se perderem.

## 3. Estrutura do repositório

```
lifehub-v2/
├─ .github/workflows/ci.yml
├─ docs/
│  ├─ 01-briefing-projeto.md
│  ├─ pesquisa-cientifica.md
│  ├─ adr/0001…-*.md
│  ├─ runbook.md
│  └─ superpowers/specs/2026-09-23-fundacao-lifehub-v2-design.md
├─ scripts/backup.mjs
├─ src/
│  ├─ app/            (rotas, layout, grupo (app) protegido)
│  ├─ components/     (UI)
│  ├─ db/             (client, schema, config de migrations)
│  └─ lib/            (auth, env, utils)
├─ drizzle/           (migrations versionadas)
├─ data/              (gitignored — banco)
├─ backups/           (gitignored — backups)
├─ .env.example
├─ .gitignore
├─ AGENTS.md
├─ LICENSE (MIT)
├─ README.md
└─ package.json, tsconfig.json, drizzle.config.ts, …
```

- Docs em pt-BR; código em inglês (arquivos, funções, tabelas).
- Conventional Commits, commits atômicos direto na `main`; CI roda em todo push.
- ADRs numeradas e imutáveis: decisão nova = ADR nova (não edita a antiga).

## 4. Stack e decisões técnicas

| Item | Decisão |
|------|---------|
| Runtime | Node 22 LTS (gerenciado pelo Hermes na máquina do criador; upgrade para 24 adiado — ver §9), npm |
| Framework | Next.js (última estável no momento do scaffold), App Router, TS strict, alias `@/` |
| UI | Tailwind + shadcn/ui |
| Banco | SQLite via better-sqlite3 + Drizzle ORM; WAL; migrations drizzle-kit |
| Auth | Better Auth (adapter Drizzle), email+senha, signup desabilitado, sessão em cookie |
| Validação | zod (env no boot com falha rápida + payloads) |
| Testes | Vitest (SQLite em memória aplicando migrations) + Playwright (smoke) |
| Qualidade | ESLint + Prettier; scripts `lint`, `typecheck`, `test`, `build`, `db:migrate`, `seed`, `backup` |
| PWA | manifest + ícones (service worker/offline pós-MVP) |

Notas:

- `serverExternalPackages: ['better-sqlite3']` no `next.config`.
- Mutações via Server Actions; route handlers só quando necessário.
- Proteção de rotas: grupo `(app)` com checagem de sessão server-side (evita limitação de runtime do middleware).
- `.env`: `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `DATABASE_PATH` — `.env.example` documentado, `.env` gitignored.

## 5. Backup e restore

- Script: `scripts/backup.mjs` → `VACUUM INTO 'backups/lifehub-AAAAMMDD-HHmmss.db'`; valida com `PRAGMA integrity_check`; escreve `backups/backup.log`; sai com código ≠ 0 em falha.
- Retenção: 30 diários + 12 mensais (primeiro backup de cada mês).
- Agendamento: Task Scheduler do Windows, diário (comando exato no runbook).
- Cópia externa: sincronizar a pasta `backups/` (OneDrive/Drive ou pendrive). Nunca sincronizar `data/lifehub.db` ao vivo.
- Restore: passo a passo no runbook; teste real no fim do ciclo, com data registrada.

## 6. CI

- Workflow `.github/workflows/ci.yml` em push/PR: `npm ci` → `lint` → `typecheck` → `test` → `build` (ubuntu-latest, Node 22).
- Guardrail: falha se arquivos `.db`, `.env` ou conteúdo de `data/`/`backups/` estiverem versionados.
- Badge no README.

## 7. Documentação

- `README.md`: visão (3 camadas), stack, quickstart "clone e rode" (aponta para o runbook), links dos ADRs, roadmap dos ciclos, licença, badge.
- `docs/runbook.md`: pré-requisitos, setup (clone → `.env` → `migrate` → `seed` → `dev`), produção (`build`/`start`), backup (manual e agendado), restore, Tailscale/HTTPS documentado, troubleshooting.
- `docs/adr/`: decisões travadas (§9 do briefing + desta sessão).
- `AGENTS.md`: convenções, processo (superpowers), onde ficam specs/ADRs.
- `docs/01-briefing-projeto.md`: §9 revisada + §10 (refinamentos de produto).

## 8. Critérios de conclusão (DoD)

- [ ] Repo público `lifehub-v2` com MIT, README completo e badge CI verde.
- [ ] "Clone e rode": em máquina limpa, seguindo só o runbook, app sobe com `npm run dev` e login funciona com a conta semeada.
- [ ] CI verde: lint, typecheck, test, build + guardrail.
- [ ] Migrations + seed funcionando (tabelas do Better Auth + usuário único).
- [ ] Backup: gera arquivo íntegro, retenção ok, agendado, cópia externa configurada.
- [ ] Restore testado uma vez (data registrada no runbook).
- [ ] Docs completas (ADRs, runbook, README, AGENTS.md, briefing atualizado).
- [ ] Vitest com smoke de auth/seed; Playwright smoke de login rodando local.
- [ ] Manifest PWA presente.

## 9. Riscos

| Risco | Mitigação |
|-------|-----------|
| Node 22 (Hermes) — upgrade para 24 adiado | Não instalar outro Node por fora (conflito de PATH com o Hermes); CI alinhada no 22; revisitar quando o Hermes atualizar |
| better-sqlite3 × Windows | Prebuilds oficiais; rebuild local se necessário |
| Better Auth × Next.js (compatibilidade de versões) | Verificar no scaffold e travar versões no lockfile |
| Task Scheduler (permissões/agendamento) | Runbook com comando exato + alternativa manual |
| Escopo creep | Lista YAGNI explícita + ciclos com spec própria |
| Vazamento de dado pessoal no repo público | `.gitignore` + guardrail na CI |

## 10. Próximos passos

1. Criador revisa esta spec.
2. Aprovada → skill `writing-plans` gera o plano de implementação do Ciclo 1.
3. Execução com TDD e commits atômicos.
4. Ciclo 2: spec própria para o MVP fatia 1 (schema, CRUD, registro, gráfico de linha, calendário de mês) usando os refinamentos do briefing §10.
