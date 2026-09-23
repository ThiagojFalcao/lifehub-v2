# ADR 0007: Online-only no MVP

- **Status:** Aceito
- **Data:** 2026-09-21

## Contexto

Uma fila de sincronização offline é complexa (conflitos, versionamento) e não é necessária enquanto o registro acontece em casa ou com Tailscale ativo.

## Decisão

Manter o MVP online-only; fila de sync offline só no pós-MVP, se virar dor real.

## Consequências

Escopo protegido e menos bugs de consistência. Sem internet (ou Tailscale fora), o registro fica indisponível — mitigável no futuro sem mudança de schema.
