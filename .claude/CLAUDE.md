# Grúas InGlobal — Project Brief for Claude

> Sitio institucional de Grúas InGlobal S.R.L. (Córdoba, AR), con **dashboard CMS** para editar casi todo el contenido sin tocar código. Reescritura de un sitio PHP legacy a Next.js 15, deployado en **Vercel**.

---

## Identidad del Proyecto

- **Cliente:** Grúas InGlobal S.R.L.
- **Tipo:** L3 (Dashboard/CMS sobre sitio institucional)
- **Generado:** 2026 (migración desde PHP legacy)
- **URL Producción:** pendiente confirmar (Vercel, dominio `gruasinglobal.com`)
- **Repo GitHub:** `codetlon/inglobal-site` (nota: el repo se renombró a `CodeTlon/inglobal-site` — el remote actual sigue funcionando por redirect)
- **Deploy prod:** Vercel, rama `main`
- **Deploy dev:** Vercel Preview, rama `dev`

---

## Stack

| Capa              | Tecnología                                                       |
| ----------------- | ---------------------------------------------------------------- |
| Framework         | **Next.js 15.5** (App Router, RSC, SSG)                          |
| Lenguaje          | TypeScript 5                                                     |
| UI                | Tailwind CSS 3.4 + design tokens custom (ver §Design System)     |
| Fonts             | Manrope (headlines) + Inter (body), vía `next/font/google`       |
| Iconos            | `lucide-react`                                                   |
| Form validation   | Zod + react-hook-form + `@hookform/resolvers`                    |
| Server Actions    | Contacto (Resend) + CRUD dashboard (`site_settings`/`montajes`/`clientes`/`servicios`/`trabajos`) |
| DB                | Supabase (Postgres + RLS), doble proyecto dev/prod — `contact_leads`, `site_settings`, `montajes`, `clientes`, `servicios`, `trabajos` |
| Rich text (trabajos) | TipTap (`@tiptap/react` + extensions) — mismo patrón que gc2/blog: imágenes vía `uploadMediaAction`, embeds de YouTube, `sanitizeHtml` antes de `dangerouslySetInnerHTML` |
| Auth              | Supabase Auth (email+password) — protege `/dashboard/**`         |
| Storage           | Supabase Storage, bucket `media` (fotos de montajes/clientes/servicios + video del hero) |
| Email             | Resend (`info@gruasinglobal.com`)                                |
| Imágenes estáticas | **Pre-build pipeline**: sharp → AVIF + WebP · `<Picture>` (solo `public/images/`, no las subidas por el dashboard) |
| Maps              | Google Maps iframe, **lazy-mounted on click** (privacy/perf)     |
| Tests E2E         | Playwright (25 tests · 3 viewports: 375 / 768 / 1280 · puerto dedicado 3310) |
| Deploy            | **Vercel** — todo lo que se haga debe respetar esa plataforma    |

---

## Mapa de Archivos Clave

