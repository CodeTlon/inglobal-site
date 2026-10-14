# MIGRACION_SUPABASE — salir de Supabase y Vercel (sitio + app)

## Estado (2026-10-14)
Implementado y verificado en local (rama `feature/dev1-coolify-backend-propio`, ambos repos). **Sin tocar `main`.**
Falta solo la infra en Coolify (la crea Mateo) y las pruebas ahí. Verificado: `tsc`, `next build`, E2E (23/24 + 6 skip por falta de seed; el fallo era un literal del test), tests de la capa de datos (13/13), flujo manual contra el servidor (login, bearer, TV pairing, upload, push, crons) y **paridad completa con el backup de prod** (`scripts/migracion/verificar-paridad.ts`).
No verificado: login con la contraseña real de un usuario migrado (solo se probó el hash importado y el formato bcrypt), build de la imagen Docker en Coolify, app en dispositivo.

## Runbook: levantar `test` en Coolify y compararlo con prod
1. Crear en Coolify (entorno `test`): Postgres 17, MinIO (o bucket R2) con bucket `media` de lectura pública, y la app desde el `Dockerfile` (rama `test`). Variables y build arg `STORAGE_PUBLIC_URL`: ver `ENVIRONMENTS.md`.
2. Las migraciones corren solas al arrancar la app (`scripts/migrate.mjs`). Alternativa manual: `DATABASE_URL=... npm run db:migrate`.
3. Cargar los datos reales (desde una máquina con acceso a la base y al bucket; **el backup está en `/home/dev1/migracion-prod/<fecha>/`, fuera de git**):
   ```bash
   BACKUP_DIR=/home/dev1/migracion-prod/2026-10-14 DATABASE_URL=<url test> \
   S3_ENDPOINT=... S3_BUCKET=media S3_ACCESS_KEY_ID=... S3_SECRET_ACCESS_KEY=... \
   STORAGE_PUBLIC_URL=https://<host-publico>/media \
   npx tsx scripts/migracion/importar-prod.ts --reset
   ```
4. Verificar paridad (sale con código 1 si algo difiere):
   ```bash
   BACKUP_DIR=... DATABASE_URL=<url test> STORAGE_PUBLIC_URL=... SITE_URL=https://<sitio-test> \
   npx tsx scripts/migracion/verificar-paridad.ts
   ```
5. Prueba manual: login con una cuenta real (contraseña de siempre), panel, agenda, TV pairing, subir una foto, formulario de contacto.
6. App móvil: build `preview` con `EXPO_PUBLIC_API_BASE_URL=<sitio-test>`.
7. Para prod: repetir con una pasada **delta** (key nueva de Supabase, backup nuevo) en la ventana de corte, con el sitio viejo en solo lectura. Supabase queda 1-2 semanas como rollback.

## Qué cambió (resumen)
- **Datos:** `lib/db.ts` (capa sobre `pg` con la API de consultas de antes, filas idénticas a PostgREST) + esquema/migraciones Drizzle (`db/schema.ts`, `drizzle/`). Ya no hay RLS: toda mutación pasa por `requireSessionUser()` / `requireApiUser()`.
- **Auth:** Better Auth (`lib/auth.ts`), email + contraseña, sin signup, plugin bearer. Hashes bcrypt de Supabase importados tal cual. `must_change_password` y `last_sign_in_at` son columnas de `user`.
- **TV pairing:** `app/api/tv-pair/exchange` crea una sesión de Better Auth directamente (sin magic link).
- **Storage:** `lib/storage.ts` (S3). Subidas del panel y de la app por `POST /api/storage/upload` (límite 100 MB, tipos permitidos). URLs en la base reescritas a `STORAGE_PUBLIC_URL`.
- **App:** sin `@supabase/supabase-js`; login y sesión por la API (`src/lib/auth.ts`).
- **Deploy:** `output: 'standalone'`, `Dockerfile`, `/api/health`.

Decidido con Mateo el 2026-10-14: **salir de Supabase del todo** (sitio `inglobal-site` + app `inglobal-agenda-app`, que hoy comparten un proyecto) hacia backend propio en Coolify. Doctrina de referencia (repo `codetlon-cloud`): `.claude/modules/migracion-supabase.md`, `backend-propio.md`, `entornos.md`, `docs/BACKUPS.md`.

Stack destino: Postgres en Coolify (una base por entorno) + Drizzle + Better Auth + bucket S3 (R2 o MinIO). Backups diarios a B2 con simulacro de restauración antes del corte.

**Decisión de auth:** importar los hashes bcrypt de `auth.users` (sin reset masivo). Better Auth está configurado con `password.hash/verify` bcrypt (`lib/password.ts`); el hash importado es idéntico al de prod (verificado). Falta confirmar el login con la contraseña real de un usuario en test. Si no funcionara, el plan B es reset obligatorio (`must_change_password`).

