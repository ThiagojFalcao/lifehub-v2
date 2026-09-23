# ADR 0011: `npm run start` manual; serviço Windows só se houver fricção

- **Status:** Aceito
- **Data:** 2026-09-21

## Contexto

Rodar o app como serviço do Windows (inicialização automática, restart) adiciona configuração e pontos de falha; no MVP, a máquina é de uso pessoal e ligada quando necessário.

## Decisão

Subir o app manualmente com `npm run start`; criar serviço Windows apenas se a fricção de subir à mão aparecer.

## Consequências

Zero configuração de sistema no MVP. Após reiniciar a máquina, o app fica fora até alguém rodar o comando — aceitável agora, documentado no runbook.
