# LifeHub V2 — Spec do Ciclo 2: MVP fatia 1 (habit tracker)

**Data:** 2026-09-23
**Status:** Ciclo 2 implementado e verificado em 2026-09-23 (13 de 13 tasks; CI verde)
**Ciclo:** 2 de 3 (Fundação → MVP fatia 1 → MVP fatia 2)
**Contexto:** `docs/01-briefing-projeto.md` (§3–§5, §9–§10), `docs/pesquisa-cientifica.md`, ADRs (`docs/adr/`) e spec do Ciclo 1 (`docs/superpowers/specs/2026-09-23-fundacao-lifehub-v2-design.md`)
**Depende de:** Ciclo 1 concluído e verificado (11/11 tasks; CI verde; `main` em `cfd4e4c`)

---

## 1. Objetivo

Transformar a fundação em um habit tracker usável no dia a dia: criar/editar/arquivar hábitos, registrar o dia em segundos (binário fiz/não fiz), corrigir dias passados e enxergar a consistência (gráfico da semana + calendário do mês).

**Critério-guia:** o criador usa o app todos os dias por uma semana e registra sem fricção — no desktop e no celular (Tailscale), sem streaks punitivos.

## 2. Escopo

### Entra no Ciclo 2

1. Schema `habits` + `habitEntries` com migration versionada.
2. CRUD de hábitos: criar, editar, arquivar e reativar (**sem delete** — ADR 0017).
3. Registro rápido do dia de hoje (1 toque, atualização otimista com reversão em erro).
4. Backfill de dias passados, do dia de criação do hábito até hoje (painel do dia na home e calendário do detalhe).
5. Home: gráfico de linha da semana, calendário do mês com intensidade, painel do dia, lista de hábitos ativos e seção de arquivados.
6. Detalhe do hábito: calendário do mês do hábito, estatísticas simples, editar/arquivar/reativar.
7. Dados de demonstração via `npm run seed:demo`: 4 hábitos fixos (com cores da paleta) e registros dos últimos 60 dias com ~75% de conclusão determinística; idempotente por nome de hábito (rodar de novo não duplica); exige o usuário já semeado (`npm run seed`) e falha com mensagem clara se não existir.
8. Server Actions com verificação de sessão própria (`getSessionOrNull()` + wrapper) e validação zod — a proteção do route group não cobre actions.
9. Testes: unit (domínio/datas), integração (queries/serviço/actions com SQLite real) e e2e (fluxo completo).
10. ADRs 0017 e 0018; atualização de README/AGENTS/runbook se necessário; DoD marcado nesta spec.

### Não entra (YAGNI)

- Métricas quantitativas, Regra dos 2 Dias + Floor Plan, check-in emocional, histórico longo (semanal/trimestral/anual) → Ciclo 3 (fatia 2).
- Gráfico de evolução por hábito (camada 2 do briefing §4.2) → depois.
- Gamificação/XP, árvore de habilidades, integração com relógio, offline/service worker, notificações → pós-MVP.
- Ordem manual (drag&drop), delete definitivo, multi-usuário, temas/aparência → sem previsão.

## 3. Modelo de dados

Duas tabelas novas (nomes em inglês, colunas camelCase no Drizzle → snake_case no SQLite, padrão do repo):

**`habits`**

| Coluna | Tipo | Regra |
|---|---|---|
| `id` | text PK | `crypto.randomUUID()` |
| `userId` | text FK → `user.id` | not null (escopa o dado mesmo com 1 conta) |
| `name` | text | not null, 1–60 chars (trim) |
| `color` | text | not null, chave da paleta fixa |
| `intention` | text | null; ≤ 280 chars (“Se [gatilho], então [ação]”) |
| `createdAt` | timestamp_ms | not null |
| `archivedAt` | timestamp_ms | null = ativo |

**`habitEntries`** (o `registros` do briefing; vira a base das métricas JSON na fatia 2 — ADR 0008)

| Coluna | Tipo | Regra |
|---|---|---|
| `id` | text PK | `crypto.randomUUID()` |
| `habitId` | text FK → `habits.id` | not null |
| `date` | text | not null, `YYYY-MM-DD` (dia local do servidor) |
| `createdAt` | timestamp_ms | not null |

- **Unique** (`habitId`, `date`): no máximo um registro por hábito por dia.
- **Índice** em `date` para as consultas do mês.
- Sem tabela de métricas agora (fatia 2 adiciona `metrics` JSON aqui — ADR 0008).

### Regras de domínio (funções puras em `src/lib/habits/domain.ts` + `dates.ts`)

