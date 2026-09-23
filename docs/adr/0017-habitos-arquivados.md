# ADR 0017: Hábitos são arquivados, nunca deletados

- **Status:** Aceito
- **Data:** 2026-09-23

## Contexto

Parar com um hábito é comum (mudança de rotina), mas apagar o histórico destruiria a série de consistência — que é justamente o valor do app. Erros de criação também precisam de conserto.

## Decisão

Hábitos têm `archivedAt` (reativável) e não existe exclusão na UI nem nas actions; um hábito criado por engano se resolve editando ou arquivando.

## Consequências

Histórico e calendário permanecem íntegros; dias anteriores ao arquivamento continuam contando e o hábito some das listas/dia a partir do arquivamento. Não há limpeza definitiva — aceitável para uso pessoal.
