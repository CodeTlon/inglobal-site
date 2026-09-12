# AGENTS.md — Grúas InGlobal

Sitio institucional + dashboard CMS de Grúas InGlobal S.R.L. (grúas/hidrogrúas/montajes, Córdoba AR). Next.js 15 en Vercel, con una app mobile satélite que consume una capa REST propia (`app/api/**`) para la agenda de flota. Reescritura de un sitio PHP legacy.

## Stack

| Capa | Tecnología |
|---|---|
| Framework | Next.js 15.5 (App Router, RSC) |
| Lenguaje | TypeScript 5 (`strict: true`) |
| UI | Tailwind CSS 3.4 + tokens custom `igb-*` |
| Validación | Zod **v4** + react-hook-form |
| DB/Auth/Storage | Supabase (Postgres + RLS + Auth + Storage) |
| Rich text | TipTap v3 |
| Email | Resend |
| Tests | Playwright (E2E) |
| Deploy | Vercel |

## Comandos

```bash
npm run dev               # dev server
npm run build             # build (corre optimize:images en prebuild)
npm run lint               # next lint
npx tsc --noEmit          # type check
npx playwright test       # E2E — puerto dedicado 3310, no 3000
npm run optimize:images   # regenera public/images/opt/
npm run optimize:video    # requiere ffmpeg local
```

## Convenciones críticas no negociables

- **Límite real de subida = 4.5MB de Vercel**, no el `bodySizeLimit` de Next (no configurable desde la app). Cualquier upload nuevo >4MB tiene que resizear client-side (imágenes) o subir directo a Storage desde el navegador (video/PDF) — nunca crudo por un Server Action. Ver `.ai/context/CONVENTIONS.md`.
- **`lib/friendly-error.ts` obligatorio** en todo `catch`/`if(error)` de Server Actions — nunca `error.message` de Supabase crudo a la UI.
- **Un solo tipo de cuenta** (sin roles) — cualquier cuenta autenticada tiene acceso total al panel web y a la app mobile vía `app/api/**`. El sistema de roles `admin`/`trabajador` que existió brevemente se eliminó (ver `.ai/context/DECISIONS.md`) — no reintroducirlo sin discutirlo primero.
- **`prefetch={false}`** en todo `Link` nuevo dentro de `/dashboard/**` — el middleware llama `auth.getUser()` en cada ruta del panel, y el prefetch automático de Next multiplica esas llamadas.
- **CSP solo corre en producción** — no asumir que un bloqueo de CSP aparece en `npm run dev`.
- **Server Actions vs `app/api/**`**: si la mutación la usa el sitio público o el dashboard web, es un Server Action; si la consume la app mobile, es un Route Handler con auth Bearer en `app/api/**`.
- Todo el contenido y la UI son en español (es_AR).

## Para más contexto

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