```
app/
  layout.tsx                    Root layout · fonts · ScrollReveal · Navbar · Footer · JSON-LD
  page.tsx                      Home: hero (video) → Qué Hacemos → CTA → galería bento → Clientes Destacados → ubicación
  quienes-somos/page.tsx        Página propia (antes era sección del home)
  servicios/page.tsx            CRUD-backed, detalle de servicios
  montajes/page.tsx             Listado (blog) de montajes
  montajes/[slug]/page.tsx      Detalle de montaje (tipo blog post)
  clientes/page.tsx             "Clientes Destacados", ordenado por work_rank desc
  clientes/[slug]/page.tsx      Detalle de cliente: hero (logo/bio) → historia (cliente.content) → trabajos (blog paginado, si tiene)
  clientes/[slug]/ClienteTrabajos.tsx   Client · grid + paginación (PER_PAGE=6) de trabajos del cliente
  clientes/[slug]/[trabajo]/page.tsx    Detalle de un trabajo: hero opcional (cover), excerpt, YouTube embed, contenido rico (.prose-igb)
  galeria/page.tsx              Portafolio operativo (bento)
  contacto/page.tsx             Form + datos + mapa
  aviso-legal/page.tsx          Legal
  actions/
    contact.ts                  'use server' → Zod → Supabase insert → Resend
    settings.ts                 CRUD site_settings + uploadMediaAction (sharp resize/WebP → bucket media)
    montajes.ts                 CRUD montajes
    clientes.ts                 CRUD clientes
    servicios.ts                CRUD servicios
    trabajos.ts                 CRUD trabajos (uniqueSlug scoped por cliente_id, sin redirect — mismo patrón state-return que el resto)
    auth.ts                     login/logout del dashboard
  dashboard/(auth)/login/       Login del CMS (Supabase Auth, sin signup público)
  dashboard/(panel)/            CMS protegido (ver middleware.ts)
    contenido/{hero,quienes-somos,que-hacemos,stats,cta-banner,clientes-destacados,ubicacion,footer,contacto}/
                                 Un form por key de site_settings
    montajes/, clientes/, servicios/   CRUD completo (listado, nuevo, [id]/editar)
    clientes/[id]/trabajos/     CRUD de trabajos del cliente (`[id]` = slug del cliente, igual que el resto). TrabajoForm.tsx usa ContentEditor (TipTap)
  globals.css                   Tailwind layers + keyframes + sistema scroll-reveal + `.prose-igb` (contenido rico de trabajos)

middleware.ts                   Auth gate de /dashboard/** (Next 15 — sigue siendo middleware.ts)

components/
  Navbar.tsx                    Client · glass · scroll-state · mobile burger · incluye link "Quiénes Somos"
  Footer.tsx                    Server · logo PNG · nav · contacto · CodeTlonBadge
  HeroVideo.tsx                 Client · <video> si site_settings.hero.video_url existe, si no cae a <Picture>
  ScrollReveal.tsx               Client · observer por <section>
  Picture.tsx                   <picture> AVIF+WebP pre-build (solo public/images/)
  ContactForm.tsx / ContactFormWrapper.tsx   useFormState + preselección de servicio por query param
  LazyGoogleMap.tsx             Click-to-load iframe
  WhatsAppButton.tsx            Server · floating CTA
  dashboard/
    Field.tsx                   Inputs del panel + ImageUpload/VideoUpload/Checkbox
    ContentEditor.tsx           TipTap rico (bold/italic/H2/quote/listas/link/imagen/YouTube) — reusable, folder 'trabajos/content'
    PageHeader.tsx, SaveButton.tsx, DeleteButton.tsx

lib/
  supabase.ts                   createClient (browser/RSC) + service client
  supabase-server.ts            createSupabaseServerClient (cookies SSR, @supabase/ssr)
  content.ts                    Getters con fallback: getSiteSettings, getMontajes/getMontaje,
                                 getClientes (orden work_rank desc)/getCliente, getServicios,
                                 getTrabajos(clienteId)/getTrabajo(clienteId,slug) (published-only, sin fallback estático),
                                 getTrabajoById(id) (NO filtra published — uso exclusivo del dashboard)
  constants.ts                  FALLBACK_SITE_SETTINGS / FALLBACK_MONTAJES / FALLBACK_CLIENTES —
                                 nombres de campo DEBEN coincidir con los que leen las páginas/forms
  validations/{cliente,contact,montaje,servicio,trabajo}.ts   Zod schemas
  sanitize.ts                   sanitizeHtml — regex-based (script/style/on*/javascript:), portado de gc2, previo a dangerouslySetInnerHTML
  youtube.ts                    parseYoutubeId / youtubeEmbedUrl — portado de gc2

scripts/
  optimize-images.mjs           Sharp pipeline: sources → AVIF + WebP en /public/images/opt/ (build)

supabase/migrations/
  001_contact_leads.sql
  002_site_settings.sql
  003_montajes.sql
  004_clientes.sql
  005_servicios.sql
  006_storage_media.sql         Bucket `media` (lectura pública, escritura authenticated)
  007_trabajos.sql              Tabla trabajos (FK cliente_id → clientes, UNIQUE (cliente_id, slug))

public/images/
  igb-1..10.webp                 Fotos de operaciones — SOURCES (no se sirven directo)
  opt/                            Variantes pre-generadas (AVIF + WebP, sizes md/lg) — SE SIRVEN ESTAS
  opt/manifest.json               Dimensiones de cada source (anti-CLS)
  logo.webp / logo.png            Logo color (Navbar) / gancho blanco (Footer)
  logos/*.png                     25 logos de clientes

public/videos/
  hero-test.mp4                   Placeholder de test (Pexels, aprobado solo para verificar el mecanismo
                                   del hero). Reemplazar por el video real del cliente en cuanto lo mande.
```

