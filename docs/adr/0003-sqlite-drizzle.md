# ADR 0003: SQLite + Drizzle ORM com arquivo local

- **Status:** Aceito
- **Data:** 2026-09-21

## Contexto

Os dados (hábitos, emoções, saúde) são de um único usuário e não justificam servidor de banco; o backup precisa ser trivial.

## Decisão

Usar SQLite via better-sqlite3 + Drizzle ORM, com o banco em arquivo local (`data/lifehub.db`), WAL ligado e migrations versionadas.

## Consequências

Zero infraestrutura; backup é copiar um arquivo (`VACUUM INTO`). Sem concorrência de escrita distribuída — suficiente para uso pessoal; Drizzle mantém caminho aberto para Postgres no futuro.
