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

## Despliegue en Coolify: un solo docker compose
`docker-compose.coolify.yml` levanta todo en un recurso de Coolify (tipo *Docker Compose*): `app` (Next standalone), `db` (Postgres 17) y `cron` (reemplaza a los workflows de GitHub Actions). **Sin MinIO**: los archivos viven en el volumen `storage` y los sirve la propia app en `/media` (con soporte de Range para video), igual que `gc2-entrenamiento`. Validado localmente de cero: arranca sano, migra y, con el perfil `migracion`, carga el backup de prod (usuarios, tablas y 27 archivos) y pasa `verificar-paridad`.

1. En Coolify: nuevo recurso → *Docker Compose* → repo `inglobal-site`, rama del entorno, archivo `docker-compose.coolify.yml`.
2. Variables del recurso: `BETTER_AUTH_SECRET` (obligatoria) y, opcionales, `RESEND_*`, `COMPANY_EMAIL`. Postgres y `CRON_SECRET` los genera Coolify.
3. Dominio: solo `app` (puerto 3000). Las URLs de archivos son `https://<dominio>/media/...`.
4. Deploy. La app migra la base y prepara el directorio de archivos sola al arrancar.
5. Datos de prod: copiar el backup al servidor como `./backup` junto al compose y correr `docker compose --profile migracion run --rm import` (y luego `... run --rm -e STORAGE_FETCH_URL=http://minio:9000/media import npx tsx scripts/migracion/verificar-paridad.ts`). `backup/` está en `.gitignore`.
6. Backups: los volúmenes `pgdata` (base) y `storage` (archivos) no se respaldan solos; usar `backup-coolify.sh` de `codetlon-cloud` (`docs/BACKUPS.md`), que descubre el contenedor de Postgres y puede incluir el volumen de archivos (tar).

### Cargar y verificar los datos de producción (sin depender del compose de Coolify)
Con el sitio ya desplegado, en el servidor de Coolify (la carpeta `backup/` y el script en el mismo directorio):
```bash
CT=$(docker ps -qf "name=app-<UUID-DEL-RECURSO>")
docker cp backup $CT:/tmp/backup
docker cp importar-en-contenedor.cjs $CT:/tmp/importar.cjs
docker exec -u root -e NODE_PATH=/app/node_modules $CT node /tmp/importar.cjs /tmp/backup
```
Se niega a pisar una base con usuarios salvo `--reset`, e imprime `PARIDAD COMPLETA` si tablas, hashes y archivos (sha256) coinciden con el backup. Después, desde cualquier máquina: `node scripts/migracion/comparar-sitios.mjs <URL-vercel-prod> <URL-test>` compara texto, metadatos y archivos de todas las rutas públicas.

## Variables de entorno del sitio (Coolify)
| Variable | Qué es |
|---|---|
| `DATABASE_URL` | Postgres del entorno (`?sslmode=require` si sale a red pública). Usuario con privilegios mínimos. |
| `BETTER_AUTH_SECRET` | Secreto largo y aleatorio, **distinto por entorno**. Rotarlo cierra todas las sesiones. |
| `BETTER_AUTH_URL` | URL pública del sitio del entorno (la usan cookies, redirects del TV pairing y CSRF). |
| `BETTER_AUTH_TRUSTED_ORIGINS` | Opcional, CSV de orígenes extra. |
| `STORAGE_DIR` | Directorio de archivos (en el compose: `/data/storage`, volumen `storage`). Si no está, se usa el driver S3. |
| `S3_ENDPOINT`, `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_REGION` | Alternativa a `STORAGE_DIR`: bucket S3-compatible (R2/MinIO). |
| `STORAGE_PUBLIC_URL` | Base pública de los archivos, sin barra final (con `STORAGE_DIR`: `https://<dominio>/media`). **También como build arg** (entra en CSP e `images.remotePatterns`). |
| `CRON_SECRET` | Lo comparten la app y el servicio `cron` del compose (lo genera Coolify). Ya no hay workflows de GitHub Actions. |
| `NEXT_PUBLIC_SITE_URL` | URL pública del sitio para canonical, sitemap y Open Graph. **Build arg** (entra en el build). Vacío = `https://gruasinglobal.com`. |
| `NEXT_PUBLIC_GA_ID` | Google Analytics. **Build arg**. Vacío = sin analytics. |
| `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `RESEND_FROM_NAME`, `COMPANY_EMAIL` | Formulario de contacto (mail a la empresa). |
| `TRANSCODE_SERVICE_URL`, `TRANSCODE_API_KEY` | Opcionales: servicio **global** de compresión de video (`codetlon-cloud/templates/video-transcode`, una instancia para todos los proyectos). Server-to-server; sin ellos el video se guarda sin comprimir. |

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
