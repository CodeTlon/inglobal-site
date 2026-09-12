# CURRENT_STATE — Grúas InGlobal

Qué es verdad ahora (2026-09-11). Esto envejece rápido — si estás leyendo esto varios meses después de la fecha de arriba, verificá contra el código antes de confiar ciegamente.

## Pendiente / bloqueado

- **`RESEND_API_KEY`/`RESEND_FROM_EMAIL` de producción**: todavía sin completar, esperando que Mateo pase la key real. El formulario de contacto en prod usa el default de Resend (`onboarding@resend.dev`) hasta entonces.
- **Dominio `gruasinglobal.com`**: todavía no cortado a la producción real de Vercel — el deploy de la rama `main` sigue sirviendo desde su alias `*.vercel.app`.
- **Deploy sin integración Git**: Vercel no tiene el repo conectado — el deploy a producción es manual (`vercel --prod`), según `docs/deployment-guide.md`. Sigue sin haber gate de calidad automático (lint/tsc/build/tests en push o PR) — `.github/workflows/` sí existe desde el 2026-09-06, pero solo para el cron de agenda (`cron-transicionar-estados.yml`), no como CI.
- **Hosting del microservicio `services/video-transcode/`**: la integración en el código principal (`lib/transcode-token.ts`, `app/actions/transcode.ts`) ya está completa; no está confirmado si el microservicio ya corre en algún lado (Coolify u otro) o si sigue con el soft-fail activo (sube sin transcodificar). Ver `.ai/context/OPEN_QUESTIONS.md`.

## En desarrollo activo

- **App mobile `inglobal-agenda-app`** (repo aparte): consume `app/api/**` vía Bearer token para que el personal de campo gestione la agenda desde el celular, con las mismas cuentas que el panel web (sin distinción de rol desde 2026-09-11). Usa el **mismo proyecto Supabase** que el web (confirmado por Mateo, 2026-09-11).
- **Migración `031_drop_trabajador_role.sql`**: aplicada a dev (`db-sync-dev.mjs --yes`, 2026-09-11) y a **prod** (pegada a mano en el SQL Editor de Supabase, 2026-09-12, excepción puntual al flujo normal porque `is_admin()` era una redefinición de función sin riesgo de dato — no un wipe). El `is_admin()` de prod ya no chequea rol. **Resuelto (2026-09-12)**: `refactor/eliminar-rol-trabajador` (`ed67163`, `c9cfa39`, `1a96f75`) se mergeó a `main` (fast-forward, sin conflictos — `main` no había avanzado desde el punto de la rama). La inconsistencia entre RLS (ya aflojado) y `middleware.ts` (todavía bloqueando `trabajador`) que existió entre el 2026-09-12 (migración en prod) y este merge queda cerrada del lado del código en `main`. Verificado localmente contra `main` post-merge con una cuenta de prueba real `app_metadata.role = 'trabajador'` (creada y luego borrada en el proyecto Supabase de **dev**, nunca en prod): login entra directo a `/dashboard` sin redirect a `?sin_acceso=1`, y un `UPDATE` real sobre `clientes` (antes bloqueado por RLS para ese rol) se persistió — confirma que el checklist de `MANUAL-PRUEBAS.md` ("Eliminación del rol `trabajador`") pasa en `main`. Falta desplegar `main` a prod para que el código deployado deje de estar un commit atrás de la DB.
- **Esta misma restructuración de contexto** (`AGENTS.md` + `.ai/context/`, en curso desde 2026-09-11): reemplaza el patrón anterior de un único `.claude/CLAUDE.md` monolítico que se había desincronizado del código real en varios puntos (roles, `app/api/**`, TV pairing, SEO/Analytics, entre otros — ver `.ai/context/DECISIONS.md`). `.claude/CLAUDE.md` y `ARCHITECTURE.md` (raíz) pasan a ser stubs cortos que apuntan acá.

## Prioridades conocidas (no bloqueantes)

- Sin tests de integración ni de RLS — solo 24 E2E de UI (`tests/e2e/inglobal.spec.ts`) y 1 unit test (`services/video-transcode/token.test.mjs`). Ver `.ai/context/KNOWN_ISSUES.md`.
- Sin CI/CD real — el gate de calidad (`lint && tsc --noEmit && build`) depende de que alguien lo corra a mano antes de mergear/pushear.