- **Dia local:** a referência é o dia local do servidor; datas são strings `YYYY-MM-DD` (helpers próprios; **nunca** `toISOString`, que é UTC).
- **Hábito ativo no dia D:** `localDate(createdAt) ≤ D` e (`archivedAt` nulo ou `localDate(archivedAt) > D`).
- **Dia concluído:** existe `habitEntry` para o hábito em D.
- **Consistência do dia:** concluídos ÷ ativos naquele dia; dias sem hábito ativo são neutros.
- **Dias elegíveis de um hábito:** de `localDate(createdAt)` até hoje, descontando dias ≥ `localDate(archivedAt)` se arquivado.
- **Backfill:** permitido apenas em dias elegíveis e nunca no futuro.
- **Arquivar/reativar:** escreve/limpa `archivedAt`; nada é apagado (ADR 0017).
- **Paleta fixa (8 cores)** em `src/lib/habits/colors.ts`: `green`, `blue`, `purple`, `pink`, `orange`, `yellow`, `teal`, `red` — cada uma com hex/label; usada no ponto da lista, no calendário do detalhe e no formulário.

## 4. Rotas e telas

### `/` — Home (Server Component)

1. **Gráfico da semana** (Recharts, Client Component): y = nº de hábitos concluídos no dia; x = domingo→sábado da semana atual; desenha só até hoje (a linha “cresce” com a semana); tooltip com “X de Y hábitos”.
2. **Calendário do mês** (grade 7 colunas desenhada à mão, Client Component): intensidade da cor primária por fração concluída — 0 → neutro; (0, 50%) → tom leve; [50%, 100%) → tom médio; 100% → tom forte; hoje com destaque; dias futuros e dias antes do primeiro hábito desabilitados. Clicar num dia abre o **painel do dia**.
3. **Painel do dia** (Sheet): título com a data por extenso (pt-BR); lista dos hábitos ativos naquele dia com toggle; mensagem acolhedora se não houver hábito ativo.
4. **Lista de hábitos ativos** (ordem de criação): ponto de cor + nome + alvo de toque para marcar **hoje** (otimista; segundo toque desfaz); tocar no nome abre `/habits/[id]`; botão **“Adicionar hábito”** abre o dialog de formulário (nome, cor, intenção).
5. **“Arquivados (n)”** colapsado no fim: cada item linka para o detalhe e tem botão **Reativar**.
6. Estado vazio (sem hábitos): convite acolhedor para criar o primeiro hábito.

### `/habits/[id]` — Detalhe (Server Component)

- Cabeçalho: ponto de cor + nome + intenção (se houver).
- Estatísticas: “Este mês: X/Y dias” e “Desde a criação: X/Y dias”, com X = registros feitos e Y = dias elegíveis (dias em que o hábito estava ativo, até hoje; no mês, recortado pelo mês) — sem streak.
- **Calendário do mês do hábito** (binário: feito / não feito / fora do período), clicável para registrar/desfazer dias elegíveis — alterna direto, sem confirmação.
- Ações: **Editar** (dialog) e **Arquivar** (com confirmação) — ou **Reativar**, se arquivado.

Sem bottom nav na fatia 1 (home + detalhe bastam). Componentes em `src/components/habits/`.

## 5. Fluxos, validação e erros

### Leitura — `src/lib/habits/queries.ts` (Server Components)

Todas escopadas por `userId`; retornam linhas cruas e o cálculo (grade do mês, série da semana, estatísticas) fica nas funções puras:

- `listHabits(db, userId, { includeArchived })`
- `getHabit(db, userId, habitId)`
- `listEntriesBetween(db, userId, startDate, endDate)`
- `listHabitEntries(db, userId, habitId, startDate, endDate)`

### Mutações — `src/lib/habits/actions.ts` (`"use server"`)

- `createHabit(input)`, `updateHabit(id, input)`, `setArchived(id, archived)`, `setEntry(habitId, date, done)`.
- `setEntry` é **explícito (set, não toggle)** — idempotente sob toque duplo: `done=true` faz insert com `onConflictDoNothing`; `done=false` faz delete.
- Toda action passa por um wrapper que resolve a sessão com `getSessionOrNull()` (`src/lib/session.ts`) e devolve `{ ok: false, error }` quando não há usuário (a proteção do route group não cobre actions), e valida com zod (`src/lib/habits/schemas.ts`): nome 1–60 (trim), cor no enum da paleta, intenção ≤ 280; `date` no formato `YYYY-MM-DD`, nunca futura, nunca antes da criação, só em dia ativo do hábito.
- Retornam `{ ok: true } | { ok: false, error: string }` — nenhuma exceção vaza para a UI.
- Após sucesso, `revalidatePath("/")` e/ou `revalidatePath("/habits/[id]")`.
- A lógica de negócio fica em `src/lib/habits/service.ts` (recebe `db` + `userId`), testável sem request; `actions.ts` é a casca fina (sessão + zod + revalidate).

### Interação no cliente

- Toggles com `useOptimistic` + `useTransition`: responde na hora; em falha, reverte e mostra mensagem inline no contexto (sem lib de toast).
- Datas calculadas **no servidor** e passadas como props (o cliente nunca calcula “hoje”).
- Dialogs de criar/editar com estado local, botão desabilitado durante o envio e erro inline.

### Casos-limite