Ver [`ARCHITECTURE.md`](../ARCHITECTURE.md) para el mapa de "qué abrir según qué cambio".

---

## Base de Datos (Supabase)

**Doble Supabase (dev/prod)**, patrón estándar de la fábrica:

| Entorno | Ref | Rama | Env file |
|---|---|---|---|
| `inglobal-dev` | `sdlwcxkbgfqnmawijvmn` | `dev` (Vercel Preview) | `.env.development.local` |
| `inglobal-prod` | `jiextxxopwzyjqiianrs` | `main` (Vercel Production) | `.env.production.local` |

Migraciones en `supabase/migrations/*.sql`, aplicadas a dev vía `node scripts/db-sync-dev.mjs --yes` (wipe + replay limpio, lee `.env.supabase.local` gitignored). **Prod se promueve a mano** al mergear a `main` — este script nunca toca prod.

RLS: lectura pública (`anon` + `authenticated`), escritura solo `authenticated` (mismo patrón en todas las tablas de contenido).

| Tabla | Campos clave | Notas |
|-------|-------------|-------|
| `contact_leads` | name, empresa, email, phone, servicio, message | Insert desde el form público (`actions/contact.ts`), sin RLS de lectura pública |
| `site_settings` | `key` (PK text), `value` (jsonb), `updated_at` | Keys: `hero`, `quienes_somos`, `que_hacemos`, `stats`, `cta_banner`, `clientes_destacados`, `ubicacion`, `footer`, `contacto`. Campos dentro de cada `value` deben coincidir EXACTO con `lib/constants.ts` y los forms — ver `.claude/ERRORES.md` |
| `montajes` | slug (unique), title, excerpt, content, cover_image, tags[], display_order, published | Blog de casos de éxito, `/montajes/[slug]` |
| `clientes` | slug (unique), name, logo, bio, content, featured, **work_rank** (int, mayor = más arriba), published | "Clientes Destacados", orden por `work_rank desc`. `content` = intro/historia del cliente (párrafos separados por línea en blanco), se muestra antes de sus `trabajos` |
| `servicios` | slug (unique), title, desc, specs[], img, icon, display_order, published | Detalle en `/servicios` |
| `trabajos` | `cliente_id` (FK → clientes, ON DELETE CASCADE), slug (UNIQUE junto a cliente_id), title, excerpt, content (HTML rico TipTap), cover_image, youtube_url, display_order, published | Cada cliente se comporta como mini-blog: `/clientes/[slug]` lista sus trabajos paginados, cada uno con detalle propio en `/clientes/[slug]/[trabajo-slug]`. Slug auto-generado (`slugify` + sufijo `-2`/`-3` si colisiona), no es campo editable en el form |
| Storage `media` | — | Bucket único: fotos de montajes/clientes/servicios/trabajos (sharp resize+WebP) + imágenes embebidas en el contenido rico de trabajos + video del hero (sin transformar) |

---

## Variables de Entorno

