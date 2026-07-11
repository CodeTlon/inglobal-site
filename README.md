# Grúas InGlobal

Sitio institucional de **Grúas InGlobal S.R.L.** (alquiler de grúas y montajes industriales, Córdoba, AR). Reescritura de un sitio PHP legacy a Next.js, con **dashboard CMS** para editar casi todo el contenido sin tocar código.

## Stack

- **Next.js 15.5** (App Router) + TypeScript + **Tailwind CSS**
- **Supabase** (PostgreSQL + RLS + Auth + Storage bucket `media`)
- **Resend** (formulario de contacto) · Zod + Server Actions
- **Playwright** (E2E, puerto dedicado 3310) · Deploy en **Vercel**

## Setup

```bash
npm install
cp .env.example .env.local   # completar credenciales Supabase + Resend
npm run dev                  # http://localhost:3000
```

## Scripts

```bash
npm run dev              # Dev server
npm run build             # Build de producción (corre optimize:images en prebuild)
npm run start              # Serve del build
npm run lint               # ESLint
npm run optimize:images    # Regenera public/images/opt/ (AVIF+WebP, idempotente)
npx playwright test        # Tests E2E (puerto 3310)
```

## Variables de entorno

Ver `.env.example`: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `RESEND_FROM_NAME`, `RESEND_FROM_EMAIL`, `COMPANY_EMAIL`.

## Estructura

- `app/` — sitio público (home, quiénes-somos, servicios, montajes + `[slug]`, clientes + `[slug]`, contacto, galería)
- `app/dashboard/` — login + CMS admin (`site_settings`, montajes, clientes, servicios)
- `lib/content.ts` — fetchers con fallbacks tipados (fuente de datos de las páginas públicas)
- `app/actions/` — Server Actions (mutaciones del dashboard + contacto)
- `middleware.ts` — auth gate de `/dashboard/**`
- `supabase/migrations/` — migraciones SQL (001–006)

Ver [`ARCHITECTURE.md`](./ARCHITECTURE.md) para el mapa de dónde tocar cada cosa.

## Mantenimiento

Modelo de sesión de CodeTlon:

- `/cambio "<tema>"` — abre una rama de trabajo desde `main`. Cada cambio commitea ahí.
- `/cerrar` — build + actualiza este Changelog + mergea a `main` + tag SemVer.

Contexto de proyecto en `.claude/CLAUDE.md` + `ARCHITECTURE.md`. Checklist manual de testing en `MANUAL-PRUEBAS.md`. Bitácora de bugs no obvios en `.claude/ERRORES.md`.

## Licencia

© 2026 CodeTlon. Todos los derechos reservados. Software propietario del cliente/CodeTlon.
Prohibida su copia, redistribución o reuso sin autorización escrita. Ver [LICENSE](./LICENSE).

## Changelog

| Versión | Fecha | Cambio |
|---------|-------|--------|
| — (rama `fix/integridad-datos-storage-agenda`, en `dev`) | 2026-07-11 | **Fase 1 de fixes post-QA — integridad de datos**: los botones "Quitar" de `ImageUpload`/`VideoUpload` y los `delete*` de montajes/clientes/trabajos/galería ahora borran también el archivo del bucket `media` (antes quedaba huérfano en Storage). Bug de Agenda "Invalid input: expected string, received null" resuelto: los campos opcionales de los 4 schemas (`grua`/`empresa`/`operario`/`evento`) pasan a `.nullable()`, y `SelectField` ahora soporta un placeholder para que un `<select>` sin opciones no omita el campo del FormData. Patente/capacidad de grúa y teléfono de operario pasan a obligatorios. `display_order`/`work_rank` ya no se pisan entre registros: si el valor entra duplicado, se autoincrementa al siguiente libre (`lib/ordering.ts`, scope por `cliente_id` en trabajos). |
| — (rama `chore/security-headers-loading-states`, sesión abierta) | 2026-07-11 | **Seguridad + progressive loading**: headers de seguridad en `next.config.mjs` (`X-Frame-Options: DENY`, HSTS, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`). Auditoría de RLS sobre las 9 migraciones — sin gaps (todas las tablas de contenido tienen policy de lectura pública + escritura `authenticated`; `agenda` es `authenticated`-only, sin policy pública, como corresponde a data operativa privada). Sin `app/api/**` route handlers en este proyecto — CORS no aplica (mutaciones van por Server Actions, same-origin). Progressive loading: `Skeleton` (shadcn, adaptado a los tokens `igb-*` del proyecto) + `loading.tsx` por sección top-level del panel (agenda/clientes/contenido/galería/montajes/servicios/usuarios). Error boundaries branded: `app/error.tsx` (público), `app/dashboard/(panel)/error.tsx` (panel), `app/global-error.tsx` (root layout). |
| v1.1.0 | 2026-07-04 | **Fase 1 — Reestructura + Dashboard CMS**: home reordenado (Hero con video → Qué Hacemos → resto), "Quiénes Somos" a página propia, Montajes y Clientes Destacados con detalle tipo blog por slug (Clientes ordenado por `work_rank`), dashboard admin completo (contenido/montajes/clientes/servicios, Supabase Auth). Fix: unificación de claves `site_settings` entre seed/fallback/frontend. Fix: puerto dedicado en Playwright (3310) — corrige 12 falsos positivos por colisión con otro proyecto en :3000. Documentación de mantenimiento completada (`ARCHITECTURE.md`, `MANUAL-PRUEBAS.md`, `.claude/ERRORES.md`, `/cambio`+`/cerrar`). |
| v1.0.0 | 2026-06-19 | Entrega inicial: migración PHP → Next.js 15.5.19, pipeline de imágenes AVIF/WebP, formulario de contacto (Resend), 25/25 E2E, 0 HIGH vulns. |
