# Grúas InGlobal — Project Brief for Claude

> Sitio institucional de Grúas InGlobal S.R.L. (Córdoba, AR). Reescritura de un sitio PHP legacy a Next.js 14, deployado en **Vercel**.

---

## Stack

| Capa              | Tecnología                                                       |
| ----------------- | ---------------------------------------------------------------- |
| Framework         | **Next.js 14.2** (App Router, RSC, SSG)                          |
| Lenguaje          | TypeScript 5                                                     |
| UI                | Tailwind CSS 3.4 + design tokens custom (ver §Design System)     |
| Fonts             | Manrope (headlines) + Inter (body), vía `next/font/google`       |
| Iconos            | `lucide-react`                                                   |
| Form validation   | Zod + react-hook-form + `@hookform/resolvers`                    |
| Server Actions    | Form de contacto: Supabase insert + Resend email                 |
| DB                | Supabase (tabla `contact_leads`)                                 |
| Email             | Resend (`info@gruasinglobal.com`)                                |
| Imágenes          | **Pre-build pipeline**: sharp → AVIF + WebP estáticos · `<Picture>` |
| Maps              | Google Maps iframe, **lazy-mounted on click** (privacy/perf)     |
| Tests E2E         | Playwright (25 tests · 3 viewports: 375 / 768 / 1280)            |
| Deploy            | **Vercel** — todo lo que se haga debe respetar esa plataforma    |

---

## Estructura

```
app/
  layout.tsx              Root layout · fonts · ScrollReveal · Navbar · Footer · JSON-LD
  page.tsx                Home: hero / about / servicios / CTA / galería bento / clientes / mapa
  servicios/page.tsx      Detalle de 4 servicios (filas alternadas)
  montajes/page.tsx       Grid de casos de éxito
  galeria/page.tsx        Portafolio operativo (bento)
  clientes/page.tsx       Grid de 25 logos
  contacto/page.tsx       Form + datos + mapa
  aviso-legal/page.tsx    Legal
  actions/contact.ts      'use server' → Zod parse → Supabase insert → Resend send
  globals.css             Tailwind layers + keyframes + sistema scroll-reveal

components/
  Navbar.tsx              Client · glass · scroll-state · mobile burger
  Footer.tsx              Server · logo PNG · nav · contacto · barra inferior con CodeTlon inline
  ScrollReveal.tsx        Client · observer por <section>, no por elemento (ver §Animaciones)
  Picture.tsx             <picture> con sources AVIF + WebP (ver §Imágenes)
  ContactForm.tsx         Client · useFormState + useFormStatus
  ContactFormWrapper.tsx  Wrapper con useSearchParams (preselección de servicio)
  LazyGoogleMap.tsx       Click-to-load iframe
  WhatsAppButton.tsx      Server · floating CTA

lib/
  supabase.ts             createClient + createSupabaseServiceClient
  validations/contact.ts  Zod schema

scripts/
  optimize-images.mjs     Sharp pipeline: sources → AVIF + WebP en /public/images/opt/

public/images/
  igb-1..10.webp          Fotos de operaciones — SOURCES (no se sirven directo)
  opt/                    Variantes pre-generadas (AVIF + WebP, sizes md/lg) — SE SIRVEN ESTAS
  opt/manifest.json       Dimensiones de cada source (anti-CLS)
  logo.webp               Logo color (~12 KB) — Navbar — pasa por next/image
  logo.png                Logo blanco/gancho (~68 KB) — Footer — pasa por next/image
  logos/*.png             25 logos de clientes — pasan por next/image (no vale la pena pipeline)
```

---

## Imágenes — pipeline pre-build (importante)

El sitio **no usa el Vercel Image Optimizer para fotos de contenido**. En su lugar
hay un pipeline propio en `scripts/optimize-images.mjs` que pre-genera variantes
AVIF + WebP en dos tamaños, y un componente `<Picture>` que las sirve con
`<picture><source>` nativo. Razón: cero costo de transformación en runtime,
delivery instantáneo desde el CDN de Vercel, y el navegador elige el formato.

### Flujo

```
public/images/igb-3.webp           ←  source (pongas la que pongas: webp/png/jpg)
        ↓  scripts/optimize-images.mjs (corre en prebuild + a mano)
public/images/opt/
  igb-3-md.avif  (max 960px wide, q=65, effort=6)
  igb-3-md.webp  (max 960px wide, q=85, effort=6)
  igb-3-lg.avif  (max 1920px wide, q=65, effort=6)
  igb-3-lg.webp  (max 1920px wide, q=85, effort=6)
  manifest.json  ← dimensiones de cada source
```

