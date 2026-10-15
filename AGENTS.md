# AGENTS.md — Grúas InGlobal

Sitio institucional + dashboard CMS de Grúas InGlobal S.R.L. (grúas/hidrogrúas/montajes, Córdoba AR). Next.js 15 en Coolify (Docker), con una app mobile satélite que consume una capa REST propia (`app/api/**`) para la agenda de flota. Reescritura de un sitio PHP legacy.

## Stack

| Capa | Tecnología |
|---|---|
| Framework | Next.js 15.5 (App Router, RSC) |
| Lenguaje | TypeScript 5 (`strict: true`) |
| UI | Tailwind CSS 3.4 + tokens custom `igb-*` |
| Validación | Zod **v4** + react-hook-form |
| Datos | Postgres propio (Coolify) · esquema y migraciones con Drizzle (`db/schema.ts`, `drizzle/`) · consultas vía `lib/db.ts` |
| Auth | Better Auth (email + contraseña, sin signup, plugin bearer para la app) |
| Archivos | Bucket S3-compatible (MinIO/R2), `lib/storage.ts` |
| Rich text | TipTap v3 |
| Email | Resend |
| Tests | Playwright (E2E) |
| Deploy | Coolify (`Dockerfile`, `output: 'standalone'`), entornos test y prod |

## Comandos

```bash
npm run dev               # dev server
npm run build             # build (corre optimize:images en prebuild)
npm run lint               # next lint
npx tsc --noEmit          # type check
npx playwright test       # E2E — puerto dedicado 3310, no 3000
npm run optimize:images   # regenera public/images/opt/
npm run optimize:video    # requiere ffmpeg local
npm run db:up                # Postgres + MinIO locales (docker compose, puertos 415xx)
npm run db:local:setup       # migraciones + seed ficticio + cuentas de prueba
npm run dev:local            # sitio contra esa base local (no toca ningún .env)
npm run db:generate          # genera una migración Drizzle tras cambiar db/schema.ts
npm run db:migrate           # aplica migraciones (el contenedor lo hace al arrancar)
npm run test:unit            # capa de datos (paridad con el backup de prod)
```

## Convenciones críticas no negociables

- **Subidas:** Server Actions limitadas a 20 MB (`bodySizeLimit`); video/PDF y subidas de la app van por `POST /api/storage/upload` (100 MB). Ya no aplica el tope de 4.5 MB de Vercel. Ver `.ai/context/CONVENTIONS.md`.
- **Sin RLS:** toda Server Action y Route Handler empieza con `requireSessionUser()` / `requireApiUser(request)`. Nunca consultar la base sin ese guard (excepto lecturas públicas del sitio en `lib/content.ts`).
- **Esquema:** se cambia en `db/schema.ts` + migración Drizzle; lo que Drizzle no expresa va en una migración SQL manual (`drizzle-kit generate --custom`). Nunca editar una migración ya aplicada en prod.
- **`lib/friendly-error.ts` obligatorio** en todo `catch`/`if(error)` de Server Actions — nunca `error.message` de Supabase crudo a la UI.
- **Un solo tipo de cuenta** (sin roles) — cualquier cuenta autenticada tiene acceso total al panel web y a la app mobile vía `app/api/**`. El sistema de roles `admin`/`trabajador` que existió brevemente se eliminó (ver `.ai/context/DECISIONS.md`) — no reintroducirlo sin discutirlo primero.
- **`prefetch={false}`** en todo `Link` nuevo dentro de `/dashboard/**` — el middleware llama `auth.getUser()` en cada ruta del panel, y el prefetch automático de Next multiplica esas llamadas.
- **CSP solo corre en producción** — no asumir que un bloqueo de CSP aparece en `npm run dev`.
- **Server Actions vs `app/api/**`**: si la mutación la usa el sitio público o el dashboard web, es un Server Action; si la consume la app mobile, es un Route Handler con auth Bearer en `app/api/**`.
- Todo el contenido y la UI son en español (es_AR).

## Para más contexto

- **Rama de trabajo: `dev`** (`dev` → `test` → `main`). No commitear directo a `main`: despliega a producción.
- Entornos (dev local / homologación / producción), seed y cuentas de prueba: `.ai/context/ENVIRONMENTS.md`. Producción tiene datos reales: no correr seeds ni resets fuera de local.

Este archivo es la entrada corta. El detalle real vive en `.ai/context/` — ver `.ai/context/00_INDEX.md` para la tabla completa de "qué tarea → qué archivo". Resumen:

| Necesitás... | Leer |
|---|---|
| Entender el proyecto para una primera sesión | `.ai/context/PROJECT.md` + `.ai/context/ARCHITECTURE.md` |
| Modelo de datos y reglas de negocio | `.ai/context/DOMAIN.md` |
| Patrones ya establecidos (uploads, errores, feedback de guardado) | `.ai/context/CONVENTIONS.md` |
| Por qué algo se hizo de cierta forma | `.ai/context/DECISIONS.md` |
| Qué está pendiente/en curso ahora mismo | `.ai/context/CURRENT_STATE.md` |
| Riesgos y limitaciones conocidas | `.ai/context/KNOWN_ISSUES.md` |
| Cosas sin confirmar, no asumir una respuesta | `.ai/context/OPEN_QUESTIONS.md` |
| QA manual paso a paso | `MANUAL-PRUEBAS.md` (raíz) |
| Causas raíz de bugs ya resueltos | `.claude/ERRORES.md` |
| Deps/seguridad/accesibilidad/CI/observabilidad (módulos compartidos de la fábrica) | `codetlon-cloud/.claude/modules/*.md` — leer solo el que aplique a lo que se está tocando |

`.claude/CLAUDE.md` y `ARCHITECTURE.md` (raíz) son ahora stubs cortos que apuntan acá — no son fuente de verdad.

## Pendientes
Lo que falta de la migración a Coolify (seguridad, test, corte a producción): `.ai/context/PENDIENTES.md`.
