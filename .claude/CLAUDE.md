# Grúas InGlobal — ver AGENTS.md

Sitio institucional + dashboard CMS de Grúas InGlobal S.R.L., Next.js 16 + React 19 + Tailwind 4 con Postgres propio, desplegado en Coolify (`dev`/`test`). Producción (`main`) sigue en Vercel/Supabase hasta el corte, bloqueado por el acceso al dominio.

**Este archivo ya no es la fuente de verdad.** Todo el contexto real del proyecto (arquitectura, stack, modelo de datos, convenciones, decisiones, estado actual, issues conocidos, preguntas abiertas) vive en:

- **`AGENTS.md`** (raíz del repo) — entrada corta, comandos, convenciones críticas no negociables.
- **`.ai/context/`** — capa profunda, un archivo por tipo de contenido. Empezar por `.ai/context/00_INDEX.md`.

Al cerrar una sesión de mantenimiento (`/cerrar`), actualizar `.ai/context/` (y `AGENTS.md` si cambia una convención crítica) — no este archivo.

## Quirks
- `proxy.ts` reemplaza a `middleware.ts` (Next 16). `npm run lint` = `eslint .` (config plana).
- Para probar la imagen Docker: `docker build .` (sin build-args alcanza en este proyecto).
- `npm audit` completo muestra `braces` (cadena de `eslint-config-next`): es de lint y no tiene parche; el gate es `npm audit --omit=dev` en 0.
- Tailwind 4: sin clases pegadas a `${}`, sin utilidades propias llamadas `delay-`, `duration-`, etc.

## Historial de Cambios
| Fecha | Rama | Cambio |
|-------|------|--------|
| 2026-10-16 | feature/dev2-estandar-2026 | v2.1.0 — estandar de versiones de la flota (Next 16, React 19, Tailwind 4, ESLint 10, `proxy.ts`). 8 tests unitarios, audit de runtime en 0, imagen Docker verificada. |
| 2026-10-15 | dev/test | v2.0.x — workflows del estandar, fuentes autoalojadas, salida de Supabase y Vercel en `dev`/`test`. |
