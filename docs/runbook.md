# Runbook — LifeHub V2

Operação do app no servidor local (máquina do criador, Windows).

## Pré-requisitos

- **Node 22+** e npm 10+ (na máquina do criador, o Node é gerenciado pelo Hermes em `C:\Users\Usuario\AppData\Local\hermes\node`).
- **Git** e, para operar a CI, **GitHub CLI** (`gh`) autenticado.
- Windows + PowerShell 5.1 no ambiente do criador.

## Setup

```powershell
git clone https://github.com/ThiagojFalcao/lifehub-v2.git
Set-Location lifehub-v2
npm ci
Copy-Item .env.example .env
# Gere o segredo e preencha BETTER_AUTH_SECRET, SEED_EMAIL e SEED_PASSWORD no .env:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
npm run db:migrate
npm run seed
npm run dev
```

Abra http://localhost:3000 → redireciona para `/login`; entre com o email/senha do seed.

Para rodar os testes e2e, instale o Chromium uma vez (o `npm ci` não baixa browsers — ver ADR 0016):

```powershell
npx playwright install chromium
```

## Produção local

```powershell
npm run build
npm run start
```

O app sobe em http://localhost:3000 (conforme `BETTER_AUTH_URL` no `.env`). Subida manual por decisão (ADR 0011).

## Backup

- **Manual:** `npm run backup` → gera `backups/lifehub-AAAAMMDD-HHmmss.db` (`VACUUM INTO` + `PRAGMA integrity_check`) e registra em `backups/backup.log`.
- **Agendado:** tarefa **"LifeHub Backup"** no Task Scheduler do Windows, diária às 22:00:

```powershell
schtasks /Create /TN "LifeHub Backup" /TR "cmd /c cd /d C:\Users\Usuario\Documents\LifeHubV2 && npm run backup" /SC DAILY /ST 22:00 /F
```

- **Retenção:** 30 backups diários + o primeiro de cada um dos últimos 12 meses; o resto é apagado automaticamente.

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

## Cópia externa dos backups

- Sincronizar a pasta `backups/` (OneDrive/Google Drive) ou copiar para pendrive periodicamente.
- **Nunca** sincronizar `data/lifehub.db` ao vivo: o banco está em uso (WAL) e a cópia ao vivo pode sair inconsistente. A cópia externa é sempre da pasta `backups/`.

## Trocar a senha do login

> A senha usada no seed até 2026-09-23 ficou exposta no histórico público do repositório — troque antes de expor o app (ex.: Tailscale no Ciclo 2).

1. Edite `SEED_PASSWORD` no `.env` com a nova senha.
2. Apague o usuário e as sessões (o seed é idempotente e **não** recria a credencial de um usuário existente):

```powershell
node -e "const D=require('better-sqlite3');const db=new D('data/lifehub.db');db.prepare('delete from session').run();db.prepare('delete from account').run();db.prepare('delete from user').run();db.close();"
```

3. Rode `npm run seed` e entre com a nova senha.

## Acesso pelo celular (Tailscale)

1. Instale o Tailscale na máquina e no celular e entre na mesma tailnet.
2. Na máquina, exponha a porta do app via HTTPS:

```powershell
tailscale serve --bg 3000
```

3. Acesse pelo MagicDNS (ex.: `https://<maquina>.<tailnet>.ts.net`) e use "Adicionar à tela inicial" — PWA instalável exige HTTPS.
4. **Nunca** usar `tailscale funnel` (exposição pública).

## Troubleshooting

- **Instalação de dependências:** o projeto usa `ignore-scripts=true` no `.npmrc` (ADR 0016) — o better-sqlite3 usa os binários pré-compilados do pacote e o `npm ci` não exige toolchain C++. Se um pacote futuro precisar do script de instalação, rode `npm_config_ignore_scripts=false npm rebuild <pacote>`.
- **Porta ocupada:** `npm run dev -- -p 3001` (ajuste `BETTER_AUTH_URL` se necessário).
- **`better-sqlite3` pedindo rebuild** (após trocar de versão do Node): `npm rebuild better-sqlite3`.
- **e2e falhando com servidor já rodando:** o e2e sobe o próprio servidor na porta **3210**; feche instâncias antigas de dev que ocupem essa porta.
- **CI vermelha:** `gh run view --log-failed`.
- **Clone novo:** `data/` e `backups/` não vêm do git — são criados automaticamente pelo app/scripts.
