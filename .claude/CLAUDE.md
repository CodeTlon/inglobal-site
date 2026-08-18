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
| DB                | Supabase (Postgres + RLS), doble proyecto dev/prod — `contact_leads`, `site_settings`, `montajes`, `clientes`, `servicios`, `trabajos`, `galeria` |
| Rich text (trabajos) | TipTap (`@tiptap/react` + extensions) — mismo patrón que gc2/blog: imágenes vía `uploadMediaAction`, embeds de YouTube, `sanitizeHtml` antes de `dangerouslySetInnerHTML` |
| Auth              | Supabase Auth (email+password) — protege `/dashboard/**`. `user_metadata.must_change_password` fuerza cambio de clave en el primer login (ver Quirks) |
| Storage           | Supabase Storage, bucket `media` (fotos de montajes/clientes/servicios + video del hero) |
| Email             | Resend (`cotizacionesinglobalsrl@gmail.com`)                                |
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
  clientes/page.tsx             Split en dos secciones: grid clickeable (ClientesGrid, clientes con tiene_blog=true) + carrusel automático de solo-logo (ClientesLogoMarquee, tiene_blog=false)
  clientes/[slug]/page.tsx      Detalle de cliente (solo si tiene_blog=true, si no 404): hero (logo/bio) → historia (cliente.content) → trabajos (blog paginado, si tiene)
  clientes/[slug]/ClienteTrabajos.tsx   Client · grid + paginación (PER_PAGE=6) de trabajos del cliente
  clientes/[slug]/[trabajo]/page.tsx    Detalle de un trabajo: hero opcional (cover), excerpt, YouTube embed, contenido rico (.prose-igb)
  galeria/page.tsx              Portafolio bento — CMS-backed (`getGaleria()`), reemplaza el array hardcodeado original; cada imagen define su propio span de grid
  contacto/page.tsx             Form + datos + mapa
  aviso-legal/page.tsx          Legal
  not-found.tsx                 404 personalizada (branded, agregada en la ronda de fixes del 2026-07-17)
  actions/
    contact.ts                  'use server' → Zod → Supabase insert → Resend
    settings.ts                 CRUD site_settings + uploadMediaAction (sharp resize/WebP → bucket media)
    montajes.ts                 CRUD montajes
    clientes.ts                 CRUD clientes
    servicios.ts                CRUD servicios (alta/edición/borrado — dejó de ser catálogo fijo de 4 filas, ver Historial 2026-07-17/20)
    trabajos.ts                 CRUD trabajos (uniqueSlug scoped por cliente_id, sin redirect — mismo patrón state-return que el resto)
    galeria.ts                  CRUD galeria (imagen, alt, spans col/row por breakpoint mobile/desktop, display_order)
    auth.ts                     login/logout del dashboard
  dashboard/(auth)/login/       Login del CMS (Supabase Auth, sin signup público)
  dashboard/(auth)/cambiar-password/   Gate obligatorio (must_change_password) + cambio voluntario (link en topbar del panel) — mismo layout con imagen que login
  dashboard/(panel)/            CMS protegido (ver middleware.ts)
    contenido/{hero,quienes-somos,que-hacemos,stats,cta-banner,clientes-destacados,ubicacion,footer,contacto,accesos-rapidos}/
                                 Un form por key de site_settings (accesos-rapidos = dashboard_quicklinks, cards del home del panel)
    montajes/, clientes/, servicios/, galeria/   CRUD completo (listado, nuevo, [id]/editar) — GaleriaForm.tsx usa SpanPicker para elegir spans
    clientes/[id]/trabajos/     CRUD de trabajos del cliente (`[id]` = slug del cliente, igual que el resto). TrabajoForm.tsx usa ContentEditor (TipTap)
  globals.css                   Tailwind layers + keyframes + sistema scroll-reveal + `.prose-igb` (contenido rico de trabajos)

  manifest.ts                    PWA (Metadata API) — start_url /dashboard/agenda, scope /dashboard/
  agenda-tv/page.tsx             Vista TV kiosco de solo lectura (protegida por middleware) — usa components/agenda/AgendaMonthView (oscura, sin click, pensada para verse a distancia)
  dashboard/(panel)/agenda/      CRUD agenda (page/nuevo/[id]/catalogos/calendario) + EventoForm + AgendaTvQrLink
    calendario/page.tsx          Vista semanal de jefes (components/agenda/AgendaWeekView, tema claro) — click en un evento abre AgendaEventModal con el detalle

