# CURRENT_STATE — Grúas InGlobal

Qué es verdad ahora (2026-09-11). Esto envejece rápido — si estás leyendo esto varios meses después de la fecha de arriba, verificá contra el código antes de confiar ciegamente.

## Pendiente / bloqueado

- **`RESEND_API_KEY`/`RESEND_FROM_EMAIL` de producción**: todavía sin completar, esperando que Mateo pase la key real. El formulario de contacto en prod usa el default de Resend (`onboarding@resend.dev`) hasta entonces.
- **Dominio `gruasinglobal.com`**: todavía no cortado a la producción real de Vercel — el deploy de la rama `main` sigue sirviendo desde su alias `*.vercel.app`.
- **Deploy**: Vercel tiene auto-deploy desde `main` (corregido; antes decía manual). Un push a `main` despliega a producción. Sigue sin haber gate de calidad automático (lint/tsc/build/tests en push o PR) — `.github/workflows/` sí existe desde el 2026-09-06, pero solo para el cron de agenda (`cron-transicionar-estados.yml`), no como CI.
- **Hosting del microservicio `services/video-transcode/`**: la integración en el código principal (`lib/transcode-token.ts`, `app/actions/transcode.ts`) ya está completa; no está confirmado si el microservicio ya corre en algún lado (Coolify u otro) o si sigue con el soft-fail activo (sube sin transcodificar). Ver `.ai/context/OPEN_QUESTIONS.md`.

## En desarrollo activo

- **Fix `must_change_password` en `app/api/**`** (rama `fix/must-change-password-api`, commit `ee7d4ff`, 2026-09-12): `middleware.ts` ya bloqueaba a un usuario con contraseña forzada en el dashboard web, pero su matcher nunca incluyó `/api/**` — la app mobile podía operar indefinidamente con una contraseña temporal. `requireApiUser` (`lib/supabase-api.ts`) ahora devuelve 403 en las 14 rutas de `app/api/**` si `must_change_password: true`. Verificado contra una cuenta de prueba real en el proyecto Supabase de **dev** (nunca en prod): antes del fix, `GET /api/agenda/gruas` con su access_token devolvía 200; después, 403. Confirmado sin regresión (cuenta normal sigue en 200, sin token sigue en 401). **Todavía no mergeado a `main`** — no marcar como resuelto hasta el merge. **Ya está en `main`** (incluido en `dc3f9a0`); no es trabajo pendiente.
- **App mobile `inglobal-agenda-app`** (repo aparte): consume `app/api/**` vía Bearer token para que el personal de campo gestione la agenda desde el celular, con las mismas cuentas que el panel web (sin distinción de rol desde 2026-09-11). Usa el **mismo proyecto Supabase** que el web (confirmado por Mateo, 2026-09-11).
- **Migración `031_drop_trabajador_role.sql`**: aplicada a dev (`db-sync-dev.mjs --yes`, 2026-09-11) y a **prod** (pegada a mano en el SQL Editor de Supabase, 2026-09-12, excepción puntual al flujo normal porque `is_admin()` era una redefinición de función sin riesgo de dato — no un wipe). El `is_admin()` de prod ya no chequea rol. **Resuelto (2026-09-12)**: `refactor/eliminar-rol-trabajador` (`ed67163`, `c9cfa39`, `1a96f75`) se mergeó a `main` (fast-forward, sin conflictos — `main` no había avanzado desde el punto de la rama). La inconsistencia entre RLS (ya aflojado) y `middleware.ts` (todavía bloqueando `trabajador`) que existió entre el 2026-09-12 (migración en prod) y este merge queda cerrada del lado del código en `main`. Verificado localmente contra `main` post-merge con una cuenta de prueba real `app_metadata.role = 'trabajador'` (creada y luego borrada en el proyecto Supabase de **dev**, nunca en prod): login entra directo a `/dashboard` sin redirect a `?sin_acceso=1`, y un `UPDATE` real sobre `clientes` (antes bloqueado por RLS para ese rol) se persistió — confirma que el checklist de `MANUAL-PRUEBAS.md` ("Eliminación del rol `trabajador`") pasa en `main`. Falta desplegar `main` a prod para que el código deployado deje de estar un commit atrás de la DB.
- **Esta misma restructuración de contexto** (`AGENTS.md` + `.ai/context/`, en curso desde 2026-09-11): reemplaza el patrón anterior de un único `.claude/CLAUDE.md` monolítico que se había desincronizado del código real en varios puntos (roles, `app/api/**`, TV pairing, SEO/Analytics, entre otros — ver `.ai/context/DECISIONS.md`). `.claude/CLAUDE.md` y `ARCHITECTURE.md` (raíz) pasan a ser stubs cortos que apuntan acá.

## Prioridades conocidas (no bloqueantes)

- Sin tests de integración ni de RLS — solo 24 E2E de UI (`tests/e2e/inglobal.spec.ts`) y 1 unit test (`services/video-transcode/token.test.mjs`). Ver `.ai/context/KNOWN_ISSUES.md`.
- CI: desde 2026-10-15 `ci.yml` corre lint, `tsc`, `test:unit`, build, audit y E2E en push/PR a `dev`, `test` y `main` (en `dev`/`test`; `main` hereda el CI al promover). Antes no había gate automático.

