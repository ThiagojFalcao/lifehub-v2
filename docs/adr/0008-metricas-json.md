# ADR 0008: Métricas em JSON flexível validado por zod

- **Status:** Aceito
- **Data:** 2026-09-21

## Contexto

Hábitos têm formas de registro diferentes (binário, quantitativo rápido, quantitativo detalhado); colunas fixas gerariam muitas colunas nulas e um modelo EAV seria trabalhoso.

## Decisão

Guardar as métricas de cada registro em um campo JSON flexível (SQLite, consultável via `json_extract()`), com o formato validado por zod na aplicação.

## Consequências

Schema simples que acomoda novos tipos de métrica sem migration. A validação vive na aplicação (o banco não garante a forma do JSON); consultas analíticas ficam um pouco mais verbosas.