- Hábito arquivado some da home e do painel do dia (para dias ≥ arquivamento), mas preserva registros e histórico no detalhe.
- Backfill fora do intervalo: dia desabilitado na UI **e** rejeitado na action (defesa em profundidade).
- Sessão expirada: action retorna erro de sessão; o layout protegido redireciona para `/login` no próximo render.
- Nomes duplicados permitidos (YAGNI).
- Virada de meia-noite: a página calcula “hoje” no render do servidor; se o app ficar aberto na virada, o próximo `revalidate`/refresh corrige.

## 6. Dependências

- **`recharts`** (gráfico da semana — decisão do briefing §9).
- Componentes shadcn/ui: `dialog`, `sheet`, `button`, `input`, `label`, `textarea` (a seção de arquivados usa um disclosure simples com estado local).
- **Sem** biblioteca de datas (helpers com `Intl` pt-BR bastam) e **sem** lib de toast.

## 7. Testes

- **Unit (Vitest, sem banco):** datas (`dates.ts`: dia local, grade do mês com 28/30/31 dias e virada de ano, semana domingo→sábado) e domínio (`domain.ts`: ativo-no-dia, consistência, dias elegíveis, backfill válido/inválido) + schemas zod (nome vazio/longo, data malformada/futura/antes da criação, cor inválida).
- **Integração (Vitest + SQLite temp + migrations):** serviço com banco real — criar/editar/arquivar/reativar; `setEntry` idempotente (marcar 2× = 1 registro; desmarcar 2× = 0); unique (`habitId`, `date`); escopo por `userId`; arquivado fora do denominador; backfill rejeitado fora do intervalo. Actions: teste com `vi.mock` de `@/lib/session` e `next/cache` provando que sem sessão falha e que zod rejeita entrada inválida.
- **E2E (Playwright, porta 3210, banco `data/e2e.db`):** login → criar hábito → marcar hoje → conferir lista, calendário e gráfico → abrir detalhe → registrar ontem (backfill) → editar → arquivar → reativar; home vazia mostra estado vazio.
- **`seed:demo`:** teste de integração (cria hábitos/registros uma única vez; rodar 2× não duplica).

## 8. Critérios de conclusão (DoD)

- [x] Schema + migration versionada; `npm run db:migrate` aplica limpo em clone.
- [x] CRUD completo (criar/editar/arquivar/reativar) na UI e coberto por testes.
- [x] Registro rápido de 1 toque com atualização otimista e reversão em erro.
- [x] Backfill limitado (criação → hoje), na home e no detalhe, com defesa na action.
- [x] Home com gráfico da semana, calendário de intensidade, painel do dia, lista e arquivados.
- [x] Detalhe com calendário, estatísticas, editar/arquivar/reativar.
- [x] `npm run seed:demo` idempotente.
- [x] Actions protegidas por sessão (teste prova a rejeição sem sessão).
- [x] CI verde (lint/format/typecheck/test/build/guardrail) e e2e local verde.
- [x] ADRs 0017/0018 escritas; docs atualizados; DoD desta spec marcado.

## 9. ADRs novas

- **ADR 0017 — Hábitos são arquivados, nunca deletados.** Contexto: parar um hábito é comum e apagar o histórico destruiria a série de consistência. Decisão: `archivedAt` (reativável); sem delete na UI nem nas actions. Consequências: histórico íntegro; “erro de criação” se resolve editando/arquivando; sem limpeza definitiva (aceitável para uso pessoal).
- **ADR 0018 — Registro identificado pelo dia local (`YYYY-MM-DD`).** Contexto: consistência é por dia; UTC causaria virada às 21h no horário de Brasília. Decisão: `date` text com o dia local do servidor, gerado por helpers próprios. Consequências: consultas simples e estáveis (sem fuso no banco); se o app for usado em outro fuso, a referência muda com o servidor (aceitável — self-hosted).

## 10. Riscos

| Risco | Mitigação |
|-------|-----------|
| Virada de meia-noite com app aberto | “Hoje” é calculado no servidor a cada render/revalidate; UI nunca calcula data |
| Denominador do passado mudar ao criar/arquivar hoje | Regra “ativo no dia D” é retroativa por construção: criar hoje não muda o passado; arquivar hoje não apaga dias anteriores |
| Toque duplo rápido no toggle | `setEntry(…, done)` explícito + unique constraint (idempotente) |
| Recharts × React 19/Next 16 | Fixar versão compatível no plano; gráfico isolado num Client Component com fallback simples se necessário |
| Acessibilidade/contraste do calendário | Rótulos `aria-label` por dia, intensidade com contraste mínimo e legenda textual nos tooltips |
| Escopo crescer (métricas, 2 Dias) | Lista YAGNI explícita + fatia 2 com spec própria |

## 11. Próximos passos

1. Criador revisa esta spec.
2. Aprovada → skill `writing-plans` gera o plano de implementação do Ciclo 2.
3. Execução com TDD e commits atômicos.
4. Fatia 2: spec própria (métricas quantitativas, Regra dos 2 Dias + Floor Plan, check-in emocional, histórico).
