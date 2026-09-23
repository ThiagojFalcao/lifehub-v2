# ADR 0014: Backup diário automático com retenção 30d/12m + cópia externa

- **Status:** Aceito
- **Data:** 2026-09-23

## Contexto

Os dados vivem num único arquivo SQLite numa única máquina; sem backup, uma falha de disco apaga o histórico inteiro.

## Decisão

Backup diário às 22:00 via Task Scheduler executando `npm run backup` (`VACUUM INTO` + `PRAGMA integrity_check`), com retenção de 30 backups diários + o primeiro de cada um dos últimos 12 meses, e cópia externa periódica da pasta `backups/`.

## Consequências

Recuperação point-in-time de até 30 dias, com backups antigos mensais preservados; o restore foi testado de verdade (registro no runbook). O backup fica na mesma máquina até a cópia externa acontecer — sincronizar `data/lifehub.db` ao vivo continua proibido.
