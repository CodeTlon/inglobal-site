# ARCHITECTURE — Grúas InGlobal

Arquitectura real del proyecto, con el porqué de las decisiones. Reemplaza al `ARCHITECTURE.md` de la raíz (ahora un stub) — este es el que se mantiene.

## Stack

Next.js **15.5** (App Router, RSC) · TypeScript 5 (`strict: true`) · Tailwind CSS 3.4 + tokens custom (`igb-*`) · Zod **v4** (no v3) · Supabase (Postgres + RLS + Auth + Storage) · TipTap v3 (rich text) · react-hook-form + `@hookform/resolvers` · Resend (email) · Playwright (E2E, puerto 3310) · Vercel (deploy). Sin alias `src/` — todo cuelga de la raíz (`app/`, `components/`, `lib/`).

## Dos capas de mutación, con propósitos distintos

- **Server Actions** (`app/actions/*.ts`) — mutación principal del sitio público y del dashboard web. Firma estándar `(prevState: unknown, formData: FormData)`. Los CRUD con éxito hacen `redirect()` después del try/catch (para que la excepción `NEXT_REDIRECT` no caiga en el catch genérico) agregando `?saved=created|updated|deleted` a la URL de destino (dispara `SavedToast`).
- **`app/api/**` (Route Handlers)** — capa REST aparte, **exclusiva para la app mobile** (`inglobal-agenda-app`), autenticada por Bearer token vía `lib/supabase-api.ts` (reenvía el JWT como header en vez de cookies). No es CORS-facing del navegador del sitio público — es machine-to-machine con la app mobile. Incluye: CRUD de agenda, cron de transición de estados, clientes, servicios, `auth/check-email`, y 4 endpoints de `tv-pair` (ver más abajo). `app/robots.ts` bloquea `/api/` de la indexación.

Si vas a agregar una mutación nueva: si la usa el sitio público o el dashboard web, es un Server Action. Si la va a consumir la app mobile, es un Route Handler en `app/api/**` con auth Bearer.

## Cinco clientes Supabase distintos — cuál usar cuándo

| Cliente | Archivo | Uso |
|---|---|---|
| Browser + admin | `lib/supabase.ts` | Cliente browser (uploads directos desde el navegador, ver Convenciones) + cliente admin (`service_role`) |
| SSR cookie-based + admin | `lib/supabase-server.ts` | `createSupabaseServerClient` (RSC/Server Actions, sesión vía cookies `@supabase/ssr`) + `createSupabaseAdminClient` |
| Bearer-token (API) | `lib/supabase-api.ts` | Exclusivo de `app/api/**` — la app mobile manda el JWT como header, no cookies. `requireApiUser` devuelve directo el `Response` de error (401 sin sesión, 403 con `must_change_password`) en vez de `null`, para que una ruta nueva no pueda olvidarse del chequeo |
| Inline en middleware | `middleware.ts`, `app/api/tv-pair/exchange/route.ts` | Cada uno instancia su propio `createServerClient` (mismo patrón `@supabase/ssr`), no reusan `supabase-server.ts` |
| Microservicio aparte | `services/video-transcode/server.js` | Cliente propio (`SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY`), vive fuera del runtime de Next |

No es un esquema "doble Supabase" simple — son 5 puntos de entrada distintos según de dónde corre el código y qué tipo de sesión tiene disponible.

## Auth — un solo tipo de cuenta, sin roles

- Supabase Auth (email+password), sin signup público — `createAdminUser` (`app/actions/users.ts`) requiere ya estar logueado (`requireUser()`).
- `must_change_password` (en `user_metadata`): `middleware.ts` fuerza redirect a `/dashboard/cambiar-password` en cualquier ruta de `/dashboard/**` hasta que se cambie (excepto login y la propia pantalla de cambio, para no generar loop). **También se enforce en `app/api/**`**: `requireApiUser` (`lib/supabase-api.ts`) devuelve 403 en las 14 rutas de la capa REST si `must_change_password: true` — antes del fix (`ee7d4ff`, rama `fix/must-change-password-api`) la app mobile podía seguir operando indefinidamente con una contraseña temporal. **Todavía no mergeado a `main`** — ver `.ai/context/CURRENT_STATE.md`.
- **Sin roles**: cualquier cuenta autenticada tiene acceso total al panel web y a la app mobile (vía `app/api/**`). Hubo un sistema de roles `admin`/`trabajador` (migraciones `022`/`023`) que se eliminó — ver `.ai/context/DECISIONS.md` para el porqué y qué queda de esa historia (incluido un gap de seguridad real que tuvo `is_admin()` en el camino, relevante si se lo vuelve a tocar).
- `is_admin()` (función de Postgres, migración `031_drop_trabajador_role.sql`) gatea la escritura en `site_settings`/`montajes`/`clientes`/`servicios`/`trabajos`/`galeria`/`media` — hoy es solo `auth.role() = 'authenticated'`, se mantiene el nombre por no tener que tocar cada policy que ya la usa.
- La agenda nunca tuvo restricción por rol — siempre fue de acceso compartido a cualquier cuenta autenticada.

## Agenda como sub-sistema propio

