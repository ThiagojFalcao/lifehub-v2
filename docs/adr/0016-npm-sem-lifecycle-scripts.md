# ADR 0016: Instalação npm sem lifecycle scripts (`ignore-scripts`)

- **Status:** Aceito
- **Data:** 2026-09-23

## Contexto

O `npm ci` falhava num clone limpo no Windows: o better-sqlite3 v13 não declara `install` script, então o npm executa `node-gyp rebuild` implícito (por causa do `binding.gyp`) e exige Python + Visual Studio Build Tools, ausentes na máquina do criador — mesmo com os binários pré-compilados já vindo no pacote (issue upstream WiseLibs/better-sqlite3#1503).

## Decisão

Manter o better-sqlite3 v13 e desabilitar lifecycle scripts com `ignore-scripts=true` no `.npmrc` do projeto. Os prebuilds do pacote (`prebuilds/win32-x64.node` etc.) bastam em runtime; no tree atual, os únicos pacotes com scripts (esbuild, unrs-resolver) funcionam sem eles — verificado com lint, test, build e e2e.

## Consequências

`npm ci` funciona em qualquer máquina (Windows sem toolchain C++, Linux, CI) sem depender de download externo — tudo vem do tarball do registry. Efeito colateral: scripts de instalação de dependências futuras não rodam sozinhos; se um pacote precisar, rodar explicitamente `npm_config_ignore_scripts=false npm rebuild <pacote>`. Revisitar quando o upstream corrigir a issue #1503 (aí basta remover o `.npmrc`).
