# ADR 0013: Repositório público com licença MIT, sem dado pessoal

- **Status:** Aceito
- **Data:** 2026-09-23

## Contexto

O projeto pode servir de portfólio, mas o app lida com dados pessoais de saúde e emoções que jamais podem vazar.

## Decisão

Manter o repositório público sob licença MIT, com guardrail automatizado (`npm run check:data` + CI) que falha se `.env`, `data/`, `backups/` ou arquivos `.db` forem versionados.

## Consequências

Código aberto e auditável, com barreira mecânica contra vazamento acidental. O histórico do Git é público e imutável — qualquer segredo commitado por engano exige rotação imediata.
