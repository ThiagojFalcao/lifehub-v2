# ADR 0009: Tabela própria diária de check-in emocional

- **Status:** Aceito
- **Data:** 2026-09-21

## Contexto

O humor do dia é independente de qualquer hábito, mas precisa ser cruzado com a consistência em análises futuras.

## Decisão

Criar uma tabela própria `checkins_emocionais(data, humor 1-5, tags, nota)`, separada dos registros de hábito.

## Consequências

Check-in não exige hábito cadastrado e o cruzamento humor × consistência fica direto por data. É mais uma entidade no schema e na UI; um dia sem check-in é simplesmente ausência de linha.
