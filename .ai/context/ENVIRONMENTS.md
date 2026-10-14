# Entornos (inglobal-site + inglobal-agenda-app)

Fuente de verdad de los 3 entornos. La app móvil solo enlaza acá.

Desde la migración de 2026-10 el proyecto **no usa Supabase ni Vercel**: todo corre en Coolify (sitio, Postgres, bucket S3-compatible). Ver `MIGRACION_SUPABASE.md` (estado y runbook).

| Entorno | Branch | Base / archivos | Sitio | App móvil |
|---|---|---|---|---|
| **Desarrollo** (local) | `dev` | Postgres + MinIO en Docker (`docker-compose.yml`), seed ficticio | `npm run dev:local` → `localhost:3200` | `npm run start:local` (en la app) |
| **Homologación** | `test` | Coolify, entorno `test`: base y bucket propios, datos de prod cargados con `importar-prod` | Coolify (entorno test) | perfil EAS `preview`, canal `preview` |
| **Producción** | `main` | Coolify, entorno `prod`: backups diarios a B2 | Coolify (entorno prod) | perfil EAS `production`, canal `production` |

Flujo: `dev` → `test` → `main`. **Se trabaja siempre en `dev`** (vía ramas `feature/*`). No commitear directo a `main`.

## Reglas
- **Producción tiene datos reales del cliente.** Nunca correr seeds, `db:local:reset` ni `importar-prod --reset` contra homologación o producción en uso.
- Migraciones: Drizzle (`db/schema.ts` → `drizzle/*.sql`, versionadas en git). El contenedor las aplica al arrancar (`instrumentation.ts`). Una migración que ya corrió en producción no se edita; se agrega una nueva. `drizzle-kit push` solo en local.
- Los `.env*` reales no se versionan; solo los `*.example`. Los valores reales viven en Coolify / EAS.
- `db/seed-local.sql` y las cuentas de prueba son solo para local: `db-local-seed.ts` se niega a correr si `DATABASE_URL` no es localhost.

## Variables de entorno del sitio (Coolify)
| Variable | Qué es |
|---|---|
| `DATABASE_URL` | Postgres del entorno (`?sslmode=require` si sale a red pública). Usuario con privilegios mínimos. |
| `BETTER_AUTH_SECRET` | Secreto largo y aleatorio, **distinto por entorno**. Rotarlo cierra todas las sesiones. |
| `BETTER_AUTH_URL` | URL pública del sitio del entorno (la usan cookies, redirects del TV pairing y CSRF). |
| `BETTER_AUTH_TRUSTED_ORIGINS` | Opcional, CSV de orígenes extra. |
| `S3_ENDPOINT`, `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_REGION` | Bucket `media` (MinIO en Coolify o R2). |
| `STORAGE_PUBLIC_URL` | Base pública del bucket, sin barra final. **También como build arg** (entra en CSP e `images.remotePatterns`). |
| `CRON_SECRET` | Mismo valor que el secret de GitHub Actions (crons de agenda y notificaciones). |
| `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `RESEND_FROM_NAME` | Formulario de contacto. |
| `NEXT_PUBLIC_TRANSCODE_SERVICE_URL`, `TRANSCODE_SHARED_SECRET` | Opcionales: servicio de transcode de video. El servicio usa `S3_*` y `STORAGE_PUBLIC_URL`. |

## Desarrollo local (Docker)
Requisitos: Docker, Node 22, y `inglobal-agenda-app` clonada al lado de este repo.

```bash
npm run db:up            # Postgres 17 (puerto 41510) y MinIO (41511/41512) en tu rango de puertos
npm run db:local:setup   # aplica migraciones, carga db/seed-local.sql y crea las cuentas de prueba
npm run dev:local        # sitio en http://localhost:3200 contra esa base (no toca ningún .env)
npm run db:local:reset   # vacía y vuelve a cargar el seed
npm run db:down          # apaga el stack
```
Cambiá los puertos con `DB_PORT`, `MINIO_PORT`, `MINIO_CONSOLE_PORT` (ver `/etc/dev-ports.conf` en la VPS).

- **Cuentas de prueba** (solo locales): `admin-local@inglobal.test` y `operador-local@inglobal.test`, contraseña `Local-Test-1234`.
- **Seed** (`db/seed-local.sql`): 9 grúas, 6 empresas, 10 operarios (2 ex operarios) y 43 eventos con fechas relativas a hoy en Córdoba. Todo lo ficticio lleva el prefijo `ZZ-PRUEBA`.
- **Datos reales de prod en local** (para ensayar): `BACKUP_DIR=... npm run db:import-prod -- --reset` y `verificar-paridad.ts`. Los backups son datos personales: fuera de git.
- TV: iniciar sesión en el sitio local y abrir `/agenda-tv`.
- App móvil: ver "Entorno local" en `inglobal-agenda-app/AGENTS.md`.