Dos sets — dev y prod — cada uno en su propio `.env.*.local` (gitignored). Ver también `.env.example` en la raíz.

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY      ← server-only, usado en Server Actions
RESEND_API_KEY                 ← server-only
RESEND_FROM_NAME               (opt, default "InGlobal")
RESEND_FROM_EMAIL              (opt, default "onboarding@resend.dev")
COMPANY_EMAIL                  (opt, default "info@gruasinglobal.com")
```

`.env.supabase.local` (gitignored, solo para `scripts/db-sync-dev.mjs`): `SUPABASE_ACCESS_TOKEN` + `SUPABASE_DEV_PROJECT_REF` + `SUPABASE_DEV_DB_PASSWORD`.

**Pendiente:** `RESEND_API_KEY` / `RESEND_FROM_EMAIL` de prod todavía sin completar (esperando que Mateo pase la key real).

---

## Diseño — Decisiones Clave

Tokens custom en `tailwind.config.ts`:

| Token                    | Hex       | Uso                                  |
| ------------------------ | --------- | ------------------------------------ |
| `igb-yellow`             | `#f5d100` | CTA, accents                         |
| `igb-yellow-dark`        | `#6f5d00` | texto amarillo sobre claro           |
| `igb-on-yellow`          | `#221b00` | texto sobre botón amarillo           |
| `igb-navy`               | `#1C357F` | acentos secundarios                  |
| `igb-secondary`          | `#575d78` | texto secundario                     |
| `igb-surface`            | `#f8f9fa` | fondo base                           |
| `igb-surface-low/-high`  | varios    | fondos por densidad                  |
| `igb-on-surface`         | `#191c1d` | texto principal                      |
| `igb-outline`            | `#cfc6ab` | borders sutiles                      |

Tipografías: Manrope (headlines, 400-800) + Inter (body, 300-600).

Utilidades custom (`app/globals.css`): `.container-igb`, `.section-pad`, `.label-tag`, `.heading-display`, `.heading-hero`, `.btn-primary`, `.btn-outline`, `.btn-outline-white`, `.card-igb`.

---

## Imágenes — pipeline pre-build (contenido estático del template)

El sitio **no usa el Vercel Image Optimizer** para las fotos del template original. Pipeline propio en `scripts/optimize-images.mjs`: pre-genera AVIF+WebP en dos tamaños, servidas por `<Picture>` con `<picture><source>` nativo.

- Fotos de contenido del template → `<Picture>`. Logos chicos → `next/image`.
- **No** servir imágenes directo desde `/public/images/<name>.webp` en producción.
- Fotos subidas desde el **dashboard** (montajes/clientes/servicios) van por un pipeline runtime distinto (`uploadMediaAction`, sharp resize≤2000px + WebP q82 → bucket `media`) — sin variantes AVIF ni tamaños `-lg`/`-md`, se sirve la imagen única subida.

### Cómo agregar una imagen nueva al template (no al dashboard)
1. Dropearla en `public/images/<nombre>.{webp,png,jpg}`.
2. Correr `npm run optimize:images` (o `npm run build`, el prebuild lo hace).
3. Usar en JSX: `<Picture src="<nombre>" alt="..." width={W} height={H} />`.

## Video del hero — pipeline pre-build (`scripts/optimize-video.mjs`)

Mismo criterio que las imágenes: el video que mande el cliente puede pesar cualquier cosa (el placeholder actual venía en 4K a 24 Mbps, 36 MB por 12s). El pipeline re-encodea a H.264 CRF 20 (visualmente sin pérdida), sin audio (el hero siempre va `muted loop`), tope 1920px de ancho y `+faststart`. El resultado (`public/videos/opt/`) es lo único que se commitea — el source crudo está en `.gitignore` (`/public/videos/*` salvo `opt/`).

