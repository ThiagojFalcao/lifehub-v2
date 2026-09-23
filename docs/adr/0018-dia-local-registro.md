# ADR 0018: Registro identificado pelo dia local (`YYYY-MM-DD`)

- **Status:** Aceito
- **Data:** 2026-09-23

## Contexto

A consistência é por dia. Guardar timestamps UTC faria a virada do dia acontecer às 21h no horário de Brasília, embaralhando registros da noite.

## Decisão

O campo `date` de `habit_entries` é texto `YYYY-MM-DD` no dia local do servidor, gerado por helpers próprios (`src/lib/habits/dates.ts`); nunca `toISOString`.

## Consequências

Consultas por intervalo são comparações de string (simples e estáveis) e o fuso do banco não existe. Se o app for usado em outro fuso, a referência acompanha o servidor — aceitável para um app self-hosted de um usuário.
