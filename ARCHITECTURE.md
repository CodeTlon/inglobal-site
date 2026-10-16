# ARCHITECTURE — Gruas InGlobal

Mapa de mantenimiento, vigente al 2026-10-16. La arquitectura detallada vive en `.ai/context/ARCHITECTURE.md` (empezar por `.ai/context/00_INDEX.md`).

## Stack
Next.js 16.4.2 (App Router) · React 19.3.1 · TypeScript 6 · Tailwind 4 (tokens `igb-*` en `@theme`) · Zod 4 · Postgres 17 + Drizzle (migraciones) con capa propia `lib/db.ts` sobre `pg` · Better Auth · archivos en `STORAGE_DIR` servidos por `/media` (o bucket S3-compatible) · Resend · microservicio de video `services/video-transcode/`. Node 22. Coolify con `docker-compose.coolify.yml` (`app`, `db`, `cron`).

## Estructura
- `app/` — sitio publico (`quienes-somos`, `servicios`, `montajes`, `clientes`, `contacto`, `galeria`, legales), `dashboard/` (CMS y agenda), `agenda-tv/`, `api/` (capa REST para la app mobile, con Bearer token), `media/`, `actions/` (Server Actions).
- `lib/` — `db.ts`, `auth.ts`, `session.ts`, `api-auth.ts`, `content.ts` (fetchers con fallbacks), `agenda*.ts` y `*-business.ts` (reglas de la agenda), `storage.ts`, `rate-limit.ts`, `push.ts`.
- `proxy.ts` — auth gate de `/dashboard/**` (antes `middleware.ts`).
- `drizzle/` y `db/schema.ts` — esquema y migraciones.

## Para cambios comunes
| Querés cambiar… | Abri |
|---|---|
| Textos o imagenes del sitio | `lib/content.ts` + editor en `app/dashboard/` (tabla `site_settings`) |
| Reglas de la agenda (estados, solapamientos, operarios) | `lib/agenda-business.ts`, `lib/agenda-view.ts`, `lib/agenda.ts` |
| Algo que consume la app mobile | `app/api/**` + `lib/api-auth.ts` |
| Subida de archivos | `app/api/storage/upload`, `lib/storage.ts`, `lib/upload-limits.ts` |
| Esquema | `db/schema.ts` + `npx drizzle-kit generate` (nunca editar una migracion aplicada) |
| Estilos | `app/globals.css` (`@theme`, `@utility`); las utilidades propias no pueden llamarse como las nativas de Tailwind 4 |

## Dónde no meterse sin pensar
- Produccion (`main`) sigue en Vercel + Supabase hasta el corte; no se toca sin OK de Mateo.
- En Next 16 el archivo es `proxy.ts`, no `middleware.ts`. `next lint` no existe: `npm run lint` corre `eslint .`.
