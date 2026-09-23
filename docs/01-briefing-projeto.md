# LifeHub — Briefing Completo do Projeto

> Documento de contexto para IA subsequente. Contém: base científica, visão do criador, decisões de design, escopo do MVP e próximos passos.

---

## 1. O que é o LifeHub

**LifeHub** é um sistema pessoal de progressão de vida com 3 camadas:

```
┌─────────────────────────────────────────────────────────┐
│  CAMADA 3: IDENTIDADE (longo prazo — meses/anos)        │
│  "Quem eu estou me tornando"                            │
│  → Árvore de habilidades: Analista JR → Pleno → Sênior  │
│  → Projeto prático como "trava" de cada nível           │
├─────────────────────────────────────────────────────────┤
│  CAMADA 2: CONSISTÊNCIA (médio prazo — semanas/meses)   │
│  "O que eu faço com regularidade"                       │
│  → Hábitos: acordar cedo, exercício, leitura, dieta     │
│  → Sono (automático via relógio), passos, BPM           │
├─────────────────────────────────────────────────────────┤
│  CAMADA 1: AÇÃO (curto prazo — hoje)                    │
│  "O que eu faço agora"                                  │
│  → Registro rápido do dia (binário + métricas opcionais)│
│  → Check-in emocional ("como me sinto?")                │
└─────────────────────────────────────────────────────────┘
```

**Filosofia:** Hábitos são infraestrutura (suporte), estudos são o núcleo (fim). O usuário está se tornando "analista de dados com hábitos enraizados" (identidade), não apenas "tentando criar hábitos".

---

## 2. Base Científica (Resumo Executivo)

### 10 Achados Mais Fortes

| # | Achado | Força | Implicação para LifeHub |
|---|--------|-------|------------------------|
| 1 | **Implementation Intentions (If-Then)** — d=0.65, 642 testes | Consenso | Hábitos = "Se [gatilho], Então [ação]". App deve permitir planos If-Then vinculados a contexto (horário, local, emoção). |
| 2 | **Goal Setting Theory** — 40+ anos, d=0.52-0.82 | Consenso | Metas específicas + desafiadoras + feedback sumário superam "faça o seu melhor" em 90% dos casos. |
| 3 | **Wanting vs. Liking (Dopamina)** — circuitos dissociáveis | Consenso neuro | App deve gerar wanting (pistas visuais) mas entregar liking real (progresso genuíno). Não inflar wanting sem entregar liking. |
| 4 | **SDT & Overjustification Effect** | Consenso | Recompensas extrínsecas (XP, pontos) REDUZEM motivação intrínseca quando são controladoras. Devem ser informativas, não condicionantes. |
| 5 | **Supportive Accountability** — 76% vs 43% | Estudo específico | Compartilhar progresso aumenta drasticamente taxas de sucesso. Comunidade > solo tracking. |
| 6 | **Small Wins / Progress Principle** | Consenso | Maior fator de motivação = vivenciar pequenos avanços. Dashboard deve destacar consistência, não perfeição. |
| 7 | **Desconto Temporal Hiperbólico** | Consenso | Cérebro prefere recompensas imediatas. Aproximar feedback (small wins) + commitment devices (decisões pré-travadas). |
| 8 | **Mito dos 21 Dias** — 2-5 meses (4 a 335 dias) | Consenso | NÃO prometer "21 dias". Comunicar que formação de hábito é processo longo. |
| 9 | **Streaks são prejudiciais** — "law of attrition" | Contestado (eHealth) | Streaks rígidos geram quebra → vergonha → abandono. Implementar "Regra dos 2 Dias" + "Floor Plan". |
| 10 | **White-Hat vs. Black-Hat Gamification** | Modelo de autor | White-Hat (autonomia, maestria, significado) = sustentável. Black-Hat (escassez, perda, imprevisibilidade) = manipulação. |

### TDAH/Neurodivergência (14 fontes adicionadas)

| Achado | Implicação |
|--------|-----------|
| **Barkley:** TDAH é déficit de intenção, não atenção. Cegueira temporal ("Agora" vs. "Não-Agora"). Habit loop clássico falha. | Externalizar funções executivas no ambiente (prótese: lembretes visuais, temporizadores no point of performance). |
| **P.I.N.C.H.:** Cérebro TDAH movido por Paixão, Interesse, Novidade, Desafio, Urgência — não por importância/prioridade. | Ancorar motivação em P.I.N.C.H. Design flexível (não rotinas rígidas). |
| **Body Doubling:** Presença paralela (humano/IA/VR) reduz esforço de iniciar tarefa. Ara et al. (2025) confirma com IA. | Salas de co-working virtual com pares ou IA não-julgadora. |
| **RSD (Rejection Sensitive Dysphoria):** Dor emocional catastrófica diante de críticas reais ou PERCEBIDAS. | Design não-punitivo. NUNCA: "você falhou", "sequência quebrada", vermelho ostensivo. SEMPRE: linguagem acolhedora. |
| **UX Neuroafirmativa (CHI 2026, WCAG 2.2):** Focus Mode, chunking, temporizadores visuais, baixo ruído. | Eliminar pop-ups, animações distrativas. Progressive Disclosure. |

