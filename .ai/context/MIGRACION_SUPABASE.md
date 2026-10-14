# MIGRACION_SUPABASE — salir de Supabase (sitio + app)

Decidido con Mateo el 2026-10-14: **salir de Supabase del todo** (sitio `inglobal-site` + app `inglobal-agenda-app`, que hoy comparten un proyecto) hacia backend propio en Coolify. Doctrina de referencia (repo `codetlon-cloud`): `.claude/modules/migracion-supabase.md`, `backend-propio.md`, `entornos.md`, `docs/BACKUPS.md`.

Stack destino: Postgres en Coolify (una base por entorno) + Drizzle + Better Auth + bucket S3 (R2 o MinIO). Backups diarios a B2 con simulacro de restauración antes del corte.

**Decisión de auth:** importar los hashes bcrypt de `auth.users` (sin reset masivo). Es una hipótesis hasta probarla: Better Auth hay que configurarlo con `password.hash/verify` propios compatibles con bcrypt y verificar con un usuario real en test. Si no funciona, el plan B es reset obligatorio (ya existe `must_change_password`).

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