- Estados: `reserva → programado → en_curso → finalizado`, o `cancelado` desde `reserva`/`programado`/`en_curso` — sin retroceso (`TRANSICIONES_VALIDAS`, `lib/validations/agenda.ts`).
- Auto-transición de estado sin intervención humana: `estadoTransicionado`/`getEstadoVisual` (`lib/agenda-business.ts`, `lib/agenda-view.ts`) recalculan el estado efectivo en cada lectura (una `reserva` vencida sin confirmar se muestra cancelada, un `programado`/`en_curso` que ya pasó su ventana se muestra finalizado) — y además un **workflow de GitHub Actions** (`.github/workflows/cron-transicionar-estados.yml`, `*/15 * * * *`, le pega a `/api/agenda/cron/transicionar-estados` con `CRON_SECRET`) persiste esos cambios en la DB, no es solo cosmético en la UI. **No es un cron de Vercel** — ver `.ai/context/DECISIONS.md` (el plan Hobby de Vercel solo permite 1 corrida de cron nativo por día; uno cada 15min bloqueaba silenciosamente todos los deploys).
- Prevención de solapamiento en dos niveles: `buscarConflicto()` (chequeo en memoria antes de insertar/actualizar) + un constraint real a nivel de base (`024_eventos_agenda_no_overlap.sql`, `EXCLUDE USING gist` con extensión `btree_gist` para grúas, `pg_advisory_xact_lock` para operarios vía tabla puente; extendido en `030_eventos_agenda_no_overlap_medianoche.sql` para turnos nocturnos sin `fecha_hasta` explícita donde `hora_fin <= hora_inicio` — el fin real cae al día siguiente) — el constraint de DB existe porque el chequeo en memoria por sí solo tiene una race condition real bajo escritura concurrente ("check-then-insert").
- `validarOperarios()` exige al menos un operario asignado y bloquea operarios `activo:false`.
- `getRecursosOcupados()` marca grúas/operarios ocupados usando el estado **efectivo** (no la columna cruda), para no marcar "ocupado" algo que ya venció.

## TV pairing (kiosco `/agenda-tv`)

Pantalla de TV sin teclado — no puede loguearse con email/password. Pairing tipo Netflix: la TV muestra un QR (`/agenda-tv/pair`, excluido del gate de auth de `middleware.ts`), un admin lo escanea desde el panel y autoriza el dispositivo. Tabla `tv_pairing_codes` (migración `021_tv_pairing.sql`) con RLS habilitado y **cero policies** (deny-by-default) — todo el acceso pasa por Route Handlers (`/api/tv-pair/*`) usando `service_role`, nunca directo desde el cliente.

## Pipeline de imágenes y video

- **Imágenes del template** (`public/images/`): pre-build, `scripts/optimize-images.mjs` (sharp → AVIF+WebP en dos tamaños), servidas por `<Picture>`. No usa el Image Optimizer de Vercel.
- **Fotos subidas desde el dashboard** (montajes/clientes/servicios/trabajos/galería): pipeline runtime distinto, `uploadMediaAction` (sharp resize≤2000px + WebP q82 → bucket `media`), sin variantes AVIF ni tamaños `-lg`/`-md`.
- **Video del hero**: mismo criterio dual — `scripts/optimize-video.mjs` (build, requiere `ffmpeg` local) y `lib/video-transcode.ts` (runtime, dentro de `uploadMediaAction`) re-encodean a H.264 CRF 20 sin audio, tope 1920px, `+faststart`.
- **`services/video-transcode/`**: microservicio Node/Express aparte (con `Dockerfile`), **ya implementado e integrado** (`lib/transcode-token.ts`, `app/actions/transcode.ts`, vía `NEXT_PUBLIC_TRANSCODE_SERVICE_URL`) — existe porque el runtime de Vercel no trae `ffmpeg`. Si el servicio no está configurado, el upload cae con soft-fail (sube el archivo sin transcodificar, no rompe nada). No confundir con "pendiente": la integración en el código principal ya está lista, lo que puede faltar es solo el hosting real del microservicio (ver `.ai/context/OPEN_QUESTIONS.md`).

## SEO, Analytics y CSP (agregado en el commit `96d2442`)

- `components/GoogleAnalytics.tsx` — gtag.js con **Consent Mode v2**, `consent: default` en `denied` hasta que el usuario elige.
- `components/CookieConsent.tsx` — banner propio (sin librería), guarda la elección en `localStorage`, solo se muestra si `NEXT_PUBLIC_GA_ID` está seteado y no es el placeholder.
- `app/sitemap.ts` (incluye rutas de `trabajos` anidadas por cliente) y `app/robots.ts` (bloquea `/dashboard/` y `/api/`).
- `public/llms.txt` — descubribilidad para LLMs (AEO/GEO).
- CSP endurecida en `next.config.mjs`, **solo en producción** (`NODE_ENV === 'production'`, para no romper HMR) — permite `googletagmanager.com`/`google-analytics.com` y el origen dinámico de `NEXT_PUBLIC_TRANSCODE_SERVICE_URL`.

## Deploy

- Vercel, **sin integración Git conectada** — deploy manual (`vercel --prod`), según `docs/deployment-guide.md`.
- Dominio `gruasinglobal.com` todavía no cortado a la producción real — sigue sirviendo desde el alias `*.vercel.app` (ver `lib/site.ts`).
- `.github/workflows/cron-transicionar-estados.yml` dispara el cron de transición de estados de agenda (GitHub Actions, no Vercel — ver `.ai/context/DECISIONS.md`). Es el único workflow del repo; no es un gate de calidad.
- Sin CI/CD de calidad (nada corre `lint`/`tsc`/`build`/tests automáticamente en push o PR) — ese gate sigue siendo local/manual, corrido antes de mergear.

## Patrones estructurales

- Server Components por defecto; `'use client'` solo donde hace falta interactividad (Navbar, HeroVideo, ScrollReveal, ContactForm/Wrapper, LazyGoogleMap/LazyYoutubeEmbed, forms del dashboard).
- Fallback-first en el sitio público: `lib/content.ts` atrapa errores de Supabase y devuelve `FALLBACK_*` (`lib/constants.ts`) — el sitio sigue funcionando aunque Supabase esté caído o mal configurado. `generateStaticParams` con try/catch en `montajes/[slug]` y `clientes/[slug]` permite buildear sin credenciales.
- Todo en español (es_AR).