### Anti-Padrões a Evitar

1. **Sunk Cost Prison** — streaks rígidos que zeram, perda de progresso acumulado
2. **Reforço Variável Exploratório** — recompensas imprevisíveis (vício)
3. **Aversão à Perda Punitiva** — penalidades por falha, mensagens de culpa
4. **Comparação Social Tóxica** — leaderboards sem opt-in
5. **Ansiedade Quantitativa** (34% dos usuários de wearables) — monitorar >3 indicadores
6. **Dark Patterns** — qualquer mecânica que não passe no Teste de Endosso Reflexivo
7. **Design punitivo que aciona RSD** — "você falhou", notificações de sequência quebrada

---

## 3. Visão do Criador (Entrevista)

### Contexto Pessoal
- Estudando para entrar na área de dados (análise de dados)
- Tem relógio inteligente (captura sono, BPM, passos, atividades físicas)
- Tem TDAH (mencionado no notebook secundário "Projeto lifehub")
- Quer desenvolver o projeto para uso pessoal primeiro

### Hábitos Iniciais
- **Prioridade 1 (primeiros 30 dias):** Acordar cedo + Exercício físico (qualquer um)
- **Adicionar gradualmente:** Leitura, estudar, dieta, sono (automático via relógio)
- **Filosofia:** "Começar muitos, mas ter constância no que faço"

### Registro de Dados
- **Binário:** Fiz/não fiz (ex: beber 4L de água)
- **Quantitativo rápido:** Tipo + duração (ex: "corrida, 30min")
- **Quantitativo detalhado (seletivo):** Exercício = músculo + séries + reps + kg; Leitura = páginas + título; Dieta = o que comeu + % de adesão + peso corporal
- **Automático (relógio):** Sono (horas + qualidade), passos, BPM, atividades físicas

### Visualização
- Dashboard principal com gráfico de consistência semanal (pode alterar para mensal)
- Clicar em hábito → abre detalhes com evolução (performance ao longo do tempo)
- Calendário visual tipo GitHub (quadradinhos coloridos por dia)
- Histórico temporal: semanal, mensal, trimestral, semestral, anual

### Gamificação / RPG
- Nível 0 → Analista de Dados JR → Pleno → Sênior
- Árvore de habilidades baseada em roadmap.sh + vagas do mercado
- Projeto prático como "trava" para subir de nível
- XP como feedback informativo (não controlador)

### Reação a Falhas
- **Abordagem aprovada:** Silêncio (dia 1) → Análise de padrão (dia 2-3) → Pergunta diagnóstica (dia 3+)
- Exemplo: "Você falhou 3 dias seguidos. Padrão detectado: terças e quintas. Quer ajustar a meta?"

### Objetivo de 6 Meses
"Quero me ver um analista de dados, com muita bagagem, e hábitos enraizados."

---

## 4. Decisões de Design (Baseadas em Ciência)

### 4.1. Sistema de Hábitos
- **Implementation Intentions:** Cada hábito = "Se [gatilho], Então [ação]"
- **WOOP para novos hábitos:** Wish → Outcome → Obstacle → Plan (If-Then)
- **Floor Plan:** Versão mínima (2-10 min) para dias difíceis
- **Regra dos 2 Dias:** "Se falhei ontem, Então devo executar hoje"

### 4.2. Dashboard
- **Camada 1 (Home):** Gráfico de consistência semanal (quadradinhos tipo GitHub)
- **Camada 2 (Detalhe do hábito):** Gráfico de evolução (performance ao longo do tempo)
- **Métricas:** Máximo 2-3 por hábito (evitar ansiedade quantitativa)
- **Check-in emocional:** "Como você está se sentindo?" antes de mostrar métricas

### 4.3. Árvore de Habilidades (Estudos)
- **Referência:** roadmap.sh + vagas do mercado (LinkedIn, etc.)
- **Estrutura:** Nível 0 → JR (projeto prático como trava) → Pleno → Sênior
- **XP:** Feedback informativo de progresso, não recompensa controladora
- **Escopo inicial:** Mapear apenas nível JR. Só mapear Pleno quando chegar lá.