Orden de trabajo: fases 1 a 7 en local (Postgres y MinIO en Docker, sin tocar Supabase de prod); la infra de Coolify y el corte (fase 8) van al final.

Regla de Oro #7: crear recursos en Coolify/Vercel, mover credenciales y hacer el corte lo hace Mateo; el código, scripts y guías los genera Claude.

## Inventario (2026-10-14)

| Área | Sitio | App |
|---|---|---|
| Base | 33 migraciones, 32 policies RLS, `is_admin()`, 12 archivos con `auth.uid`/`auth.users` | no accede a la base; todo por `app/api/**` |
| Auth | `signInWithPassword`, `getUser` en `middleware.ts` y cada Server Action, `auth.admin` (`createUser`, `updateUserById`, `listUsers`, `getUserById`), `must_change_password` en `user_metadata` | `signInWithPassword` directo en `login.tsx`, sesión/refresh/`onAuthStateChange` en `session.tsx`, Bearer a la API |
| TV pairing | `app/api/tv-pair/exchange`: `generateLink(magiclink)` + `verifyOtp` (atado a Supabase Auth) | aprueba el QR |
| Storage | bucket `media` (`lib/storage.ts`, `lib/client-upload.ts`, `app/actions/settings.ts`), subida directa del navegador | `src/lib/media-upload.ts` sube directo al bucket |
| Acceso a datos | `supabase.from(...)` en `lib/agenda*.ts`, `lib/*-business.ts`, Server Actions, Route Handlers | — |
| Infra | `scripts/db-sync-dev.mjs`, `db:local:*`, `supabase/config.toml`, cron de agenda por GitHub Actions | `EXPO_PUBLIC_SUPABASE_URL/ANON_KEY` |

## Fases

0. **Infra en Coolify (Mateo, AL FINAL):** decidido que todo queda en Coolify (sitio, base y storage) con dos entornos, test y prod, backup a B2. Se crea recién cuando el código esté listo. Mientras tanto se desarrolla y ensaya contra un Postgres local (Docker rootless de dev1) y MinIO local.
1. **Esquema y datos:** `pg_dump --schema-only` de `public`; sanear (sin policies/RLS, sin FK a `auth.users`, sin `auth.uid()`, `gen_random_uuid()`); baseline Drizzle; migración de datos de referencia; restaurar datos en test y validar conteos. Incluir `push_tokens` y `notificaciones_enviadas` (migración 033).
2. **Capa de datos:** reemplazar `supabase.from` por Drizzle detrás de las funciones de `lib/*` existentes (misma firma), sin tocar UI.
3. **Auth servidor:** Better Auth + importación de hashes; reemplazar `getUser`/middleware/Server Actions; `users.ts` (alta, reset, listado) y `must_change_password`.
4. **RLS a guards:** una policy = un chequeo server-side + test IDOR (32 policies; hoy "cuenta única autenticada").
5. **API para la app:** endpoints de login/refresh/logout (Bearer) y de subida de archivos; rediseñar TV pairing sin magic link (token de un solo uso propio).
6. **Storage:** copiar `media` al bucket nuevo, reescribir URLs guardadas, nuevo cliente de subida (límite 4.5 MB de Vercel sigue aplicando si el sitio queda ahí).
7. **App:** quitar `@supabase/supabase-js`; login y sesión contra la API; subida vía API. Requiere publicar versión nueva (EAS Update no alcanza si cambia lo nativo; hay que coordinar el corte con versiones viejas instaladas).
8. **Corte y cierre:** ventana de bajo tráfico, backup verificado, solo-lectura de Supabase 1-2 semanas, simulacro de restauración, docs (`.ai/context`, README, ENVIRONMENTS) y baja del proyecto.

## Riesgos abiertos
- Compatibilidad bcrypt con Better Auth (probar antes de prometer).
- Versiones viejas de la app instaladas siguen hablando con Supabase Auth: definir período de convivencia o forzar actualización.
- Producción tiene datos reales: nada de seeds/resets fuera de local; todo ensayo en test primero.
- Orden: la doctrina pide un proyecto por vez; este es sitio + app acoplados, así que el sitio va primero y la app inmediatamente después (comparten usuarios y storage).

## Punto de partida disponible (verificado 2026-10-14)
- `codetlon-cloud/templates/backend-propio/`: Drizzle + Better Auth + `pg`, `docker-compose.yml` (Postgres 16 local), `/api/health`, workflows `ci.yml`/`entornos.yml`/`produccion.yml`, y soporte Expo vía `@better-auth/expo` (cubre el login de la app sin Supabase Auth). Es overlay para un Next 15 nuevo: acá hay que adaptarlo a un proyecto existente (no copiar encima).
- Fuente del esquema para el dump: el Supabase **local** de dev1 (`supabase_db_inglobal-local`, puerto 41422, seed ficticio). Nunca el de prod.
- Postgres propio para ensayar: Docker rootless de dev1 en el rango 41000-41999 (no usar el 5432 del template).
