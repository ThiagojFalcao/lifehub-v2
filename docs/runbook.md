# Runbook — LifeHub V2

Operação do app no servidor local (máquina do criador, Windows).

## Backup

- **Manual:** `npm run backup` → gera `backups/lifehub-AAAAMMDD-HHmmss.db` (`VACUUM INTO` + `PRAGMA integrity_check`) e registra em `backups/backup.log`.
- **Agendado:** tarefa **"LifeHub Backup"** no Task Scheduler do Windows, diária às 22:00:

```powershell
schtasks /Create /TN "LifeHub Backup" /TR "cmd /c cd /d C:\Users\Usuario\Documents\LifeHubV2 && npm run backup" /SC DAILY /ST 22:00 /F
```

- **Retenção:** 30 backups diários + o primeiro de cada um dos últimos 12 meses; o resto é apagado automaticamente.
- **Cópia externa:** sincronizar a pasta `backups/` (OneDrive/Google Drive) ou copiar para pendrive periodicamente. **Nunca** sincronizar `data/lifehub.db` ao vivo.

## Restore

1. Pare o app (Ctrl+C no `npm run start`/`npm run dev`).
2. Copie o backup desejado por cima do banco:

```powershell
Copy-Item backups\lifehub-AAAAMMDD-HHmmss.db data\lifehub.db -Force
```

3. Suba o app de novo (`npm run start`).

**Teste de restore realizado em 2026-09-23** (backup `lifehub-20260923-152028.db`): `integrity: ok`, `users: 1`.

Procedimento de verificação usado:

```powershell
$latest = (Get-ChildItem backups\lifehub-*.db | Sort-Object LastWriteTime -Descending | Select-Object -First 1).FullName
Copy-Item $latest data\restore-test.db
node -e "const D=require('better-sqlite3');const db=new D('data/restore-test.db',{readonly:true});console.log('integrity:', db.pragma('integrity_check',{simple:true}));console.log('users:', db.prepare('select count(*) as c from user').get().c);"
Remove-Item data\restore-test.db
```