### Cómo agregar una imagen nueva

1. Dropearla en `public/images/<nombre>.{webp,png,jpg}`.
2. Correr `npm run optimize:images` (o simplemente `npm run build`, el prebuild lo hace).
3. Usar en JSX: `<Picture src="<nombre>" alt="..." width={W} height={H} />`.

El script es idempotente (compara mtimes) — corre cientos de veces sin re-encodear.

### Componente `<Picture>` (`components/Picture.tsx`)

```tsx
// Modo con dimensiones (no-fill) — reserva layout, evita CLS
<Picture src="igb-3" alt="..." width={1920} height={1440} sizes="100vw" />

// Modo fill — absoluto dentro de un parent posicionado (hero, bento, etc.)
<Picture src="igb-3" alt="..." fill sizes="100vw" className="object-cover" />

// LCP — eager + fetchpriority=high + sync decode
<Picture src="igb-3" alt="..." fill priority sizes="100vw" />
```

`src` acepta tanto el basename (`"igb-3"`) como la ruta del source (`"/images/igb-3.webp"`)
— se normaliza internamente.

### Reglas

- **Fotos de contenido → `<Picture>`**. Cobertura completa: hero, about, CTAs, galería, montajes, servicios.
- **Logos chicos (Navbar, Footer, /clientes) → `next/image`**. No vale la pena meterlos al pipeline (ya son <20 KB).
- **No** servir imágenes directo desde `/public/images/<name>.webp` en producción. Eso bypasea el pipeline.
- **No** bajar `quality` en el script para "ahorrar más". 85 WebP / 65 AVIF es visualmente lossless para fotos de obra.
- Si necesitás un size adicional (ej. `xl` para banners 2560+), agregalo en `SIZES` del script.

## Vercel — qué tener en cuenta

- Las fotos servidas desde `/public/images/opt/` se cachean como **static assets**: TTL casi infinito en el edge de Vercel.
- `next/image` (logos) sigue usando el optimizer — para PNGs chicos no es problema.
- `next.config.mjs` deja `formats: ['image/avif', 'image/webp']` y `minimumCacheTTL: 60 días` por si en el futuro se reintroduce `next/image` para más imágenes.
- Redirects de `*.php` → rutas nuevas configurados ahí (SEO legacy).

### Env vars (Vercel Project Settings)

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY      ← server-only, usado en Server Action
RESEND_API_KEY                 ← server-only
RESEND_FROM_NAME               (opt, default "InGlobal")
RESEND_FROM_EMAIL              (opt, default "onboarding@resend.dev")
COMPANY_EMAIL                  (opt, default "info@gruasinglobal.com")
```

---

## Design System

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

Utilidades custom (en `app/globals.css`):

```
.container-igb    → max-w-7xl mx-auto px-6
.section-pad      → py-24 lg:py-32
.label-tag        → label amarillo uppercase tracking-widest
.heading-display  → h2 de secciones
.heading-hero     → h1 de hero
.btn-primary      → CTA amarillo
.btn-outline      → outline gris
.btn-outline-white → outline blanco sobre fondo oscuro
.card-igb         → card blanca con shadow + hover lift
```

Tipografías:
- Headlines: **Manrope** — pesos 400/500/600/700/800
- Body: **Inter** — pesos 300/400/500/600

---

## Animaciones — IMPORTANTE

El sistema fue rediseñado para evitar el efecto "por filas" que sentía pesado:

### Cómo funciona ahora (`components/ScrollReveal.tsx`)

1. CSS oculta `[data-animate]` SOLO cuando `<html>` tiene `js-ready` (no hay FOUC sin JS).
2. El observer mira **secciones enteras** (`section, [data-animate-root]`), no elementos sueltos.
3. Cuando una sección cruza el viewport, **todos** los `[data-animate]` adentro reciben `data-visible` al mismo tiempo.
4. Si un elemento tiene `data-delay="100"` (etc.), igual respeta su delay individual — pero arranca desde el mismo evento. Ideal para secuencias chiquitas (h1 → p → btn).

### Reglas de uso

- ✅ Headers de página: secuencia corta con delays `0 / 100 / 200`.
- ✅ Bloques que se quieren "smooth" (label → h2 → párrafo → lista): cascada chica máx 300ms.
- ❌ **No** poner `data-delay` por item en grids (cards, galería, logos). Cascada larga se siente trabada.
- ❌ **No** usar arrays tipo `DELAYS[i]` con 10-25 valores. Eso fue lo que provocó la queja del usuario.
- Para forzar reveal grupal fuera de un `<section>` real: poner `data-animate-root` en el contenedor padre.

### Hero animations (aparte)

El hero usa CSS animations directos (`hero-anim hero-anim-d1..d5`) — no pasan por `ScrollReveal`. Son `animation-fill-mode: both` para evitar FOUC. La imagen tiene `hero-bg-zoom` (10s slow zoom).

### Reduced motion

Todo el sistema cae a `opacity: 1; transform: none; transition: none` bajo `prefers-reduced-motion: reduce`.

---

## Form de contacto — flujo

```
ContactForm (client)
  ↓ submit