middleware.ts                   Auth gate de /dashboard/** + /agenda-tv/** (Next 15 — sigue siendo middleware.ts)

components/
  Navbar.tsx                    Client · glass · scroll-state · mobile burger · incluye link "Quiénes Somos" · modo oscuro sobre heroes marcados con [data-navbar="dark"] (ver Quirks)
  Footer.tsx                    Server · logo PNG · nav · contacto · CodeTlonBadge
  HeroVideo.tsx                 Client · <video> si site_settings.hero.video_url existe, si no cae a <Picture>
  ScrollReveal.tsx               Client · observer por <section>
  agenda/AgendaWeekView.tsx      Grilla semanal (tema claro), usada en /dashboard/agenda/calendario en >=md — eventos clickeables, abren AgendaEventModal.tsx. Eventos con fecha_hasta se repiten en cada día de su rango
  agenda/AgendaDayView.tsx      Lista cronológica de un día (no grilla — ilegible en angosto), usada en /dashboard/agenda/calendario en <md. Mismo AgendaEventModal al click
  agenda/AgendaMonthView.tsx     Grilla mensual (tema oscuro), usada solo en /agenda-tv — sin click, pensada para verse a distancia (kiosco TV). Eventos con fecha_hasta también se repiten por día
  agenda/AgendaKioskHeader.tsx   Topbar de ambas vistas — prop theme (dark/light), swapea el logo según tema. Responsive (flex-wrap) desde la ronda 2026-07-17
  agenda/AgendaEventModal.tsx    Modal de detalle de un evento (solo lectura) — usado por AgendaWeekView y AgendaDayView
  Picture.tsx                   <picture> AVIF+WebP pre-build (solo public/images/)
  ContactForm.tsx / ContactFormWrapper.tsx   useFormState + preselección de servicio por query param
  LazyGoogleMap.tsx             Click-to-load iframe
  LazyYoutubeEmbed.tsx          Click-to-load iframe de YouTube (mismo patrón que LazyGoogleMap) — el embed de YouTube pesa ~3.7MB de JS/CSS propios de entrada, confirmado con HAR real
  RegisterSW.tsx                Client · registra public/sw.js SOLO en producción
  OfflineBanner.tsx              Client · banner fijo cuando navigator.onLine === false
  dashboard/
    Field.tsx                   Inputs del panel + ImageUpload/VideoUpload/FileUpload(PDF)/Checkbox/CheckboxGroup — ImageUpload soporta focalName/focalDefaultValue (click en el preview = focal point, ver Quirks); Image/VideoUpload usan un contador de generación para no pisar el preview si se cambia de archivo antes de que termine el upload anterior
    ContentEditor.tsx           TipTap rico (bold/italic/H2/quote/listas/link/imagen/YouTube) — reusable, folder 'trabajos/content'. Se usa envuelto en ContentEditorBoundary.tsx (error boundary, ver Quirks), no directo
    SavedToast.tsx              Toast fijo, mensaje según acción (Creado/Guardado/Eliminado) — lee ?saved=created|updated|deleted de la URL (ver Quirks), montado una vez en (panel)/layout.tsx
    InlineSavedBanner.tsx       Banner verde de éxito para los forms de site_settings (contenido/*) — se autodestruye a los 3s (mismo criterio que SavedToast), a diferencia del banner ad-hoc que reemplaza (quedaba fijo para siempre)
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
  upload-limits.ts               MAX_IMAGE_BYTES/MAX_VIDEO_BYTES/MAX_DOC_BYTES — compartido entre Field.tsx (chequeo client-side) y settings.ts (server), antes duplicado
  client-image-resize.ts         resizeImageFile() — resize/compresión de imágenes en el navegador (Canvas nativo) antes de subir, ver Quirks (límite real de Vercel)
  client-upload.ts               uploadDirectToStorage() — sube video/PDF directo al bucket desde el navegador (bypass del Server Action), ver Quirks
  ordering.ts                   nextFreeOrder — evita colisión de display_order/work_rank (autoincrementa al primer valor libre, con scope opcional ej. cliente_id en trabajos)
  friendly-error.ts              friendlyError(error, fallback?) — traduce errores crudos de Supabase/Postgres (códigos `23505`/`23503`/etc., mensajes en inglés) a texto en castellano. Usado en TODO `catch`/`if (error)` de los server actions (`app/actions/*.ts`) y en los catch client-side de uploads (`Field.tsx`, `ContentEditor.tsx`, `client-upload.ts`) antes de meter el mensaje en `state.error` — nunca exponer `error.message` de Supabase directo a la UI. Si agregás un action nuevo con manejo de error, replicá este patrón en vez de `e.message` crudo
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
  008_galeria.sql                Tabla galeria (portafolio bento editable, spans por breakpoint)
  009_agenda.sql                 Tablas gruas/empresas_agenda/operarios/eventos_agenda/eventos_operarios
  010..018                       Incrementales: tipo de grúa, fecha/adjunto/focal point de trabajos, banner de montajes/trabajos, focal mobile, fecha_hasta de eventos
  019_trabajos_overlay.sql       banner_overlay_opacity/_mobile en trabajos
  020_servicios_excerpt.sql      excerpt en servicios (renumerada — colisionaba con 008_galeria, ver Historial 2026-07-20)

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
| `montajes` | slug (unique), title, excerpt, content, cover_image, **cover_image_focal**/**cover_image_focal_mobile** (nullable, `"X% Y%"`), **banner_image**/**banner_image_focal**/**banner_image_focal_mobile** (nullable), tags[], display_order, published | Blog de casos de éxito, `/montajes/[slug]`. `cover_image` = miniatura del listado; `banner_image` = foto grande del detalle (fallback a `cover_image` si no se cargó). Slug auto-generado desde `title` (`slugify`, sin scope — tabla plana), no es campo editable en el form |
| `clientes` | slug (unique), name, logo, **logo_focal**/**logo_focal_mobile** (nullable, `"X% Y%"`), bio, content, **tiene_blog** (bool, default false), featured, **work_rank** (int, mayor = más arriba), published | "Clientes Destacados", orden por `work_rank desc`. `content` = intro/historia del cliente (párrafos separados por línea en blanco), se muestra antes de sus `trabajos`. El logo NO se muestra en `/clientes/[slug]` (solo historia + trabajos) — aparece en el home y en cada detalle de trabajo. Slug auto-generado desde `name` (`slugify`, sin scope), no es campo editable en el form. `tiene_blog` (migración `026`) es el toggle explícito del admin — antes se inferia de `content` no vacío; con `tiene_blog=true` el logo es clickeable (grid de "Casos de éxito" en `/clientes`, `/clientes/[slug]` accesible); con `false` el cliente solo muestra el logo en un carrusel automático (`ClientesLogoMarquee.tsx`) y su `/clientes/[slug]` da 404 aunque tenga `content` cargado |
| `servicios` | slug (unique), title, **excerpt** (10-80 chars), desc, specs[], img, icon, display_order, published | Detalle en `/servicios`; `excerpt` (corta) alimenta la card de "Qué Hacemos" del home, `desc` (larga) el detalle — antes compartían el mismo texto truncado. Ya NO es catálogo fijo de 4 filas: CRUD completo (alta/edición/borrado) desde `/dashboard/servicios`, slug auto-generado igual que montajes/clientes |
| `trabajos` | `cliente_id` (FK → clientes, ON DELETE CASCADE), slug (UNIQUE junto a cliente_id), title, excerpt, content (HTML rico TipTap), cover_image, **cover_image_focal**/**cover_image_focal_mobile** (nullable, `"X% Y%"`), **banner_image**/**banner_image_focal**/**banner_image_focal_mobile** (nullable), **banner_overlay_opacity**/**banner_overlay_opacity_mobile** (int 0-100, default 100), youtube_url, **fecha** (DATE, nullable), **attachment_url** (PDF, nullable), display_order, published | Cada cliente se comporta como mini-blog: `/clientes/[slug]` lista sus trabajos paginados, cada uno con detalle propio en `/clientes/[slug]/[trabajo-slug]`. Slug auto-generado (`slugify` + sufijo `-2`/`-3` si colisiona), no es campo editable en el form. `cover_image` = miniatura del listado; `banner_image` = foto grande detrás del título (fallback a `cover_image`); `banner_overlay_opacity*` controla el degradé oscuro sobre el banner, mismo criterio que `hero.overlay_opacity` |
| `galeria` | imagen, alt, col_span_mobile/row_span_mobile (1-2), col_span_desktop/row_span_desktop (1-4/1-2), display_order, published | Portafolio bento de `/galeria` (reemplaza el array hardcodeado original) — cada imagen controla cuántas columnas/filas ocupa, por separado en mobile (grid 2 cols) y desktop (grid 4 cols). Se edita con `SpanPicker.tsx` (grilla clickeable) en vez de `<select>` de texto |
| Storage `media` | — | Bucket único: fotos de montajes/clientes/servicios/trabajos/galeria (sharp resize+WebP) + imágenes embebidas en el contenido rico de trabajos + video del hero (sin transformar) |

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
COMPANY_EMAIL                  (opt, default "cotizacionesinglobalsrl@gmail.com")
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

**Pipeline runtime paralelo (`lib/video-transcode.ts`)**: además de este script de build, `uploadMediaAction` (`app/actions/settings.ts`) intenta re-encodear con el mismo criterio (H.264 CRF 20, sin audio, tope 1920px) cualquier video que se suba desde el dashboard (hero o contenido rico de trabajos), para no depender de que alguien corra el script a mano. Mismo guard que el script: si `ffmpeg` no está en el runtime (Vercel, hoy), sube el archivo tal cual sin romper nada — **queda inerte hasta que el deploy pase a Coolify** (contenedor Docker persistente, planeado pero todavía no activo a 2026-07-13). El límite de subida de video es 20MB (antes 50MB) porque el server re-comprime.

---

## Animaciones

`components/ScrollReveal.tsx` — observer por `<section>` entera (no por elemento), todos los `[data-animate]` adentro reciben `data-visible` al mismo tiempo. `data-delay` solo para secuencias cortas (header de página: 0/100/200ms). No usar arrays de delays largos en grids. Reduced motion: todo cae a `opacity:1; transform:none; transition:none`.

Hero: `hero-anim hero-anim-d1..d5` (CSS directo, no ScrollReveal) + `hero-bg-zoom` (10s slow zoom) cuando NO hay video. Con video activo (`HeroVideo.tsx`), el `<video autoPlay muted loop playsInline>` reemplaza la imagen con zoom; pausa/no autoplay bajo `prefers-reduced-motion`.

---

## Quirks y Advertencias

- **Límite real de subida no es `bodySizeLimit`, es Vercel**: `next.config.mjs` tiene `experimental.serverActions.bodySizeLimit: '20mb'`, pero eso sólo afecta el parseo interno de Next — Vercel cappea el body de CUALQUIER función serverless (incluidos Server Actions) a **4.5MB de forma dura**, sin ninguna forma de overridearlo desde la app. Por eso las imágenes se resizean en el navegador ANTES de llegar a `uploadMediaAction` (`lib/client-image-resize.ts`, Canvas nativo) y el video/PDF suben directo del navegador al bucket `media` (`lib/client-upload.ts` + `createSupabaseBrowserClient` en `lib/supabase.ts`, usa la sesión de Supabase Auth ya autenticada vía `@supabase/ssr` — el bucket ya permite INSERT/DELETE a cualquier `authenticated`), bypaseando el Server Action para el binario grande. Si agregás un upload nuevo que pueda superar ~4MB, replicá uno de estos dos patrones — NO subas el archivo crudo por un Server Action asumiendo que el `bodySizeLimit` alcanza.
- **Contrato de nombres `site_settings` ↔ `lib/constants.ts` ↔ forms**: si agregás un campo nuevo a una key, actualizalo en los 3 lugares (migración/seed, fallback, form del dashboard) o el público queda desincronizado sin error visible. Ya pasó una vez esta sesión — ver `.claude/ERRORES.md`.
- **`playwright.config.ts` usa el puerto 3310**, no 3000 — esta máquina corre otros proyectos Next en paralelo y Playwright no detecta el puerto equivocado (ver Bug 37 de la fábrica).
- **Alta de usuarios y contraseña temporal**: Mateo sigue creando las cuentas a mano desde `/dashboard/usuarios` (no hay flujo de invitación/signup). `createAdminUser` y `resetAdminPassword` (`app/actions/users.ts`) setean `user_metadata.must_change_password: true` — `middleware.ts` lo chequea en CUALQUIER ruta de `/dashboard/**` (excepto `/dashboard/login` y la propia `/dashboard/cambiar-password`, para no generar loop) y redirige forzoso hasta que el usuario cambie la clave. `changePassword` (`app/actions/auth.ts`) limpia el flag. La misma pantalla sirve para cambio voluntario en cualquier momento (link "Cambiar mi contraseña" en `/dashboard/usuarios`, ya no en el topbar) — no depende del flag, siempre disponible. No hay roles: cualquier cuenta con acceso al panel tiene el mismo nivel de permisos.
- **Focal point de imágenes**: acotado a 5 campos (`montajes.cover_image_focal`/`banner_image_focal`, `trabajos.cover_image_focal`/`banner_image_focal`, `clientes.logo_focal`) — no es un mecanismo genérico para toda imagen del sitio. Se guarda como string `"X% Y%"` (ej. `"30% 60%"`), `null` = centro. `ImageUpload` (`Field.tsx`) solo lo activa si se le pasa `focalName` — sin ese prop, el componente se comporta exactamente igual que antes (no rompe los `ImageUpload` existentes que no lo usan). Si agregás foco a un campo nuevo, hace falta: migración `ALTER TABLE ... ADD COLUMN x_focal TEXT`, sumarlo al schema Zod correspondiente (`.nullable().optional()`), al `parse()` del server action, pasar `focalName`/`focalDefaultValue` en el form, y aplicar `style={{objectPosition: campo_focal ?? undefined}}` en el render público (o `className="focal-responsive"` + CSS vars `--focal-desktop`/`--focal-mobile` si también tiene foco mobile, ver abajo).
- **Focal point mobile (`_focal_mobile`)**: los mismos 5 campos tienen un segundo foco opcional para mobile (`cover_image_focal_mobile`, `banner_image_focal_mobile`, `logo_focal_mobile`) — `null`/vacío = usa el mismo foco que desktop. `ImageUpload` muestra un toggle Desktop/Mobile sólo si se le pasa `focalMobileName` (además de `focalName`); si no se pasa, se comporta igual que el foco simple de siempre. El render público NO puede alternar `object-position` por breakpoint con una sola prop de React inline — usa la clase `.focal-responsive` (`app/globals.css`) + las custom properties `--focal-desktop`/`--focal-mobile` seteadas vía `style`, con un `@media (max-width: 767px)` que pisa la variable. Hoy sólo se usa en los banners de `/montajes/[slug]` y `/clientes/[slug]/[trabajo]` (los únicos renders públicos con `object-cover`+foco — el logo de cliente usa `object-contain`, el foco ahí sigue siendo inerte, no es un bug nuevo).
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
- **`prefetch={false}` en los `Link` de navegación del dashboard** (sidebar + listados de clientes/montajes/servicios/trabajos): `middleware.ts` corre `supabase.auth.getUser()` en cualquier ruta de `/dashboard/**`, así que el prefetch automático de Next dispara una llamada de auth extra por cada link que entra en viewport, no solo al click. Si agregás un `Link` nuevo dentro del panel, sumale `prefetch={false}` también.
- **Feedback de guardado en el panel — `SavedToast.tsx` / `InlineSavedBanner.tsx`**: los CRUD con `redirect()` en éxito (montajes/clientes/servicios/trabajos/galería/eventos de agenda, ver Fase 2/7) agregan `?saved=created|updated|deleted` (según la acción) a la URL de destino; `SavedToast` (montado una vez en `(panel)/layout.tsx` dentro de un `Suspense`, usa `useSearchParams`) lo detecta, muestra el texto correspondiente (`MESSAGES` dentro del propio componente) 3s y limpia el query param con `router.replace`. Si agregás un CRUD nuevo con redirect en éxito, sumale `?saved=created`/`updated`/`deleted` según corresponda para que también dispare el toast con el texto correcto. Las páginas de `site_settings` (`contenido/*`) no redirigen (son forms de singleton) — usan `InlineSavedBanner` en vez de este mecanismo, con su propio timeout de 3s.

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
npx playwright test tests/e2e/inglobal.spec.ts -g "nombre del test"   # un solo test (único archivo de specs hoy)
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
| 2026-07-13 | **Ronda 2 post-QA, Fase 12/12 — Pipeline de video (parcial: deploy sigue en Vercel, Coolify todavía no activo)**: nuevo `lib/video-transcode.ts` — re-encodea video server-side (H.264 CRF 20 sin audio, tope 1920px, +faststart, mismo criterio que `scripts/optimize-video.mjs`) dentro de `uploadMediaAction` (`app/actions/settings.ts`). Detecta si el runtime tiene `ffmpeg` instalado; si no (caso actual en Vercel), sube el archivo original sin tocar — **queda inerte hasta que el deploy pase a Coolify**, no rompe nada mientras tanto. Límite de subida de video baja de 50MB a 20MB (el server re-comprime). Hero: `HeroForm.tsx` suma el campo que faltaba para `video_url_mobile` (el público ya lo soportaba desde antes, sin form para cargarlo — gap real, no hipotético), focal point de video (`video_focal`, mismo mecanismo que `ImageUpload` portado a `VideoUpload` vía `focalName`) y `overlay_opacity` (0-100, default 100 = look actual sin cambios, `NumberField` nativo sin librería de slider) aplicado como opacidad del degradé del hero en `app/page.tsx`. Video propio (no YouTube) en el contenido rico de trabajos: nuevo `components/dashboard/tiptap-video-extension.ts` (nodo TipTap corto para `<video>`, no hay extensión oficial pero es HTML5 estándar) + botón "Video propio" en `ContentEditor.tsx` (mismo límite 20MB + transcode que el resto), contenido con CSS en `.prose-igb video`/`.tiptap-editor video` (mismo criterio que el fix de YouTube de la Fase 9). Build + tsc + lint OK. |
| 2026-07-13 | **Ronda de fixes post-uso real** (rama `fix/ux-varios-post-uso`, mergeada a `dev`, `main` sin tocar): etiqueta de cliente en `/clientes/[slug]/[trabajo]` pasa de pill navy a texto en cursiva sin fondo (`font-body italic`); nuevo bloque de cierre al final de cada trabajo con el logo del cliente + su `bio` (si tiene). Home "Qué Hacemos": foto más grande (`aspect-4/3`) y `servicio.desc` como subtítulo debajo del título. Estado de eventos en `/dashboard/agenda` (listado) ahora se muestra capitalizado (`formatEstado` en `lib/agenda-view.ts`). `AgendaWeekView`/`/dashboard/agenda/calendario` rediseñados a tema claro (`estadoColorClassesLight`, nuevo) con click en cada evento → `AgendaEventModal.tsx` nuevo; `AgendaKioskHeader` gana prop `theme` (dark/light); `/agenda-tv` sin cambios (sigue oscura por diseño, ver Fase 11/12). Textareas del dashboard: `resize-y` → `resize-none`. Fix de causa raíz en `Field.tsx` (`ImageUpload`/`VideoUpload`): el hidden input que viaja al form usaba el mismo estado que el preview optimista, así que guardar a mitad de una subida persistía un `blob:` local (inválido al recargar) — causante de "se clava" al subir fotos/videos y de previews rotos en cargas ya guardadas; ahora el hidden input usa un `committedUrl` separado que nunca es un blob. Las 10 páginas de `contenido/*` ganan link "Volver al panel" (antes ninguna lo tenía, no solo accesos-rápidos). Nuevo `InlineSavedBanner.tsx` reemplaza el banner verde duplicado de esos 10 forms — antes quedaba fijo para siempre tras guardar, ahora se autodestruye a los 3s (ver Quirks). `SavedToast` distingue mensaje por acción (`?saved=created/updated/deleted` en vez de `?saved=1`) en los 6 archivos de `app/actions/*` que redirigen (montajes/clientes/servicios/trabajos/galería/agenda). Build + tsc + lint OK. |
| 2026-07-17/20 | **Ronda de fixes post-uso real, parte 3** (merge `bf64a68` + commits directos a `dev` hasta `22ca41c`, sin docs commit propio — entrada agregada retroactivamente, faltaba en este archivo): stats del home invisibles (`data-animate` en el `<section>` raíz nunca recibía `data-visible`); nueva 404 personalizada (`app/not-found.tsx`); overlay del banner de trabajos editable desktop/mobile (`banner_overlay_opacity`/`_mobile`, migración `019_trabajos_overlay.sql`, mismo criterio que `hero.overlay_opacity`); `ContentEditor` (editor de contenido rico) nunca había recibido el fix de resize/upload directo que ya tenía `Field.tsx` — uploads rotos ahí; conflictos de Agenda fallaban abiertos por errores de query silenciados; el toast de guardado no se cerraba solo; `AgendaWeekView` con eventos superpuestos/adyacentes ilegible; scroll horizontal no deseado en mobile en montajes/trabajos. `InlineSavedBanner` hace scroll-to-top automático al aparecer (si el usuario llegó scrolleado hasta "Guardar", el aviso quedaba fuera de vista); borrado en catálogos de Agenda gana confirmación de éxito (antes silencioso). **Servicios deja de ser catálogo fijo de 4 filas**: `createServicio` (slug auto igual que montajes/clientes) + `ServicioForm` reusable create/edit + página `/dashboard/servicios/nuevo`. **`servicios.excerpt`** nuevo (10-80 caracteres, migración renumerada `008→020_servicios_excerpt.sql` por colisión con `008_galeria.sql`) — separa la descripción corta de la card de "Qué Hacemos" (antes reusaba `desc` truncado) de la detallada de `/servicios`. Perf: `prefetch={false}` en los `Link` del sidebar y listados del panel — el middleware corre `supabase.auth.getUser()` en cada ruta de `/dashboard/**`, así que el prefetch automático de Next disparaba una llamada de auth extra de más por link en viewport. |
| 2026-07-21 | **Ronda de fixes post-uso real, parte 4** (rama `fix/reporte-bugs-post-uso-real-parte4`, mergeada a `dev`, `main` sin tocar): reporte de bugs del cliente con 20 items. Clientes: paginación dejaba items invisibles al cambiar de página (`data-animate` dependía de `ScrollReveal`, que no re-corre en paginación client-side) — quitado, mismo criterio que ya usaba `ClienteTrabajos.tsx`. Servicios: `updateServicio` fallaba el 100% de las ediciones (`slug`/`excerpt` ausentes del parse — el segundo introducido por la feature de excerpt de otra sesión); agregado `deleteServicio` + `DeleteButton` (no existía); título limitado a 60 caracteres + `line-clamp`; bloqueo de título duplicado. Hero: titular largo ya no se corta invisible (`maxLength=100` + `line-clamp-3`, cubre contenido ya guardado). Montajes: imagen de portada obligatoria (antes opcional, inconsistente con Servicios); expuesto `display_order` en el form (ya existía en DB pero se reseteaba solo en cada guardado al no mandarse). Agenda: duplicados bloqueados en grúas (nombre/patente) y empresas (nombre); teléfono valida formato numérico (`empresaAgendaSchema`/`operarioSchema`); nuevo `TRANSICIONES_VALIDAS` en `lib/validations/agenda.ts` bloquea volver de `en_curso`/`finalizado` a `programado`; evento `finalizado`/`cancelado` no editable, `en_curso` solo permite cambiar el estado (comparación normaliza `HH:MM:SS` de Postgres vs `HH:MM` del input); nuevo `getRecursosOcupados()` marca grúas/operarios ocupados como `disabled` en el form de eventos (`SelectField`/`CheckboxGroup` ganan soporte de opciones deshabilitadas); `catalogToggle` bloquea inactivar un recurso en uso en evento `en_curso` y avisa (no bloquea) si es solo `programado` (`AgendaState` gana campo `warning`). Quiénes Somos: `subheading` y `features` (antes hardcodeados en el JSX) pasan a editables vía `site_settings.quienes_somos` + `FALLBACK_SITE_SETTINGS`. Stats: máximo 5 (`StatsList` en `Field.tsx`), solo se guardan pares número+etiqueta completos, etiquetas duplicadas no se guardan dos veces. Build + tsc + lint + 24/24 Playwright OK. |
| 2026-07-22 | **Mensajes de error humanizados + validación de operarios en Agenda + fixes chicos de home/hero** (rama `fix/mensajes-error-humanizados-trabajos-operarios`, en curso): nuevo `lib/friendly-error.ts` (`friendlyError()`) — traduce códigos Postgres (`23505`/`23503`/etc.) y mensajes de Supabase en inglés a castellano; reemplaza TODO `error.message`/`e.message` crudo en los 9 archivos de `app/actions/*.ts` y en los catches de upload client-side (`Field.tsx`, `ContentEditor.tsx`, `lib/client-upload.ts`). Se completaron mensajes Zod que no tenían segundo argumento (quedaban en inglés por default de la librería) en `lib/validations/{cliente,galeria,montaje,servicio,trabajo}.ts` (`work_rank`, spans de galería, `display_order`, slug de servicios, overlays de trabajos). **Agenda**: nueva `validarOperarios()` en `app/actions/agenda.ts` — un evento ya no se puede crear/editar sin al menos un operario asignado, ni con un operario que esté `activo: false` (antes solo se filtraba en la UI de creación, pero un ID inactivo ya asignado podía re-guardarse sin aviso); mismo chequeo client-side en `EventoForm.tsx` (`handleSubmit`) para feedback inmediato. Fixes chicos: overlay del hero en mobile más oscuro (`from-igb-surface/95 via-60 to-15` en vez de `/85→35→transparent`, quedaba muy claro); descripción corta de servicios en el home ("Qué Hacemos") pierde el `line-clamp-2` que la cortaba a mitad de palabra (el excerpt ya viene acotado a 80 caracteres por schema, el clamp era redundante y rompía visualmente en cards angostas, ej. "Grúas Telescópicas"); videos del hero (desktop+mobile) reemplazados por los archivos finales del cliente vía `npm run optimize:video` (mismos nombres de archivo en `public/videos/opt/`, sin tocar `site_settings.hero` en la DB). Build + tsc + lint OK. |
| 2026-07-17 | **Ronda de fixes post-uso real, parte 2** (rama `fix/correctness-baja`, en curso, `dev`/`main` sin tocar): 9 fases sobre una tanda grande de bugs/pedidos reales. **Uploads (causa raíz real: Vercel cappea el body de cualquier función serverless a 4.5MB — `bodySizeLimit` de `next.config.mjs` no lo puede overridear, era la causa de "unexpected response" en fotos >4.5MB y videos colgados)**: `lib/client-image-resize.ts` nuevo (Canvas nativo) resizea imágenes en el navegador antes de subir; `lib/client-upload.ts` + `createSupabaseBrowserClient` (`lib/supabase.ts`, `@supabase/ssr`) suben video/PDF directo al bucket desde el navegador (bypass total del Server Action, usa la sesión ya autenticada — RLS ya permitía `authenticated` write); `lib/upload-limits.ts` centraliza los límites (antes duplicados). `public/sw.js` no cacheaba bien respuestas 206 (Partial Content de `<video>` con Range requests) — error de consola real, fix de una línea. **Performance**: un HAR real mostró que YouTube es el 66% del peso de página, no las imágenes — `LazyYoutubeEmbed.tsx` nuevo (mismo patrón que `LazyGoogleMap.tsx`) + `loading="lazy"` en el YouTube embebido en contenido rico. **Bug de datos real**: `StringList` (`Field.tsx`) serializa como JSON pero `parseTags`/`parseSpecs` (`app/actions/{montajes,servicios}.ts`) esperaban CSV/saltos de línea — tags y specs se guardaban corrompidos, no "sin guardar". **Estilos públicos**: listas visibles en el editor (`.tiptap-editor` sin `ul`/`ol`), stats del hero a banner propio debajo (`app/page.tsx`), banners de montajes/trabajos pasan de altura fija en `vh` a `aspect-ratio` responsivo (menos recorte en fotos horizontales), `Navbar.tsx` gana `data-navbar="hidden"` (opacidad 0 hasta hacer scroll, usado en trabajos con banner). **Placeholders de ejemplo** en ~32 campos de texto/número de los formularios del dashboard (pedido explícito, `placeholder` ya existía como prop en `TextField`/`TextArea`, sumado a `NumberField`). **Focal point mobile** (migración `017_focal_mobile.sql`): `cover_image_focal_mobile`/`banner_image_focal_mobile` (montajes/trabajos) y `logo_focal_mobile` (clientes) — `ImageUpload` gana toggle Desktop/Mobile, render público usa CSS custom properties (`--focal-desktop`/`--focal-mobile`, clase `.focal-responsive`) porque `object-position` no se puede condicionar por breakpoint con una sola prop de React. **Agenda — validación de solapamiento + rango de días** (migración `018_eventos_fecha_hasta.sql`): antes no había ninguna validación cruzada, se podía asignar la misma grúa/operario a dos eventos que se pisan; `buscarConflicto()` nuevo en `app/actions/agenda.ts` compara rangos fecha+hora en memoria (dataset chico) antes de insertar/actualizar. `eventos_agenda.fecha_hasta` (nullable) permite reservar varios días seguidos; `AgendaWeekView`/`AgendaMonthView` repiten el evento en cada día del rango (antes solo en el día de inicio); `getEventosAgenda` matchea por solapamiento de rango, no solo fecha de inicio. **Agenda — feedback de guardado**: `CatalogSection.tsx` (catálogos de grúas/empresas/operarios) tenía toggle/borrado fire-and-forget sin pending/error y CERO confirmación de éxito — fix con pending state + `InlineSavedBanner`. **Agenda — calendario mobile**: `AgendaDayView.tsx` nuevo (lista cronológica, no grilla) reemplaza la grilla semanal en `<md` (antes puro scroll horizontal ilegible); `calendario/page.tsx` renderiza ambas vistas server-side, elegidas por breakpoint CSS puro. Build + tsc + lint + 24/24 Playwright OK. **Pendiente**: correr `node scripts/db-sync-dev.mjs --yes` para aplicar migraciones 017/018 a Supabase dev. |
| 2026-08-17 | **Favicon + clientes con/sin blog + UX carrusel home + auto-centrado responsive** (rama `fix/clientes-blog-carrusel-stats`, `dev`/`main` sin tocar todavía): favicon nuevo del cliente (`public/favicon.ico`). **`clientes.tiene_blog`** (migración `026_clientes_tiene_blog.sql`, backfill desde `content` no vacío) reemplaza el criterio implícito `!!content.trim()` que hacía doble uso del campo — ahora es un toggle explícito del admin (`ClienteForm.tsx`) desacoplado del texto de "historia". `/clientes/[slug]` da 404 si `tiene_blog=false` (antes accesible a mano aunque no hubiera link), `generateStaticParams` filtra por el mismo criterio. `/clientes` se separa en dos secciones: `ClientesGrid.tsx` (clickeable, solo clientes con blog) y nuevo `components/ClientesLogoMarquee.tsx` (solo-logo, sin blog, carrusel 100% CSS — `@keyframes clientes-marquee` en `globals.css`, track duplicado x2, pausa en hover/focus, respeta `prefers-reduced-motion`). Home (`ClientesCarousel.tsx`, se mantiene mezclado a pedido — no se separó como en `/clientes`): autoplay (`setInterval` 3.5s, pausa en pointer/touch, respeta reduced-motion), ancho de tarjeta exacto por breakpoint (`calc()`, mismo patrón que `ClientesGrid`, ya no asoma un pico fraccionario del próximo cliente), flechas movidas a un gutter propio (`md:px-10` + `md:left-0/right-0`) para no superponer ningún logo. Hero: CTA secundario "Ver Servicios" gana `bg-white/90` fijo en mobile (antes `bg-white/50 backdrop-blur-sm`, se lavaba contra el video en algunos frames). Stats del home y grid de "Qué Hacemos" pasan de `grid-cols-N` fijo a `flex flex-wrap justify-center` (mismo patrón ya usado en `ClientesGrid`) — el ítem sobrante de la última fila se auto-centra en vez de quedar pegado a la izquierda con un hueco al lado, sin importar cuántos ítems cargue el admin. Build + tsc + lint OK, migración 026 aplicada a Supabase dev. |

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
| PWA instalable / acceso mobile del personal de campo | `app/manifest.ts` + `public/sw.js` + `scripts/generate-pwa-icons.mjs`, todo en este repo. La pausa de `inglobal-app` (Expo) anotada el 2026-07-06 (entrada de esa fecha, más abajo) quedó desactualizada: confirmado el 2026-08-15 que sigue el plan de subirla a App Store/Play Store — ver `inglobal-agenda-app/docs/deployment.md` |

Regla: leer SOLO el módulo que la tarea pide (disciplina de tokens), no todos por las dudas.
