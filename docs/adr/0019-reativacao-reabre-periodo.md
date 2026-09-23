# ADR 0019: Reativação reabre o período arquivado

- **Status:** Aceito
- **Data:** 2026-09-23

## Contexto

O arquivamento usa um único `archivedAt` por hábito (spec §3, ADR 0017), sem registro dos períodos em que o hábito ficou pausado. Ao reativar, os dias entre o arquivamento e a reativação voltam a contar como ativos: entram no denominador das métricas e aceitam backfill, como se o hábito nunca tivesse sido arquivado.

## Decisão

Aceitar o modelo de `archivedAt` único como está. Reativar um hábito reabre o período arquivado; não haverá múltiplos períodos de arquivamento no Ciclo 2.

## Consequências

Arquivar e reativar é fluxo raro no uso pessoal, e a alternativa (tabela de períodos de arquivamento) adiciona complexidade de schema e de cálculo sem dor comprovada. Se o fluxo se mostrar incômodo na prática, períodos de arquivamento próprios ficam deferidos para o Ciclo 3.
