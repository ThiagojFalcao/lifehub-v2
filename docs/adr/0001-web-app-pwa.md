# ADR 0001: Web app responsivo / PWA com codebase único

- **Status:** Aceito
- **Data:** 2026-09-21

## Contexto

O registro de hábitos precisa levar ~30 segundos no celular e também funcionar no desktop. Manter apps nativos separados multiplicaria o esforço, e a integração com o relógio não pode bloquear o MVP.

## Decisão

Construir um único web app responsivo, instalável como PWA.

## Consequências

Um só código para manter e evoluir; acesso pelo navegador (local e via Tailscale). Sem presença em lojas de apps — a instalação é via "Adicionar à tela inicial"; PWA instalável exige HTTPS, suprido pelo Tailscale no celular.