### 4.4. Integração com Relógio
- **Automático:** Sono (horas + qualidade), passos, BPM, atividades físicas
- **Manual:** Treino (exercício, séries, reps, kg), leitura (páginas, título), dieta (refeições, % adesão, peso)

### 4.5. Tom de Voz / Microcopy
- **Acolhedor, empático, não-julgador**
- ✅ "Hoje foi um dia difícil. Amanhã é uma nova oportunidade."
- ✅ "15/20 dias neste mês — você está construindo consistência!"
- ❌ "Você quebrou sua sequência de 15 dias!"
- ❌ "Você falhou 5 dias este mês."

---

## 5. Escopo do MVP (2 Semanas)

### Semana 1: Fundação
- [ ] Schema do banco de dados: tabelas `habitos`, `registros`, `metricas`
- [ ] CRUD de hábitos (criar, editar, deletar)
- [ ] Registro rápido (binário: fiz/não fiz)
- [ ] Dashboard simples com gráfico de consistência semanal

### Semana 2: Refinamento
- [ ] Adicionar 1-2 métricas quantitativas por hábito (ex: exercício = tipo + duração)
- [ ] Histórico temporal (filtrar por semana/mês)
- [ ] Sistema de recuperação (Regra dos 2 Dias + Floor Plan)
- [ ] Check-in emocional ("como se sente?")

### Pós-MVP (Semana 3+)
- [ ] Adicionar hábitos gradualmente (dieta, sono, leitura)
- [ ] Integração com relógio (API para sono, passos, BPM)
- [ ] Começar mapeamento do nível JR (roadmap.sh)
- [ ] Árvore de habilidades de estudos
- [ ] Sistema de XP/níveis (feedback informativo)

---

## 6. Riscos e Mitigações

| Risco | Mitigação |
|-------|-----------|
| **Escopo creep no MVP** | Limitar a 2 hábitos + 1 gráfico simples. Adicionar complexidade depois. |
| **Ansiedade quantitativa** | Máximo 2-3 métricas por hábito. Perguntar "como se sente?" antes de mostrar números. |
| **Abandono pós-falha** | Regra dos 2 Dias + Floor Plan + linguagem acolhedora. NUNCA zerar progresso. |
| **Árvore de habilidades vira Sunk Cost Prison** | Mapear apenas próximo nível. XP como feedback, não recompensa. |
| **TDAH — fricção excessiva** | Registro rápido (30 seg) para maioria. Detalhado apenas para hábitos específicos. |

---

## 7. Próximos Passos Concretos para a Próxima IA

1. **Definir schema do banco de dados** (tabelas, campos, relacionamentos) para MVP
2. **Criar CRUD de hábitos** (criar, listar, editar, deletar)
3. **Implementar registro rápido** (binário + métricas opcionais)
4. **Construir dashboard** com gráfico de consistência semanal
5. **Adicionar histórico temporal** (filtrar por semana/mês)
6. **Implementar sistema de recuperação** (Regra dos 2 Dias + Floor Plan)

---

## 8. Referências Científicas Completas

Documento completo em: `docs/pesquisa-cientifica.md` (646 linhas, 11.913 palavras, 85.094 caracteres)

Principais referências:
- Gollwitzer & Sheeran (2006, 2024) — Implementation Intentions, d=0.65, 642 testes
- Locke & Latham (1990-2019) — Goal Setting Theory, 40+ anos, 40.000+ participantes
- Deci & Ryan (1985-2017) — Self-Determination Theory, 40+ anos
- Mohr et al. (2011); Matthews (2015) — Supportive Accountability, 76% vs 43%
- Yu-kai Chou (2003-2026) — Octalysis, 3.700+ citações
- Barkley (2012-2018) — TDAH, funções executivas, cegueira temporal
- Ara et al. (2025) — Body Doubling com IA/VR, ACM/CHI
- NAMI RSD Toolkit (2024) — Rejection Sensitive Dysphoria
- JMIR (2025) — Ansiedade quantitativa, 34% dos usuários de wearables
- Amabile & Kramer (2011) — Progress Principle, small wins

---

## 9. Decisões Técnicas (Sessão de Design — 2026-09-21)

