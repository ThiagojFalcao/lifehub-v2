# ADR 0002: Stack Next.js + TypeScript com frontend e API juntos

- **Status:** Aceito
- **Data:** 2026-09-21

## Contexto

O projeto é individual e precisa de simplicidade operacional: uma única aplicação, sem infraestrutura extra de API separada.

## Decisão

Usar Next.js (App Router) com TypeScript strict, unindo frontend e API no mesmo codebase.

## Consequências

Rotas de API e server components convivem com a UI; deploy local é um só processo. Acopla a API ao framework — migrar para um backend separado no futuro exigiria refatoração.
