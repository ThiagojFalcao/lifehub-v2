# ADR 0005: Better Auth com conta única e signup desabilitado

- **Status:** Aceito
- **Data:** 2026-09-21

## Contexto

O app é de um único usuário, mas precisa de sessão protegida para não expor dados pessoais a quem alcançar a URL.

## Decisão

Usar Better Auth com email/senha, exatamente 1 conta criada por seed e `disableSignUp: true`; sessão via cookie, sem RLS (não se aplica a SQLite).

## Consequências

Proteção sem custo de multi-tenant e sem fluxo de cadastro público. O usuário é criado por `npm run seed`; recuperação de senha não existe — redefinir exige rodar o seed de novo ou alterar o banco.