useFormState → sendContact (Server Action 'use server')
  1. Zod parse → si falla, return { error }
  2. supabase.from('contact_leads').insert(...)         ← persiste lead aunque email falle
  3. resend.emails.send({ html: <tabla HTML inline> })  ← notif a info@gruasinglobal.com
  ↓
{ success: true } | { error: string }
```

`ContactFormWrapper` lee `?servicio=...` del URL (los CTAs de la página `/servicios` pasan el slug) para preseleccionar el dropdown.

---

## Convenciones a respetar

- **No componentes nuevos sin razón**. Hay 8 components total — agregar uno se justifica si se reusa o desacopla.
- **No abstraer prematuramente** la lista de servicios/clientes/galería: viven como const arriba de cada page como datos estáticos. No mover a JSON ni a CMS sin pedirlo.
- **Server Components por default**; `'use client'` solo donde hace falta (state, listeners, `useFormState`).
- **No instalar libs sin pedirlo** (animation libs, carousels, etc.). El stack actual cubre todo.
- **Imágenes nuevas**: meter en `/public/images/`. Si son fotos grandes, exportar como WebP (~80% quality) y dejar que Vercel haga el resto.
- **Logos en footer/dark bg**: usar `logo.png` (variante con gancho blanco). En Navbar/light bg usar `logo.webp`.
- **Mobile-first**: todas las páginas testean en 375 / 768 / 1280.

---

## Performance — gotchas conocidos

- **`logo.png` venía a 2.4 MB** (3199×940). Recomprimido a 800×235 (~68 KB) con sharp + palette. Si se vuelve a reemplazar, mantener tamaño manageable.
- **Hero LCP**: `igb-3.webp` source pasa por el pipeline → se sirve como `igb-3-lg.avif` (~395 KB) o `igb-3-md.avif` (~154 KB) según viewport. `priority` en `<Picture>` añade fetchpriority=high.
- **Galería**: 12 imágenes; sólo la primera con `priority`. El resto lazy.
- **Google Maps**: NUNCA cargar directo en `<iframe>` al montar. Usar `LazyGoogleMap` (click-to-load) — sino Google inyecta cookies y mata el Best Practices score.
- **Si una foto se ve mal** después del pipeline: subir `quality` de AVIF (65→75) o de WebP (85→92) en `scripts/optimize-images.mjs` y re-correr.

---

## Comandos

```bash
npm run dev               # dev server
npm run build             # SSG build (corre optimize:images en prebuild)
npm run start             # serve build
npm run lint              # next lint
npm run optimize:images   # regenera /public/images/opt/ (idempotente)
npx tsc --noEmit          # type check
npx playwright test       # E2E
```

---

## Pendientes / posibles mejoras (FYI, no tocar sin pedir)

- Sitemap.xml + robots.txt
- OG image dinámica
- Schema.org adicional (Service, Organization)
- Lighthouse CI en GitHub Actions

---

## Historia rápida

1. **Migración PHP → Next.js 14** (commit `5c8f26d`)
2. E2E + docs (`db97334`, `fb79ef0`)
3. Refactor de imágenes a AVIF/WebP + lazy maps + a11y (`b0fddc6`)
4. Sistema scroll-reveal + micro-animations (`93f4a6f`)
5. **Refactor anim sistema → trigger por sección, no por item** + footer sin barra negra de CodeTlon + logo PNG en footer (sesión actual, 2026-05-21)
6. **Pipeline propio de imágenes** (sharp → AVIF + WebP estáticos) + componente `<Picture>` — reemplaza Vercel Image Optimizer para fotos de contenido (sesión actual, 2026-05-21)
