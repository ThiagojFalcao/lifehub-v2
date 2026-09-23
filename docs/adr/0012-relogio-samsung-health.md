# ADR 0012: Relógio Samsung Health via Health Connect/CSV, pós-MVP

- **Status:** Aceito
- **Data:** 2026-09-21

## Contexto

O criador usa um Galaxy Fit 3 que sincroniza com o Samsung Health; a integração é útil, mas de baixa prioridade e sem API oficial simples.

## Decisão

Integrar apenas pós-MVP, via Health Connect ou export CSV manual do Samsung Health, sem reservar tabelas agora.

## Consequências

MVP sem dependência de plataforma de terceiros; a importação futura entra como feature isolada. O formato de importação precisará de spec própria quando chegar.