| # | Decisão | Escolha | Racional |
|---|---------|---------|----------|
| 1 | Forma do MVP | Web app responsivo / PWA | Único codebase, registro de 30s no celular, integração com relógio não bloqueia |
| 2 | Stack | Next.js (TypeScript), um codebase (frontend + API) | Simplicidade, PWA nativo, evolui sem reescrita |
| 3 | Banco de dados | SQLite + Drizzle ORM, arquivo local na máquina | Zero infraestrutura, backup trivial, portável para Postgres no futuro |
| 4 | Hospedagem | Self-hosted na máquina do criador, gratuito | Dados sensíveis (saúde, emoções, TDAH) permanecem locais |
| 5 | Auth | Better Auth com 1 conta única (criador, signup desabilitado), sessão via cookie; sem RLS (não se aplica a SQLite) | Auth.js v5 em beta prolongado; Better Auth é estável (v1+), TS-first, com adapter Drizzle e hash de senha embutido. Protege dados sem custo de multi-tenant |
| 6 | Acesso pelo celular | Tailscale | Registro funciona fora de casa, sem exposição pública |
| 7 | Offline | Online-only no MVP; fila de sync só no pós-MVP se virar dor real | Protege o prazo de 2 semanas |
| 8 | Modelo de métricas | JSON flexível em `registros` (suporta binário, quantitativo rápido e detalhado) | Evita colunas nulas e EAV; SQLite consulta via `json_extract()` |
| 9 | Check-in emocional | Tabela própria diária `checkins_emocionais(data, humor 1-5, tags, nota)` | Independente de hábitos; permite cruzar humor × consistência (análise futura) |
| 10 | Prioridade de corte (Semana 2) | Corta histórico temporal e métricas primeiro; Regra dos 2 Dias + Floor Plan + check-in ficam até o fim | Recuperação e camada emocional carregam a filosofia anti-RSD |
| 11 | Disponibilidade do host | `npm run start` manual por enquanto; serviço Windows só se a fricção aparecer | Zero configuração no MVP |
| 12 | Relógio | Samsung Galaxy Fit 3 → Samsung Health; pós-MVP via Health Connect ou export CSV manual; sem tabelas reservadas | Baixa prioridade, confirmada pelo criador |

### Decisões menores (fechadas por padrão)

- Nome do repo/projeto: `lifehub-v2` (público no GitHub, licença MIT — ver §10)
- UI em pt-BR
- Calendário da home: grade do mês compacta, dias coloridos por conclusão (decisão de 2026-09-23; ver §10)
- Gráfico de evolução do hábito: Recharts
- Componentes: shadcn/ui
- Repositório Git desde o dia 1
- Node 24 LTS (fallback para 22 se algum módulo nativo reclamar)

### Processo de desenvolvimento

- **Skill de processo:** `superpowers` — brainstorming → spec → `writing-plans` → execução com TDD (decisão revisada em 2026-09-23; `tlc-spec-driven` descartado por sobreposição)
- **Skill de design:** `frontend-design` na fase de design das telas (o briefing citava `awesome-design`, que não existe neste ambiente)
- **Estratégia (greenfield):** 3 ciclos — 1) Fundação (repo/docs/CI/scaffold/backup), 2) MVP fatia 1 (schema, CRUD, registro, dashboard), 3) MVP fatia 2 (métricas, Regra dos 2 Dias/Floor Plan, check-in emocional). Cada ciclo com spec e plano próprios
- **Primeiro artefato:** spec do Ciclo 1 → plano → execução

---

## 10. Refinamentos de Produto e Decisões da Sessão (2026-09-23)

### Escopo do primeiro build
- Construir **somente o habit tracker** primeiro; gamificação (XP/níveis) e árvore de habilidades ficam para depois do MVP.
- Construção incremental — nada de "tudo de uma vez".

### Home (esboço do criador)
- **Gráfico de linha no centro** que se constrói com os dados: y = nº de hábitos concluídos no dia; x = dias da semana; a linha cresce conforme a semana avança.
- **Calendário de mês compacto** em uma parte da página, com dias coloridos conforme a conclusão (prevalece sobre os "quadradinhos estilo GitHub" da §4.2 para a home).
- **Botão para adicionar hábito** + lista de hábitos.

### Detalhe do hábito
- Página com o histórico do hábito isolado (dados salvos mostram só ele).

### Dados de demonstração
- Seed/demo para dar noção visual enquanto o projeto é construído (os dados de hábitos entram junto com o schema, no Ciclo 2).

### Decisões desta sessão (complementares à §9)

| # | Decisão | Escolha |
|---|---------|---------|
| 13 | Visibilidade do repo | Público (portfólio), licença MIT; nunca commitar dado pessoal |
| 14 | Backup | Automático diário (`VACUUM INTO` + `integrity_check`, retenção 30 diários + 12 mensais) + cópia externa da pasta `backups/` |
| 15 | Sequência de construção | 3 ciclos: Fundação → MVP fatia 1 → MVP fatia 2 (spec/plano por ciclo) |

---

**Última atualização:** 2026-09-23
**Status:** Spec do Ciclo 1 (Fundação) escrita — aguardando revisão do criador
**Próximo passo:** Revisar a spec → plano de implementação (superpowers: `writing-plans`) → execução.
