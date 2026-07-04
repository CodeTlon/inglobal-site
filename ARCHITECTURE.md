# ARCHITECTURE — Grúas InGlobal

Mapa para mantenimiento. **No releas el repo entero**: buscá tu tipo de cambio acá y abrí solo esos archivos. El detalle fino (modelo de datos completo, env vars, historial) vive en `.claude/CLAUDE.md`.

## Stack
**Next.js 15.5** (App Router) · TypeScript · Tailwind CSS · Supabase (Postgres + RLS + Auth + Storage bucket `media`) · Resend · Playwright (E2E, puerto dedicado 3310) · Vercel. Sin alias `src/` — todo cuelga de la raíz (`app/`, `components/`, `lib/`).

## Route Groups
- `app/` (público) — home, `/quienes-somos`, `/servicios`, `/montajes` + `/montajes/[slug]`, `/clientes` + `/clientes/[slug]`, `/contacto`, `/galeria`, `/aviso-legal`
- `app/dashboard/(auth)/login/` — login del CMS (sin signup público)
- `app/dashboard/(panel)/` — CMS protegido: `contenido/{hero,quienes-somos,que-hacemos,stats,cta-banner,clientes-destacados,ubicacion,footer,contacto}` (editan `site_settings`) + CRUD `montajes/`, `clientes/`, `servicios/`
- `middleware.ts` (raíz) — auth gate de `/dashboard/**` (Next 15 sigue siendo `middleware.ts`, no `proxy.ts`)

## Para cambios comunes, leé solo esto

| Querés cambiar… | Abrí |
|-----------------|------|
| Textos de una sección del home/páginas (hero, quiénes somos, qué hacemos, stats, CTA, clientes destacados, ubicación, footer, contacto) | Es JSONB en `site_settings` → editor en `app/dashboard/(panel)/contenido/<seccion>/` + tipos/getters en `lib/content.ts` |
| Datos de páginas públicas (fallback sin DB) | `lib/content.ts` (getters) + `lib/constants.ts` (`FALLBACK_SITE_SETTINGS` / `FALLBACK_MONTAJES` / `FALLBACK_CLIENTES`) — **los nombres de campo tienen que coincidir exactamente entre los dos**, ver `.claude/ERRORES.md` |
| Una mutación (montaje, cliente, servicio, settings, auth) | `app/actions/*.ts` (firma `(prevState: unknown, formData: FormData)`) |
| Video/imagen del hero | `components/HeroVideo.tsx` (usa `video_url` de `site_settings.hero`; si es `null`/vacío cae a `<Picture>` con la imagen fallback) |
| Formulario de contacto | `components/ContactForm.tsx` + `components/ContactFormWrapper.tsx` (preselección de servicio vía query param) + `app/actions/contact.ts` |
| Auth gate del dashboard | `middleware.ts` + `lib/supabase-server.ts` |
| Upload de imágenes del CMS | `components/dashboard/Field.tsx` (`ImageUpload`/`VideoUpload`) → `uploadMediaAction` en `app/actions/settings.ts` (sharp: resize ≤2000px + WebP q82) → bucket `media`. Video del hero sube sin transformación (solo valida mimetype/tamaño) |
| Schema / nueva columna / tabla | **nueva** migración numerada en `supabase/migrations/` (la última es `006_storage_media.sql`) + tipos/getters en `lib/content.ts` |
| Orden de "Clientes Destacados" | Campo `work_rank` en la tabla `clientes` (mayor = aparece más arriba) — se edita desde `ClienteForm.tsx`, sin drag&drop |
| Estilos / paleta InGlobal | `app/globals.css` + `tailwind.config.ts` (`igb-yellow`, `igb-navy`, etc. — ver tabla de tokens en `.claude/CLAUDE.md`) |
| SEO / JSON-LD / redirects legacy `.php` | `app/layout.tsx`, páginas individuales (metadata por ruta), `next.config.mjs` |

## Dónde NO meterse sin pensar
- **`lib/content.ts` + `lib/constants.ts`** — la cadena de fallbacks mantiene el sitio vivo sin DB. Si cambiás la forma de un JSONB de `site_settings` o los campos de `montajes`/`clientes`, actualizá el getter/fallback acá Y el form del dashboard que lo edita, o el público queda desincronizado silenciosamente (bug real ya encontrado esta sesión, ver `.claude/ERRORES.md`).
- **`supabase/migrations/`** — nunca editar una migración ya aplicada. Crear una nueva.
- **`middleware.ts`** — es el único gate de `/dashboard/**`. No mover la protección al layout del panel (Next 15, no 16 — sigue siendo middleware).
- **`playwright.config.ts`** — puerto fijo **3310** (`baseURL`, `webServer.command`, `webServer.url`). No volver a 3000: en esta máquina hay otros proyectos Next corriendo ahí y `reuseExistingServer` no detecta que es el sitio equivocado (ver Bug 37 de la fábrica).
- **`components/Picture.tsx`** — pipeline propio de AVIF+WebP pre-build (`scripts/optimize-images.mjs`, sharp) para las imágenes estáticas de `public/images/`, no es `next/image`. Las fotos subidas desde el dashboard (montajes/clientes/servicios) usan un pipeline runtime distinto (`uploadMediaAction`, resize+WebP vía sharp al bucket `media`) — no tienen variante AVIF ni versión `-lg`/`-md`, sirven la imagen única que sube el usuario.
- `public/videos/hero-test.mp4` — placeholder de test (Pexels, aprobado solo para verificar el mecanismo). Reemplazar por el video real del cliente en cuanto lo mande; no es asset final.
- Un solo proyecto Supabase hoy (`pfjqulqbsjmuodadvhzx.supabase.co`) — split a `-dev`/`-prod` en curso por el usuario (infra 100% manual, Regla de Oro #7). No asumir que ya existen `inglobal-dev`/`inglobal-prod` hasta confirmar en `.claude/CLAUDE.md`.

## Patrones clave
- Server Components por defecto; `'use client'` en Navbar, HeroVideo, ScrollReveal, ContactForm/Wrapper, LazyGoogleMap, WhatsAppButton, forms del dashboard.
- Server Actions para todas las mutaciones; firma estándar `(prevState: unknown, formData: FormData)`.
- Fallback-first: toda página pública sigue funcionando aunque Supabase esté caído o mal configurado (`lib/content.ts` atrapa el error y devuelve `FALLBACK_*`).
- `generateStaticParams` con try/catch en `montajes/[slug]` y `clientes/[slug]` (permite build sin credenciales Supabase).
- Todo en español (es_AR).

## Bugs pendientes
- Ninguno abierto a la fecha de esta reestructura (2026-07-04). Ver `.claude/ERRORES.md` para los ya resueltos con causa raíz no obvia.
