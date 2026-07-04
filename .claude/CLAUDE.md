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
| Server Actions    | Contacto (Resend) + CRUD dashboard (`site_settings`/`montajes`/`clientes`/`servicios`) |
| DB                | Supabase (Postgres + RLS) — `contact_leads`, `site_settings`, `montajes`, `clientes`, `servicios` |
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
  clientes/[slug]/page.tsx      Detalle de cliente (bio/historia de trabajo conjunto)
  galeria/page.tsx              Portafolio operativo (bento)
  contacto/page.tsx             Form + datos + mapa
  aviso-legal/page.tsx          Legal
  actions/
    contact.ts                  'use server' → Zod → Supabase insert → Resend
    settings.ts                 CRUD site_settings + uploadMediaAction (sharp resize/WebP → bucket media)
    montajes.ts                 CRUD montajes
    clientes.ts                 CRUD clientes
    servicios.ts                CRUD servicios
    auth.ts                     login/logout del dashboard
  dashboard/(auth)/login/       Login del CMS (Supabase Auth, sin signup público)
  dashboard/(panel)/            CMS protegido (ver middleware.ts)
    contenido/{hero,quienes-somos,que-hacemos,stats,cta-banner,clientes-destacados,ubicacion,footer,contacto}/
                                 Un form por key de site_settings
    montajes/, clientes/, servicios/   CRUD completo (listado, nuevo, [id]/editar)
  globals.css                   Tailwind layers + keyframes + sistema scroll-reveal

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
    Field.tsx                   Inputs del panel + ImageUpload/VideoUpload
    PageHeader.tsx, SaveButton.tsx, DeleteButton.tsx

lib/
  supabase.ts                   createClient (browser/RSC) + service client
  supabase-server.ts            createSupabaseServerClient (cookies SSR, @supabase/ssr)
  content.ts                    Getters con fallback: getSiteSettings, getMontajes/getMontaje,
                                 getClientes (orden work_rank desc)/getCliente, getServicios
  constants.ts                  FALLBACK_SITE_SETTINGS / FALLBACK_MONTAJES / FALLBACK_CLIENTES —
                                 nombres de campo DEBEN coincidir con los que leen las páginas/forms
  validations/{cliente,contact,montaje,servicio}.ts   Zod schemas

scripts/
  optimize-images.mjs           Sharp pipeline: sources → AVIF + WebP en /public/images/opt/ (build)

supabase/migrations/
  001_contact_leads.sql
  002_site_settings.sql
  003_montajes.sql
  004_clientes.sql
  005_servicios.sql
  006_storage_media.sql         Bucket `media` (lectura pública, escritura authenticated)

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

**Estado actual (2026-07-04): un solo proyecto Supabase** (`pfjqulqbsjmuodadvhzx.supabase.co`), sin split dev/prod todavía. El usuario está creando ahora `inglobal-dev` / `inglobal-prod` siguiendo el patrón estándar de la fábrica (Golden Rule "Doble Supabase") — cuando estén listos, actualizar esta sección con los refs reales y promover las migraciones 002-006 a prod.

RLS: lectura pública (`anon` + `authenticated`), escritura solo `authenticated` (mismo patrón en las 4 tablas de contenido).

| Tabla | Campos clave | Notas |
|-------|-------------|-------|
| `contact_leads` | name, empresa, email, phone, servicio, message | Insert desde el form público (`actions/contact.ts`), sin RLS de lectura pública |
| `site_settings` | `key` (PK text), `value` (jsonb), `updated_at` | Keys: `hero`, `quienes_somos`, `que_hacemos`, `stats`, `cta_banner`, `clientes_destacados`, `ubicacion`, `footer`, `contacto`. Campos dentro de cada `value` deben coincidir EXACTO con `lib/constants.ts` y los forms — ver `.claude/ERRORES.md` |
| `montajes` | slug (unique), title, excerpt, content, cover_image, tags[], display_order, published | Blog de casos de éxito, `/montajes/[slug]` |
| `clientes` | slug (unique), name, logo, bio, content, featured, **work_rank** (int, mayor = más arriba), published | "Clientes Destacados", orden por `work_rank desc` |
| `servicios` | slug (unique), title, desc, specs[], img, icon, display_order, published | Detalle en `/servicios` |
| Storage `media` | — | Bucket único: fotos de montajes/clientes/servicios (sharp resize+WebP) + video del hero (sin transformar) |

---

## Variables de Entorno

Hoy un solo set (proyecto Supabase único). Cuando exista el split dev/prod, pasar a `.env.development.local` / `.env.production.local` por convención de fábrica.

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY      ← server-only, usado en Server Actions
RESEND_API_KEY                 ← server-only
RESEND_FROM_NAME               (opt, default "InGlobal")
RESEND_FROM_EMAIL              (opt, default "onboarding@resend.dev")
COMPANY_EMAIL                  (opt, default "info@gruasinglobal.com")
```

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

---

## Animaciones

`components/ScrollReveal.tsx` — observer por `<section>` entera (no por elemento), todos los `[data-animate]` adentro reciben `data-visible` al mismo tiempo. `data-delay` solo para secuencias cortas (header de página: 0/100/200ms). No usar arrays de delays largos en grids. Reduced motion: todo cae a `opacity:1; transform:none; transition:none`.

Hero: `hero-anim hero-anim-d1..d5` (CSS directo, no ScrollReveal) + `hero-bg-zoom` (10s slow zoom) cuando NO hay video. Con video activo (`HeroVideo.tsx`), el `<video autoPlay muted loop playsInline>` reemplaza la imagen con zoom; pausa/no autoplay bajo `prefers-reduced-motion`.

---

## Quirks y Advertencias

- **Contrato de nombres `site_settings` ↔ `lib/constants.ts` ↔ forms**: si agregás un campo nuevo a una key, actualizalo en los 3 lugares (migración/seed, fallback, form del dashboard) o el público queda desincronizado sin error visible. Ya pasó una vez esta sesión — ver `.claude/ERRORES.md`.
- **`playwright.config.ts` usa el puerto 3310**, no 3000 — esta máquina corre otros proyectos Next en paralelo y Playwright no detecta el puerto equivocado (ver Bug 37 de la fábrica).
- **`public/videos/hero-test.mp4`** es un placeholder de test (stock de Pexels, aprobado solo para verificar el mecanismo de video del hero) — no es el asset final del cliente, reemplazar cuando lo mande.
- Un solo proyecto Supabase hoy — el split dev/prod está en curso, no asumir que ya existen `inglobal-dev`/`inglobal-prod` sin confirmar.
- `logo.png` venía a 2.4 MB (3199×940) — recomprimido a 800×235 (~68 KB). Si se reemplaza, mantener tamaño manageable.
- Google Maps: NUNCA `<iframe>` directo al montar — usar `LazyGoogleMap` (click-to-load).

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
