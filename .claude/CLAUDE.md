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
| Auth              | Supabase Auth (email+password) — protege `/dashboard/**`. `user_metadata.must_change_password` fuerza cambio de clave en el primer login (ver Quirks) |
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
  dashboard/(auth)/cambiar-password/   Gate obligatorio (must_change_password) + cambio voluntario (link en topbar del panel) — mismo layout con imagen que login
  dashboard/(panel)/            CMS protegido (ver middleware.ts)
    contenido/{hero,quienes-somos,que-hacemos,stats,cta-banner,clientes-destacados,ubicacion,footer,contacto,accesos-rapidos}/
                                 Un form por key de site_settings (accesos-rapidos = dashboard_quicklinks, cards del home del panel)
    montajes/, clientes/, servicios/   CRUD completo (listado, nuevo, [id]/editar)
    clientes/[id]/trabajos/     CRUD de trabajos del cliente (`[id]` = slug del cliente, igual que el resto). TrabajoForm.tsx usa ContentEditor (TipTap)
  globals.css                   Tailwind layers + keyframes + sistema scroll-reveal + `.prose-igb` (contenido rico de trabajos)

  manifest.ts                    PWA (Metadata API) — start_url /dashboard/agenda, scope /dashboard/
  agenda-tv/page.tsx             Vista TV kiosco de solo lectura (protegida por middleware) — usa components/agenda/AgendaReadOnlyView
  dashboard/(panel)/agenda/      CRUD agenda (page/nuevo/[id]/catalogos/calendario) + EventoForm + AgendaTvQrLink
    calendario/page.tsx          Vista de solo lectura para jefes (mismo AgendaReadOnlyView que /agenda-tv, sin links de editar/borrar, sin roles nuevos)