## Estado al 2026-10-01 (cierre de la tanda de agenda y entornos)
- **Hecho y en `main`:** migración 032 aplicada en producción, empresas por tipo, roles y ex operarios (app + sitio + panel web), mejoras de vistas mes/semana/día y TV, Supabase local con seed, documentación de entornos.
- **Ramas:** `dev` (trabajo), `test` y `main` existen en los dos repos; las tres quedaron emparejadas al cerrar esta tanda.
- **Pendiente:** (1) Supabase de homologación y su sitio en Vercel (Preview); (2) reclasificar a mano las empresas particulares: la 032 las dejó todas como `frecuente`; (3) decidir la política de `hora_fin` (18:00 vs 23:59); (4) revisar con el seed las vistas semana y día del sitio con el día de 9 servicios y la app móvil en un celular o emulador (solo se revisó la TV mensual y la semana web).

## Paridad web / app en la agenda (2026-10-14, rama `feature/dev1-paridad-web-app`)
- Se comparo `inglobal-agenda-app` contra el dashboard. Cerradas en el web: ex operarios (listar/reincorporar/borrado definitivo), cambio de estado con transiciones validas, bloqueo de editar/eliminar por estado, alta con `reserva`, detalle por recurso (estadisticas e historial), KPIs de hoy, duplicado de operarios, buscador de empresas.
- Verificado a mano con Playwright contra Supabase local + seed y con `lint`, `tsc`, `build` y los 24 E2E publicos. El E2E `tests/e2e/dashboard-agenda.spec.ts` solo corre con `E2E_LOCAL_ADMIN=1` contra el Supabase local.
- Catalogos muestra Disponible/Ocupado de hoy (`ocupacionHoy` en `lib/agenda-view.ts`, igual que `catalog-ocupacion.ts` de la app). Cancelar evento no valida operarios/grua activos.
- Pendiente: la app todavia no tiene push, exportar ni cambio de password in-app (trabajo en `inglobal-agenda-app`). La app movil no se probo en esta tanda (la prueba es manual de Mateo).

## Estado al 2026-10-14 (notificaciones push, rama `feature/dev1-notificaciones`)
Backend implementado (migración 033, `app/api/push/registrar`, `app/api/agenda/cron/notificar`, workflow). **Pendiente de verificar:** aplicar 033 a dev/prod, secret `CRON_SECRET` ya existente, prueba en dispositivo real con build nativo. Detalle en `DOMAIN.md` y `OPEN_QUESTIONS.md`.

## Estado al 2026-10-14 (migración a Coolify, rama `feature/dev1-coolify-backend-propio`)
Código listo y verificado en local; **no mergeado**. Falta: crear test en Coolify, cargar datos y verificar paridad (runbook en `MIGRACION_SUPABASE.md`), probar login real y la app en dispositivo, y luego el corte de prod (pasada delta). Las secciones anteriores sobre Vercel/Supabase son históricas. La rama de notificaciones (`feature/dev1-notificaciones`, PR #6) es base de esta.

## Cierre de sesión 2026-10-14 (migración a Coolify)
Test en Coolify con datos reales cargados, verificado contra el backup y contra Vercel (ver `PENDIENTES.md`, sección "Dónde quedó todo"). Producción sigue en Vercel + Supabase, intacta. Lo que falta: seguridad inmediata (revocar token de Supabase, cerrar signup), backups de volúmenes, pruebas manuales con la app y el corte. Todo el detalle y las casillas están en `.ai/context/PENDIENTES.md`.

## Actualización 2026-10-15 (estado de la migración a Coolify)
- **Producción sigue en Vercel + Supabase.** El corte (DNS de `gruasinglobal.com`, desconectar Vercel, Supabase en solo lectura) **espera que el cliente dé acceso al dominio**. Hasta entonces `main` no se toca.
- **Lo que no depende del dominio y se puede hacer ya:** crear el recurso de prod en Coolify (mismo compose, otros secretos, probado por la URL temporal), cargar los datos y archivos reales con el importador (`docker compose --profile migracion run --rm import`) y verificar paridad, dejar el backup a B2 funcionando y el simulacro de restauración, y publicar la versión nueva de la app móvil cuando se defina cómo conviven las versiones viejas.
- **Hecho y verificado:** `test` corriendo en Coolify con datos reales de prod cargados (13 tablas, 4 usuarios con hash, 27 archivos), 39/40 rutas idénticas en texto y metadatos contra Vercel (ver `PENDIENTES.md`); `next` 15.5.28 y `npm audit` sin altas/críticas de runtime; `tsc` y `build` verdes. `dev` y `test` apuntan al mismo commit.
- **Pruebas unitarias:** `npm run test:unit` → 8 pasan, 12 salteadas. Las salteadas son de paridad con prod y necesitan `BACKUP_DIR` + `DATABASE_URL` (base cargada); antes fallaban en CI sin datos.
- **Brechas del estándar CodeTlon:** workflows del estándar agregados el 2026-10-15 (`ci.yml`, `entornos.yml`, `produccion.yml`, `backup-check.yml`; falta confirmar que pasen en GitHub y configurar `TEST_URL`/`PROD_URL`), `/api/health` ya devuelve `started_at`, capa `lib/db.ts` propia en lugar de Drizzle en las consultas (excepción documentada), cron de backup B2 pendiente.