**Importante:** `ffmpeg` es un binario de sistema, no una dependencia de npm — Vercel no lo tiene en su imagen de build. El script chequea si existe y si no, se salta sin fallar (`prebuild` no se rompe en Vercel). Por eso el flujo es siempre local:

1. Dropear el video del cliente en `public/videos/<nombre>.<ext>` (mp4/mov/mkv/webm).
2. Correr `npm run optimize:video` (requiere `ffmpeg` instalado local — `apt/brew install ffmpeg`).
3. Subir el resultado (`public/videos/opt/<nombre>.mp4`) desde el dashboard (Contenido → Hero) o apuntar `hero.video_url` a `/videos/opt/<nombre>.mp4` si se sirve como asset estático del repo.
4. Commitear solo lo que quedó en `public/videos/opt/`.

---

## Animaciones

`components/ScrollReveal.tsx` — observer por `<section>` entera (no por elemento), todos los `[data-animate]` adentro reciben `data-visible` al mismo tiempo. `data-delay` solo para secuencias cortas (header de página: 0/100/200ms). No usar arrays de delays largos en grids. Reduced motion: todo cae a `opacity:1; transform:none; transition:none`.

Hero: `hero-anim hero-anim-d1..d5` (CSS directo, no ScrollReveal) + `hero-bg-zoom` (10s slow zoom) cuando NO hay video. Con video activo (`HeroVideo.tsx`), el `<video autoPlay muted loop playsInline>` reemplaza la imagen con zoom; pausa/no autoplay bajo `prefers-reduced-motion`.

---

## Quirks y Advertencias

- **Contrato de nombres `site_settings` ↔ `lib/constants.ts` ↔ forms**: si agregás un campo nuevo a una key, actualizalo en los 3 lugares (migración/seed, fallback, form del dashboard) o el público queda desincronizado sin error visible. Ya pasó una vez esta sesión — ver `.claude/ERRORES.md`.
- **`playwright.config.ts` usa el puerto 3310**, no 3000 — esta máquina corre otros proyectos Next en paralelo y Playwright no detecta el puerto equivocado (ver Bug 37 de la fábrica).
- **`public/videos/opt/hero-test.mp4`** es un placeholder de test (stock de Pexels, ya pasado por `optimize-video.mjs`: 1080p/CRF20/sin audio, 10.4 MB) — no es el asset final del cliente, reemplazar con el pipeline (ver §Video del hero) cuando lo mande.
- `logo.png` venía a 2.4 MB (3199×940) — recomprimido a 800×235 (~68 KB). Si se reemplaza, mantener tamaño manageable.
- Google Maps: NUNCA `<iframe>` directo al montar — usar `LazyGoogleMap` (click-to-load).
- **`getTrabajoById` no filtra `published`** (a diferencia de `getMontaje`/`getCliente`, que sí) — es deliberado: el dashboard de edición necesita encontrar el trabajo por su `id` sin importar si está publicado. No replicar ese filtro ahí ni asumir que el resto de los getters lo omiten.
- **Checkbox de `published` en los forms**: `montajes`/`clientes`/`servicios` NO tienen un campo de checkbox real para `published` en sus forms — el form nunca lo envía, así que `formData.get('published')` da `null` y el Zod coerce lo vuelve `false` siempre (el `.default(true)` del schema no aplica porque el valor no es `undefined`). Es una limitación preexistente de esos 3 forms, fuera de alcance arreglarla acá. `TrabajoForm` sí tiene un `Checkbox` real (nuevo, en `Field.tsx`) — no repitas el bug ahí.
- `lucide-react` en este proyecto está en la versión `1.8.0` (no la típica `0.x`) y **no exporta `Youtube`** — usar `Video` como ícono para acciones de YouTube (ver `ContentEditor.tsx`).

---

## Comandos Rápidos

```bash
npm run dev               # dev server
npm run build             # SSG build (corre optimize:images en prebuild)
npm run start             # serve build
npm run lint              # next lint
npm run optimize:images   # regenera /public/images/opt/ (idempotente)
npx tsc --noEmit          # type check
npx playwright test       # E2E (puerto 3310)
```

