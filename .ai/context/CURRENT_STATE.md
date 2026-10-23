# CURRENT_STATE — Grúas InGlobal

**Actualizacion 2026-10-21 (v2.2.0):** el calendario semanal del dashboard (`/dashboard/agenda/calendario`) se rediseño para la tele: 7 columnas sin scroll de pagina, scroll interno por dia y navegacion con control remoto. Corregido ademas el corrimiento de un dia de la semana (Date serializado en UTC). Pendiente: probarlo en una tele real.

**Actualizacion 2026-10-18 (v2.1.2):** corregido el calculo de estado de los eventos de agenda (`estadoTransicionado`, `getEstadoVisual`): las horas son de Cordoba y se interpretaban en UTC, asi que un evento se finalizaba 3 horas antes (y las reservas se cancelaban antes). Ahora usan `OFFSET_AR` (`-03:00`). Era la causa real del E2E `disponible/ocupado hoy` que fallaba por la tarde. E2E de agenda 6/6 y unit tests verdes. Los eventos ya finalizados de mas en la base de produccion, si los hubo, no se corrigen solos (el estado se persiste al leer).

**Actualizacion 2026-10-18:** `dev` y `test` contienen `origin/main` (PR #8, ajustes de cliente en contacto/hero/servicios). E2E corridos contra el build de produccion con Postgres 17 y el seed: 29 de 30 pasan; `catalogos muestra disponible/ocupado hoy` falla fuera del horario del seed (eventos de hoy hasta las 19:00 Cordoba). Sin verificar: CI en GitHub tras el merge y el despliegue de `test` en Coolify.

**Actualizacion 2026-10-16:** la rama `feature/dev2-estandar-2026` (integrada en `dev` y `test`) lleva el proyecto al estandar de versiones de la flota: Next 16.4.2, React 19.3.1, Tailwind 4.3.3, TypeScript 6.0.3, ESLint 10.13.0, `proxy.ts`. Verificado: `tsc`, lint (0 errores), 8 tests unitarios, build, imagen Docker Alpine, `npm audit --omit=dev` en 0. **Sin verificar:** E2E (los corre el CI), despliegue de `test` con esta version. Produccion (`main`) sigue en Vercel + Supabase; el corte espera el acceso al dominio.


## Estado vigente (2026-10-23)
- **Producción corre en Coolify** (`main`, deploy automático): `https://inglobal.51.91.253.54.sslip.io`, base Postgres propia, archivos en volumen servido por `/media`. Vercel y Supabase ya no sirven tráfico (Vercel quedó roto a propósito); Supabase sigue vivo solo como respaldo 1-2 semanas antes de apagarlo. Todo push a `main` despliega prod y la migración corre al arrancar: respaldar la base antes de mergear una migración.
- **`main` está en v2.2.0** (calendario semanal para tele). `dev` y `test` tienen el mismo código; `dev` suma solo docs.
- **Backup diario de prod a B2**: cron en `codetlon-vps`; restauración de prueba hecha el 2026-10-23, repetir cada trimestre.
- **CI** (`ci.yml`): corre lint, `tsc`, `test:unit`, build, audit y E2E en push/PR a `dev`, `test` y `main`. Verde en `dev` y `main` al 2026-10-23.
- **Dominio `gruasinglobal.com`**: sin cortar, falta el acceso al DNS. Al cortar hay que rehacer el build de la app móvil (la URL va fija en el binario).
- **Resend de producción**: sin `RESEND_API_KEY`/`RESEND_FROM_EMAIL` propios; el formulario de contacto usa `onboarding@resend.dev`.
- **Video**: el microservicio local `services/video-transcode/` no existe más; se usa el servicio global (`codetlon-cloud/templates/video-transcode`) con soft-fail si no responde.
- **App móvil `inglobal-agenda-app`** (repo aparte): perfil EAS `production` apunta a prod en Coolify; falta sacar el build nuevo y subirlo a TestFlight / Play.
- Lo que falta, con responsable: `PENDIENTES.md`.

## Prioridades conocidas (no bloqueantes)
- Sin tests de integración ni de RLS. Ver `KNOWN_ISSUES.md`.

---
# Historial (superado, queda como referencia)
Las secciones siguientes y lo que dicen de Vercel/Supabase describen etapas anteriores de la migración.


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
