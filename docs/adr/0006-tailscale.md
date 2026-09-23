# ADR 0006: Acesso pelo celular via Tailscale

- **Status:** Aceito
- **Data:** 2026-09-21

## Contexto

O registro precisa funcionar no celular, inclusive fora de casa, sem expor o app à internet pública.

## Decisão

Acessar pelo celular via Tailscale (VPN mesh), com `tailscale serve` para HTTPS via MagicDNS. Nunca usar Funnel.

## Consequências

Registro remoto sem abrir portas nem publicar o app; HTTPS viabiliza a instalação como PWA. Exige Tailscale instalado na máquina e no celular — sem ele, o acesso remoto não funciona.