---

## Historial de Cambios

| Fecha | Cambio |
|-------|--------|
| 2026-05-21 | Refactor anim sistema (trigger por sección) + footer sin barra negra + logo PNG en footer |
| 2026-05-21 | Pipeline propio de imágenes (sharp → AVIF+WebP) + `<Picture>` |
| 2026-06-19 | Seguridad: Next 14.2.35 → 15.5.19 (0 HIGH vulns), `WhatsAppButton` montado en layout, 25/25 E2E |
| 2026-07-04 | **Fase 1 — Reestructura + Dashboard CMS**: home reordenado (Hero video → Qué Hacemos → resto), Quiénes Somos a página propia, Montajes y Clientes a formato blog con detalle por slug, Clientes → "Clientes Destacados" ordenado por `work_rank`, dashboard admin completo (`site_settings`/`montajes`/`clientes`/`servicios` CRUD, Supabase Auth). Fix: unificación de claves `site_settings` (bug de causa no obvia). Fix: puerto dedicado Playwright (3310). Creados `ARCHITECTURE.md`, `MANUAL-PRUEBAS.md`, `.claude/ERRORES.md`, `commands/cambio.md`+`cerrar.md` (archivos estándar de fábrica que faltaban). Mergeado a `dev` y pusheado a origin; `main` sin tocar. |
| 2026-07-04 | **Doble Supabase dev/prod**: creados `inglobal-dev`/`inglobal-prod`, migraciones 001-006 aplicadas a ambos, `.env.development.local`/`.env.production.local`/`.env.supabase.local` + `scripts/db-sync-dev.mjs` (copiado de gc2). Fix: columna reservada `desc` sin comillas en `005_servicios.sql`. Pendiente: `RESEND_API_KEY` de prod. |
| 2026-07-04 | **Feature: Trabajos por cliente (mini-blog)**: nueva tabla `trabajos` (FK `cliente_id`, migración `007_trabajos.sql`) — cada cliente puede tener N trabajos con contenido rico (TipTap, portado de gc2: imágenes, links, YouTube), listado paginado en `/clientes/[slug]` (intro/historia del cliente vía `content` + grid de trabajos) y detalle propio en `/clientes/[slug]/[trabajo-slug]`. Dashboard CRUD en `clientes/[id]/trabajos/`. Nuevas deps: `@tiptap/*`, `slugify`. Nuevo `.prose-igb` en `globals.css` (sin plugin de Tailwind typography, igual que gc2). Build + tsc + lint OK, migración aplicada a dev. |

---

## Módulos de la fábrica — consultar en `/cambio` según lo que toques

Estos módulos viven en `codetlon-cloud/.claude/modules/` (desde este repo: `../../codetlon-cloud/.claude/modules/`). NO están copiados acá: leé el que aplique al iniciar una sesión de mantenimiento que toque cada tema.

| Si el `/cambio` toca… | Módulo a leer |
|---|---|
| deps / vulnerabilidades (`npm audit`, actualizar libs, upgrade de major) | `security-maintenance.md` |
| auth / DB / RLS / route handler / form / env / secrets (seguridad de **código**) | `security-owasp.md` |
| UI / componentes / forms / páginas (accesibilidad WCAG, Lighthouse a11y > 90) | `accessibility.md` |
| pipeline / `.github/workflows` / Dockerfile / env vars (CI = gate de calidad) | `ci-cd.md` |
| dejar el proyecto live / incidente en producción (monitoreo) | `observability.md` |
| agenda de grúas / flota / TV-kiosco / app móvil (Fase 2, repo `inglobal-app`) | Fuera de alcance de este `.claude/CLAUDE.md` — iniciativa aparte, TASKS.md propio |

Regla: leer SOLO el módulo que la tarea pide (disciplina de tokens), no todos por las dudas.