middleware.ts                   Auth gate de /dashboard/** + /agenda-tv/** (Next 15 — sigue siendo middleware.ts)

components/
  Navbar.tsx                    Client · glass · scroll-state · mobile burger · incluye link "Quiénes Somos" · modo oscuro sobre heroes marcados con [data-navbar="dark"] (ver Quirks)
  Footer.tsx                    Server · logo PNG · nav · contacto · CodeTlonBadge
  HeroVideo.tsx                 Client · <video> si site_settings.hero.video_url existe, si no cae a <Picture>
  ScrollReveal.tsx               Client · observer por <section>
  agenda/AgendaReadOnlyView.tsx  Listado agrupado Hoy/Mañana/Semana/Próximamente, solo lectura — compartido por /agenda-tv y /dashboard/agenda/calendario
  Picture.tsx                   <picture> AVIF+WebP pre-build (solo public/images/)
  ContactForm.tsx / ContactFormWrapper.tsx   useFormState + preselección de servicio por query param
  LazyGoogleMap.tsx             Click-to-load iframe
  RegisterSW.tsx                Client · registra public/sw.js SOLO en producción
  OfflineBanner.tsx              Client · banner fijo cuando navigator.onLine === false
  dashboard/
    Field.tsx                   Inputs del panel + ImageUpload/VideoUpload/FileUpload(PDF)/Checkbox/CheckboxGroup — ImageUpload soporta focalName/focalDefaultValue (click en el preview = focal point, ver Quirks); Image/VideoUpload usan un contador de generación para no pisar el preview si se cambia de archivo antes de que termine el upload anterior
    ContentEditor.tsx           TipTap rico (bold/italic/H2/quote/listas/link/imagen/YouTube) — reusable, folder 'trabajos/content'. Se usa envuelto en ContentEditorBoundary.tsx (error boundary, ver Quirks), no directo
    SavedToast.tsx              Toast fijo de "Guardado correctamente" — lee ?saved=1 de la URL (ver Quirks), montado una vez en (panel)/layout.tsx
    ConfirmDialog.tsx           Modal de confirmación propio (reemplaza window.confirm) — usado por DeleteButton y catálogos de Agenda
    SpanPicker.tsx               Grilla clickeable tipo bento para elegir cuántas columnas/filas ocupa una imagen (Galería) — reemplaza los <select> de texto
    PageHeader.tsx, SaveButton.tsx, DeleteButton.tsx
    PageSkeleton.tsx             Placeholder genérico (usa <Skeleton>) para los `loading.tsx` de cada sección del panel
  ui/
    skeleton.tsx                 shadcn Skeleton adaptado a tokens `igb-*` (bg-igb-surface-high, no bg-muted — este proyecto no usa CSS vars de shadcn)

app/error.tsx                    Error boundary del sitio público (branded, btn-primary/btn-outline)
app/dashboard/(panel)/error.tsx  Error boundary propio del panel (estilo CMS, no reusa el público)
app/global-error.tsx            Fallback de último recurso si el ROOT layout tira error — <html>/<body> propios, estilos inline
app/dashboard/(panel)/{agenda,clientes,contenido,galeria,montajes,servicios,usuarios}/loading.tsx
                                 Un loading.tsx por sección top-level del panel (usa PageSkeleton) — contenido/loading.tsx cubre también sus 9 subrutas anidadas (hero, quienes-somos, etc.)

lib/
  utils.ts                      cn() (clsx + tailwind-merge) — usado por components/ui/skeleton.tsx
  storage.ts                    extractStoragePath + removeMediaUrls — borrado de archivos del bucket `media`, usado por settings.ts y los delete* de montajes/clientes/trabajos/galeria
  ordering.ts                   nextFreeOrder — evita colisión de display_order/work_rank (autoincrementa al primer valor libre, con scope opcional ej. cliente_id en trabajos)
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
  generate-pwa-icons.mjs        Sharp: recorta isotipo de logo.png → public/icons/ (manual, cuando cambia el logo)

public/
  sw.js                          Service worker PWA — network-first con fallback a cache (sin librería)
  icons/                          icon-192/512/512-maskable.png + apple-touch-icon.png

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
| `site_settings` | `key` (PK text), `value` (jsonb), `updated_at` | Keys: `hero`, `quienes_somos`, `que_hacemos`, `stats`, `cta_banner`, `clientes_destacados`, `ubicacion`, `footer`, `contacto`, `dashboard_quicklinks`. Campos dentro de cada `value` deben coincidir EXACTO con `lib/constants.ts` y los forms — ver `.claude/ERRORES.md`. `updateSiteSettings` arma `value` desde TODOS los campos del form (no espera un campo `value` — ver entrada 2026-07-12 de `ERRORES.md`). `dashboard_quicklinks.items` es un **array de hrefs** (`string[]`), no `{href,label}[]` — el label se resuelve por lookup contra `QUICKLINK_CANDIDATES` (`lib/constants.ts`) al armar el form y al renderizar el home del panel; el cliente tilda de una lista fija en vez de tipear rutas a mano (`CheckboxGroup`, ya no existe `LinkList`) |
| `montajes` | slug (unique), title, excerpt, content, cover_image, **cover_image_focal** (nullable, `"X% Y%"`), **banner_image**/**banner_image_focal** (nullable), tags[], display_order, published | Blog de casos de éxito, `/montajes/[slug]`. `cover_image` = miniatura del listado; `banner_image` = foto grande del detalle (fallback a `cover_image` si no se cargó). Slug auto-generado desde `title` (`slugify`, sin scope — tabla plana), no es campo editable en el form |
| `clientes` | slug (unique), name, logo, **logo_focal** (nullable, `"X% Y%"`), bio, content, featured, **work_rank** (int, mayor = más arriba), published | "Clientes Destacados", orden por `work_rank desc`. `content` = intro/historia del cliente (párrafos separados por línea en blanco), se muestra antes de sus `trabajos`. El logo NO se muestra en `/clientes/[slug]` (solo historia + trabajos) — aparece en el home y en cada detalle de trabajo. Slug auto-generado desde `name` (`slugify`, sin scope), no es campo editable en el form |
| `servicios` | slug (unique), title, desc, specs[], img, icon, display_order, published | Detalle en `/servicios` |
| `trabajos` | `cliente_id` (FK → clientes, ON DELETE CASCADE), slug (UNIQUE junto a cliente_id), title, excerpt, content (HTML rico TipTap), cover_image, **cover_image_focal** (nullable, `"X% Y%"`), **banner_image**/**banner_image_focal** (nullable), youtube_url, **fecha** (DATE, nullable), **attachment_url** (PDF, nullable), display_order, published | Cada cliente se comporta como mini-blog: `/clientes/[slug]` lista sus trabajos paginados, cada uno con detalle propio en `/clientes/[slug]/[trabajo-slug]`. Slug auto-generado (`slugify` + sufijo `-2`/`-3` si colisiona), no es campo editable en el form. `cover_image` = miniatura del listado; `banner_image` = foto grande detrás del título (fallback a `cover_image`) |
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
- **Alta de usuarios y contraseña temporal**: Mateo sigue creando las cuentas a mano desde `/dashboard/usuarios` (no hay flujo de invitación/signup). `createAdminUser` y `resetAdminPassword` (`app/actions/users.ts`) setean `user_metadata.must_change_password: true` — `middleware.ts` lo chequea en CUALQUIER ruta de `/dashboard/**` (excepto `/dashboard/login` y la propia `/dashboard/cambiar-password`, para no generar loop) y redirige forzoso hasta que el usuario cambie la clave. `changePassword` (`app/actions/auth.ts`) limpia el flag. La misma pantalla sirve para cambio voluntario en cualquier momento (link "Cambiar mi contraseña" en `/dashboard/usuarios`, ya no en el topbar) — no depende del flag, siempre disponible. No hay roles: cualquier cuenta con acceso al panel tiene el mismo nivel de permisos.
- **Focal point de imágenes**: acotado a 3 campos (`montajes.cover_image_focal`, `trabajos.cover_image_focal`, `clientes.logo_focal`) — no es un mecanismo genérico para toda imagen del sitio. Se guarda como string `"X% Y%"` (ej. `"30% 60%"`), `null` = centro. `ImageUpload` (`Field.tsx`) solo lo activa si se le pasa `focalName` — sin ese prop, el componente se comporta exactamente igual que antes (no rompe los `ImageUpload` existentes que no lo usan). Si agregás foco a un campo nuevo, hace falta: migración `ALTER TABLE ... ADD COLUMN x_focal TEXT`, sumarlo al schema Zod correspondiente (`.nullable().optional()`), al `parse()` del server action, pasar `focalName`/`focalDefaultValue` en el form, y aplicar `style={{objectPosition: campo_focal ?? undefined}}` en el render público.
- **Navbar modo oscuro**: para que el `Navbar` (montado una sola vez en el root layout, no recibe props por página) se pinte oscuro sobre un hero oscuro, la página tiene que marcar su primer `<section>` con `data-navbar="dark"`. El componente detecta la presencia de ese atributo en el DOM vía `document.querySelector` (mismo criterio simple que `ScrollReveal.tsx`, sin Context ni prop-drilling) y combina esa detección con el estado `scrolled` existente — el modo oscuro se desactiva apenas se hace scroll o se abre el menú mobile, no hace falta IntersectionObserver porque el hero marcado siempre está al tope de la página. Si agregás una página nueva con hero oscuro, agregá el atributo ahí; si no lo marcás, el navbar sigue con el comportamiento blanco de siempre. El tono oscuro es `bg-zinc-900/90` (matchea el hero de `/montajes/[slug]`, que también es `bg-zinc-900` fijo) — solo montajes usa `data-navbar="dark"`; `/clientes/[slug]/[trabajo]` siempre usa navbar claro (aunque tenga foto de portada), es una decisión de diseño para diferenciar "caso de éxito editorial" (montajes) de "artículo de cliente" (trabajos).
- **`public/videos/opt/hero-test.mp4`** es un placeholder de test (stock de Pexels, ya pasado por `optimize-video.mjs`: 1080p/CRF20/sin audio, 10.4 MB) — no es el asset final del cliente, reemplazar con el pipeline (ver §Video del hero) cuando lo mande.
- `logo.png` venía a 2.4 MB (3199×940) — recomprimido a 800×235 (~68 KB). Si se reemplaza, mantener tamaño manageable.
- Google Maps: NUNCA `<iframe>` directo al montar — usar `LazyGoogleMap` (click-to-load).
- **`getTrabajoById` no filtra `published`** (a diferencia de `getMontaje`/`getCliente`, que sí) — es deliberado: el dashboard de edición necesita encontrar el trabajo por su `id` sin importar si está publicado. No replicar ese filtro ahí ni asumir que el resto de los getters lo omiten.
- `lucide-react` en este proyecto está en la versión `1.8.0` (no la típica `0.x`) y **no exporta `Youtube`** — usar `Video` como ícono para acciones de YouTube (ver `ContentEditor.tsx`).
- **PWA — service worker es network-first-con-fallback-a-cache, no un motor de sync offline**: si falla el fetch (sin señal) sirve la última respuesta cacheada de esa misma URL, no hay reconciliación de escrituras pendientes ni cola de reintentos. Solo se registra en producción (`NODE_ENV === 'production'`, ver `RegisterSW.tsx`) — nunca en `next dev`, rompería el HMR. Para invalidar todo el cache del cliente tras un cambio grande, bump del nombre `CACHE` en `public/sw.js`.
- **Instalar la PWA en iPhone**: abrir `/dashboard/agenda` (logueado) en Safari → Compartir → "Agregar a inicio". Si se instala desde otra página, algunas versiones de Safari toman esa página como punto de entrada en vez del `start_url` del manifest.
- **Íconos de la PWA** (`public/icons/`) son el isotipo circular recortado de `logo.png` sobre fondo `#f5d100` — el wordmark completo es ilegible a tamaño de ícono de celular. Regenerar con `node scripts/generate-pwa-icons.mjs` si el logo cambia.
- **`ContentEditorBoundary.tsx`**: `TrabajoForm` importa el editor de texto rico a través de este wrapper (error boundary de clase), no directo desde `ContentEditor.tsx`. Si TipTap explota al parsear contenido legacy en edición, cae a un `<textarea>` plano con el HTML crudo en vez de tirar abajo todo el form — no sacar este wrapper de en medio ni reemplazarlo por el import directo.
- **Feedback de guardado en el panel — `SavedToast.tsx`**: los CRUD con `redirect()` en éxito (montajes/clientes/servicios/trabajos/galería/eventos de agenda, ver Fase 2/7) agregan `?saved=1` a la URL de destino; `SavedToast` (montado una vez en `(panel)/layout.tsx` dentro de un `Suspense`, usa `useSearchParams`) lo detecta, muestra un toast fijo 3s y limpia el query param con `router.replace`. Si agregás un CRUD nuevo con redirect en éxito, sumale `?saved=1` para que también dispare el toast — no hace falta tocar `SavedToast.tsx`. Las páginas de `site_settings` (`contenido/*`) siguen con su banner verde inline (no redirigen, son forms de singleton), no las migres a este mecanismo.

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
| 2026-07-06 | **Feature: Agenda de Grúas** (dashboard CRUD `/dashboard/agenda` + catálogos + TV kiosco `/agenda-tv`). Migración `009_agenda.sql` (`gruas`/`empresas_agenda`/`operarios`/`eventos_agenda`/`eventos_operarios`, RLS solo `authenticated`). `CheckboxGroup` nuevo en `Field.tsx` para asignar operarios. |
| 2026-07-11 | **Seguridad + progressive loading** (rama `chore/security-headers-loading-states`, sesión abierta, sin mergear): headers de seguridad en `next.config.mjs` (X-Frame-Options DENY, HSTS, nosniff, Referrer-Policy, Permissions-Policy). RLS auditado en las 9 migraciones — sin gaps. Sin `app/api/**` en el proyecto — CORS N/A (todo por Server Actions). `Skeleton` (shadcn adaptado a tokens `igb-*`) + `loading.tsx` por sección top-level del panel. Error boundaries branded (`app/error.tsx`, `app/dashboard/(panel)/error.tsx`, `app/global-error.tsx`). Nuevas deps: `clsx`, `tailwind-merge` (para `cn()`). |
| 2026-07-06 | **PWA instalable (reemplaza el plan de app nativa Expo, ver `inglobal-app`)**: personal de campo usa iPhones sin presupuesto para Apple Developer/App Store. `app/manifest.ts` (Metadata API, `start_url: /dashboard/agenda`, `scope: /dashboard/`) + `appleWebApp`/`apple-touch-icon` en `app/layout.tsx` + íconos generados con `scripts/generate-pwa-icons.mjs` (recorta el isotipo circular del logo sobre fondo `#f5d100`). Service worker propio (`public/sw.js`, sin librería) network-first-con-fallback-a-cache para que abra y muestre la última agenda conocida con señal mala; `OfflineBanner` avisa cuando está sirviendo datos cacheados. Sidebar del panel (`(panel)/layout.tsx`) ahora es un drawer off-canvas en `<lg` (antes rompía en mobile, ancho fijo sin colapsar). |
| 2026-07-11 | **Fixes post-QA, Fase 1/7 — integridad de datos** (rama `fix/integridad-datos-storage-agenda`, mergeada a `dev`, `main` sin tocar): nuevo `lib/storage.ts` (`removeMediaUrls`) — "Quitar" en `ImageUpload`/`VideoUpload` y los `delete*` de montajes/clientes/trabajos/galería ahora borran también el archivo del bucket `media` (antes quedaba huérfano). Fix bug Agenda "Invalid input: expected string, received null": los 4 schemas de `lib/validations/agenda.ts` pasan sus campos opcionales a `.nullable()` (un `<select>`/input ausente en el FormData manda `null`, no `undefined`); `SelectField` gana un prop `placeholder` para que un select sin elección explícita mande `""` en vez de omitirse. Patente/capacidad de grúa y teléfono de operario pasan a obligatorios. Nuevo `lib/ordering.ts` (`nextFreeOrder`) — `display_order`/`work_rank` ya no se pisan entre registros, se autoincrementan al valor libre (scope por `cliente_id` en trabajos). Plan completo de 7 fases post-QA en curso, resto pendiente. |
| 2026-07-12 | **Fixes post-QA, Fase 7/7 — auth** (rama `feat/auth-cambio-password`, mergeada a `dev`, `main` sin tocar) — **plan de 7 fases post-QA completo**: alta de usuarios y reset de contraseña (`app/actions/users.ts`) setean `user_metadata.must_change_password: true`. `middleware.ts` fuerza redirect a `/dashboard/cambiar-password` en cualquier ruta de `/dashboard/**` hasta que se cambie (ver Quirks para el detalle de por qué no genera loop). Nueva `changePassword` en `app/actions/auth.ts`, misma pantalla sirve para el gate obligatorio y para cambio voluntario (link nuevo en el topbar del panel). Nueva ruta `dashboard/(auth)/cambiar-password/` (mismo layout con imagen que login, de la Fase 5). Sin roles nuevos — decisión ya tomada al planificar. |
| 2026-07-12 | **Fixes post-QA, Fase 6/7 — features nuevas de contenido** (rama `feat/trabajos-fecha-pdf-focal-point-spanpicker`, mergeada a `dev`, `main` sin tocar; migraciones 011-015 aplicadas a dev): `trabajos.fecha` (DATE nullable) se muestra en el detalle público. `trabajos.attachment_url` — adjunto PDF opcional (`FileUpload` nuevo en `Field.tsx`, límite 8MB, link "Descargar PDF" en el público). Focal point de imágenes (`cover_image_focal` en montajes/trabajos, `logo_focal` en clientes, todas nullable) — `ImageUpload` gana `focalName`/`focalDefaultValue`: click en el preview calcula `"X% Y%"` y lo aplica como `objectPosition` en el render público. `SpanPicker.tsx` nuevo — reemplaza los 4 `<select>` de texto de `GaleriaForm.tsx` por una grilla clickeable, mismo contrato de datos (`col_span_*`/`row_span_*`), sin tocar `app/actions/galeria.ts` ni el schema. |
| 2026-07-12 | **Fixes post-QA, Fase 5/7 — dashboard misceláneos + fix crítico de guardado** (rama `feat/dashboard-misc-titulo-accesos-login`, mergeada a `dev`, `main` sin tocar): corregido bug preexistente que impedía guardar cualquier form de `contenido/*` — ver entrada 2026-07-12 en `.claude/ERRORES.md` para la causa raíz completa. Título del panel: "Grúas InGlobal S.R.L. — CMS" → "Grúas InGlobal S.R.L.". Nueva key `dashboard_quicklinks` en `site_settings` + página `/dashboard/contenido/accesos-rapidos` (nuevo `LinkList` en `Field.tsx`) — los accesos rápidos del home del panel dejan de estar hardcodeados y se editan desde ahí, con mejor estilo (cards con ícono). Login del dashboard (`(auth)/layout.tsx`) con imagen a la izquierda en desktop (`lg:grid-cols-2`, `Picture src="igb-5"` de placeholder, 50vw x 100vh), sin cambios en mobile. |
| 2026-07-12 | **Fixes post-QA, Fase 4/7 — estilos del sitio público** (rama `style/sitio-publico-navbar-hero-blog`, mergeada a `dev`, `main` sin tocar): `Navbar.tsx` gana modo oscuro sobre heroes marcados `data-navbar="dark"` (ver Quirks) — aplicado en `/montajes/[slug]` (siempre) y `/clientes/[slug]/[trabajo]` (solo con `cover_image`). Logo de cliente en `/clientes/[slug]` sobre card blanca con sombra. `.prose-igb img` corregido (antes `width:100%` forzado sin `max-height`, ahora tamaño natural acotado por `max-width`/`max-height`) — corrige imágenes chicas estiradas/pixeladas y fotos verticales que desbordaban el artículo. Sección "Qué Hacemos" del home recortada a foto+título+tags (se sacaron ícono circular y `desc`; los tags ahora muestran todo `servicio.specs`, no solo `specs[0]`) — `ICON_MAP` y imports de íconos correspondientes eliminados de `app/page.tsx` por quedar sin uso. Botón flotante de WhatsApp eliminado (`components/WhatsAppButton.tsx` + CSS del pulse ring en `globals.css`), junto con su test E2E. Suite Playwright 24/24 OK. |
| 2026-07-11 | **Fixes post-QA, Fase 3/7 — Agenda** (rama `feat/agenda-catalogos-vista-jefes`, mergeada a `dev`, `main` sin tocar): edición de grúas vía modo inline en `CatalogSection.tsx` (antes solo alta/toggle/borrado — quitado el comentario "YAGNI"), migración `010_gruas_tipo.sql` (`gruas.tipo`, default `'Grúa'`, enum Grúa/Hidrogrúa/Camión/Otro en `lib/validations/agenda.ts` → `TIPOS_GRUA`), aplicada a dev vía `db-sync-dev.mjs --yes` (wipe+replay, único mecanismo disponible). Nueva vista `/dashboard/agenda/calendario` (solo lectura, sin roles nuevos) — extraída la lógica de agrupamiento Hoy/Mañana/Semana/Próximamente de `/agenda-tv` a `components/agenda/AgendaReadOnlyView.tsx`, compartida por ambas rutas. `TextField` gana `min`/`max` (usado en la fecha de eventos, rango hoy-7d/+6m, solo validación nativa del navegador). |
| 2026-07-11 | **Fixes post-QA, Fase 2/7 — UX de formularios** (rama `fix/ux-forms-dashboard`, mergeada a `dev`, `main` sin tocar): los server actions de éxito (`create`/`update`/`delete` de montajes, clientes, servicios, trabajos, galería, eventos de agenda) ahora llaman `redirect()` a la página base tras `revalidatePath` en vez de `return {success:true}` — el `redirect()` va DESPUÉS del try/catch (no dentro), así su excepción `NEXT_REDIRECT` nunca pasa por el catch genérico. Los forms correspondientes (`MontajeForm`/`ClienteForm`/`ServicioForm`/`TrabajoForm`/`GaleriaForm`/`EventoForm`) perdieron el banner verde de éxito y el prop `successMessage` (el redirect desmonta el form; el banner rojo de error se mantiene igual). Excepción documentada: los catálogos inline de Agenda (grúas/empresas/operarios en `CatalogSection.tsx`) NO redirigen — son forms en la misma página de listado, no hay "base" a la que volver. Nuevo `components/dashboard/ConfirmDialog.tsx` (modal propio, sin librería) reemplaza `window.confirm` en `DeleteButton.tsx` y `CatalogSection.tsx`. `ImageUpload`/`VideoUpload` en `Field.tsx` ganan preview optimista vía `URL.createObjectURL` (revocado al llegar la URL real o al desmontar). |
| 2026-07-13 | **Ronda 2 post-QA, Fase 9/12 — UX del dashboard** (rama `feat/dashboard-ux-fase9`, en curso, `dev`/`main` sin tocar todavía): `ContentEditorBoundary.tsx` nuevo (error boundary, ver Quirks) — el editor de texto rico ya no puede tirar abajo el form de trabajos si el contenido legacy le rompe el parseo a TipTap. `ImageUpload`/`VideoUpload` (`Field.tsx`) ganan un contador de generación para no pisar el preview si se cambia de archivo antes de que termine el upload anterior (race condition real, no solo teórica). Los 22 formularios del panel pasan de `max-w-2xl` a `max-w-4xl` (menos espacio vacío en desktop); el embed de YouTube dentro de `ContentEditor` ya no desborda (nueva clase `.tiptap-editor` en `globals.css`, mismo criterio que `.prose-igb` del público). Slug automático en montajes y clientes (`slugify` desde título/nombre, tabla plana sin scope) — mismo patrón que trabajos, sacado el input manual de "Slug (URL)" de ambos forms. Accesos rápidos del panel pasan de texto libre a checklist predefinido (`QUICKLINK_CANDIDATES` en `lib/constants.ts`, `dashboard_quicklinks.items` ahora es `string[]` de hrefs en vez de `{href,label}[]`, `LinkList` eliminado de `Field.tsx`). "Cambiar contraseña" se saca del topbar del panel y pasa a `/dashboard/usuarios`. Scrollbar delgada en sidebar/contenido del panel (`.dashboard-scroll-dark`/`-light`). `SavedToast.tsx` nuevo (ver Quirks) — toast de confirmación tras guardar/borrar en los CRUD que redirigen. |
| 2026-07-13 | **Ronda 2 post-QA, Fase 8/12 — contenido público** (rama `feat/contenido-publico-fase8`, mergeada a `dev`, `main` sin tocar): sección "Qué Hacemos" del home recortada a solo foto+título (se sacaron los tags de `servicio.specs`, título más grande). Navbar oscuro pasa a `bg-zinc-900/90` (matchea el tono real del hero de `/montajes/[slug]`, antes era negro `zinc-950` genérico); `/clientes/[slug]/[trabajo]` deja de marcar `data-navbar="dark"` — siempre navbar claro, para distinguirse de montajes. Badge de nombre de cliente en el detalle de trabajo pasa a estilo navy (antes yellow, igual que montajes) — refuerza la distinción visual entre "caso de éxito" (montajes) y "artículo de cliente" (trabajos). Logo de cliente sacado de `/clientes/[slug]` (ahora es pura historia + lista de trabajos) y sumado como apartado propio en el detalle de cada trabajo. Nueva columna `banner_image`/`banner_image_focal` en `montajes` y `trabajos` (migración `016_montajes_trabajos_banner.sql`) — separa la miniatura del listado (`cover_image`) de la foto grande del detalle (`banner_image`, con fallback a `cover_image` si no se cargó una propia); overlay del hero de trabajo un escalón más oscuro. Plan completo de 5 fases (8-12) en `C:\Users\mateo\.claude\plans\ingenieria-en-movimiento-solo-spicy-quail.md`, resto pendiente. |
| 2026-07-13 | **Ronda 2 post-QA, Fase 10/12 — Agenda: validaciones** (rama `feat/agenda-validaciones-calendario-video`, en curso): `empresaAgendaSchema` pasa `contacto`/`telefono` a obligatorios (mismo criterio que operarios). `eventoAgendaSchema` gana `superRefine`: fecha no puede ser anterior a hoy (antes permitía `hoy-7d`), `hora_fin` debe ser al menos 15 min después de `hora_inicio` — antes solo validado por HTML nativo, ahora también server-side; `EventoForm.tsx` agrega el mismo chequeo de horario client-side (`onSubmit`, sin librería). `trabajoSchema` rechaza `fecha` futura (`.refine()`), `TrabajoForm.tsx` suma `max={hoy}` al input. Fix: link "Agenda de Grúas" del sidebar gana `exact: true` (antes `pathname.startsWith` marcaba Agenda activa también en `/calendario` y `/catalogos`). |
| 2026-07-13 | **Ronda 2 post-QA, Fase 11/12 — Rediseño del calendario** (rama `feat/agenda-validaciones-calendario-video`, en curso): reemplazado el listado agrupado Hoy/Mañana/Semana/Próximamente (`AgendaReadOnlyView.tsx`, eliminado por quedar sin uso) por dos vistas nuevas en CSS Grid puro (sin librería de calendario): `components/agenda/AgendaWeekView.tsx` (grilla semanal, columnas=días/filas=franjas horarias 7-19hs cada 30min vía constante `SLOT_MINUTES`, usada en `/dashboard/agenda/calendario` — scroll horizontal nativo en mobile, sin JS de selector de día) y `components/agenda/AgendaMonthView.tsx` (grilla mensual clásica, usada en `/agenda-tv`, cada celda muestra cantidad + primeros 3 eventos). Nuevo `lib/agenda-view.ts` — helpers puros de fecha (`getWeekStart`/`getWeekDays`/`getMonthMatrix`) y **estado auto-derivado**: `getEstadoVisual()` muestra un evento `programado` como "finalizado" en las vistas de solo lectura si su hora de fin ya pasó, sin tocar la DB (recalculado en cada render, sin cron). `getEventosAgenda` (`lib/agenda.ts`) gana parámetro `hasta` (antes solo `desde`). Nuevo `components/agenda/AgendaKioskHeader.tsx` (logo + fecha/hora + link de vuelta opcional), compartido por ambas vistas — "app aparte" sin sidebar del panel: `/dashboard/agenda/calendario` ahora es `fixed inset-0 z-[110]` (mismo truco que ya usaba `/agenda-tv` con `z-[100]` para tapar el Navbar/Footer del layout raíz, acá tapa además el shell del panel). Navegación semana anterior/siguiente vía query param `?week=`. Logo hardcodeado a `/images/logo.png` (blanco) porque ambas vistas son de fondo oscuro por diseño — si se agrega una versión clara algún día, ahí sí swapear a `logo.webp`. Build + tsc + lint OK. |

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
| agenda de grúas / flota / TV-kiosco (`/dashboard/agenda`, `/agenda-tv`) | Ya integrado en este repo (migración `009_agenda.sql`) — ver Historial de Cambios e Imágenes/PWA acá mismo |
| PWA instalable / acceso mobile del personal de campo | `app/manifest.ts` + `public/sw.js` + `scripts/generate-pwa-icons.mjs`, todo en este repo. `inglobal-app` (Expo) queda **pausado** — ver su propio TASKS.md |

Regla: leer SOLO el módulo que la tarea pide (disciplina de tokens), no todos por las dudas.
