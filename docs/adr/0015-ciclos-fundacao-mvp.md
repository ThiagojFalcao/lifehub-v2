# ADR 0015: Três ciclos — Fundação → MVP fatia 1 → MVP fatia 2

- **Status:** Aceito
- **Data:** 2026-09-23

## Contexto

O escopo completo (tracker + gamificação + trilha de estudos) não cabe num único ciclo de duas semanas, e construir tudo de uma vez contraria a decisão de construção incremental.

## Decisão

Dividir a construção em 3 ciclos, cada um com spec e plano próprios: 1) Fundação (repo, CI, scaffold, auth, backup, docs); 2) MVP fatia 1 (schema de hábitos, CRUD, registro, dashboard); 3) MVP fatia 2 (métricas, Regra dos 2 Dias/Floor Plan, check-in emocional, histórico).

## Consequências

Cada ciclo entrega algo verificável e mantém o processo superpowers com TDD. Gamificação e trilha de estudos ficam explicitamente fora do MVP — voltam apenas depois do Ciclo 3.
