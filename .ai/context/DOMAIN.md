# DOMAIN — Grúas InGlobal

Entidades y reglas de negocio no triviales. Para el "por qué" de decisiones arquitectónicas que tocan estas entidades, ver `.ai/context/DECISIONS.md`.

## Tablas y su propósito

| Tabla | Campos clave | Regla de negocio |
|---|---|---|
| `contact_leads` | name, empresa, email, phone, servicio, message | Insert desde el form público (`app/actions/contact.ts`), sin RLS de lectura pública. Rate-limited por IP (agregado en una ronda de seguridad posterior). |
| `site_settings` | `key` (PK text), `value` (jsonb) | Un row por sección singleton del sitio (`hero`, `quienes_somos`, `que_hacemos`, `stats`, `cta_banner`, `clientes_destacados`, `ubicacion`, `footer`, `contacto`, `dashboard_quicklinks`). **Contrato crítico**: los campos dentro de `value` deben coincidir EXACTO entre la migración/seed, `lib/constants.ts` (`FALLBACK_SITE_SETTINGS`) y el form del dashboard — si agregás un campo nuevo y no lo replicás en los 3 lugares, el público queda desincronizado sin error visible (ver `.claude/ERRORES.md`). `dashboard_quicklinks.items` es `string[]` de hrefs (no `{href,label}[]`) — el label se resuelve por lookup contra `QUICKLINK_CANDIDATES`. |
| `montajes` | slug (unique), title, excerpt, content, cover_image, banner_image, tags[], display_order, published, focal points (cover/banner × desktop/mobile) | Blog de casos de éxito. `cover_image` = miniatura del listado, `banner_image` = foto grande del detalle (fallback a `cover_image`). Slug auto-generado desde `title` (`slugify`, tabla plana, no editable en el form). |
| `clientes` | slug (unique), name, logo, bio, content, **tiene_blog** (bool), featured, work_rank, published, focal points (logo × desktop/mobile) | "Clientes Destacados", orden por `work_rank desc`. `tiene_blog` (migración `026`) es un **toggle explícito del admin**, no inferido de `content` — con `true` el cliente tiene grid clickeable + `/clientes/[slug]` accesible; con `false`, solo aparece en un carrusel automático de solo-logo y su `/clientes/[slug]` da 404 aunque tenga `content` cargado. |
| `servicios` | slug (unique), title, excerpt (10-80 chars), desc, specs[], img, icon, display_order, published | CRUD completo (no es catálogo fijo). `excerpt` alimenta la card corta de "Qué Hacemos" del home; `desc` el detalle largo de `/servicios`. |
| `trabajos` | `cliente_id` (FK → clientes, CASCADE), slug (UNIQUE junto a cliente_id), title, excerpt, content (HTML rico), cover_image, banner_image, banner_overlay_opacity(_mobile), youtube_url, fecha, attachment_url (PDF), display_order, published, focal points | Cada cliente con `tiene_blog=true` se comporta como mini-blog: `/clientes/[slug]` lista sus trabajos paginados, cada uno con detalle propio. |
| `galeria` | imagen, alt, col_span_mobile/row_span_mobile (1-2), col_span_desktop/row_span_desktop (1-4/1-2), display_order, published | Portafolio bento editable — cada imagen controla cuántas columnas/filas ocupa, por separado en mobile (grid 2 cols) y desktop (grid 4 cols). |
| `gruas`, `empresas_agenda`, `operarios` | nombre/patente/tipo (grúas); nombre/contacto/teléfono (empresas); nombre/teléfono/activo (operarios) | Catálogos de la agenda. Borrado/inactivación bloqueada si el recurso tiene eventos "vivos" (`reserva`/`programado`/`en_curso`); histórico no bloquea. Duplicados bloqueados (nombre/patente de grúas, nombre de empresas). |
| `eventos_agenda` | fecha, fecha_hasta (nullable, rango multi-día), hora_inicio/fin, grua_id (nullable, SET NULL al borrar grúa), empresa_id (nullable, SET NULL), estado | 5 estados, ver más abajo. Constraint `EXCLUDE` a nivel de DB impide solapamiento de grúa (extensión `btree_gist`). |
| `eventos_operarios` | evento_id, operario_id (CASCADE al borrar operario) | Tabla puente N:M. Un `pg_advisory_xact_lock` en trigger evita solapamiento de operario entre eventos concurrentes. |
| `tv_pairing_codes` | código, dispositivo, estado | Pairing QR para el kiosco `/agenda-tv`. RLS con cero policies — todo el acceso vía Route Handlers con `service_role`. |
| Storage `media` | — | Bucket único: fotos de montajes/clientes/servicios/trabajos/galería + imágenes embebidas en contenido rico + video del hero. |

## Estados de un evento de agenda

`reserva → programado → en_curso → finalizado`, o `cancelado` desde `reserva`/`programado`/`en_curso` — **sin retroceso** (`TRANSICIONES_VALIDAS`, `lib/validations/agenda.ts`). `reserva` es un estado tentativo: si nadie lo confirma a `programado`, se auto-cancela (ver auto-transición en `.ai/context/ARCHITECTURE.md`). Un evento `finalizado`/`cancelado` no es editable; uno `en_curso` solo permite cambiar el estado.

## Focal point de imágenes (mecanismo acotado, no genérico)

Solo 5 campos: `montajes.cover_image_focal`/`banner_image_focal`, `trabajos.cover_image_focal`/`banner_image_focal`, `clientes.logo_focal` — cada uno con su variante `_mobile` opcional. Se guarda como string `"X% Y%"` (`null` = centro). `ImageUpload` (`Field.tsx`) solo activa el mecanismo si se le pasa `focalName`. Agregar foco a un campo nuevo requiere replicar el patrón en 4-5 lugares (migración, schema Zod, parse del server action, prop en el form, `object-position`/`.focal-responsive` en el render público) — no hay un mecanismo genérico para "cualquier imagen".

## `updateSiteSettings` — contrato de forma

Arma el `value` jsonb desde TODOS los campos del form recibido — no espera un campo `value` explícito en el FormData. Si el nombre de un campo del form no coincide exacto con lo que lee `lib/content.ts`/`lib/constants.ts`, el dato se guarda pero el público sigue mostrando el fallback viejo, sin ningún error visible.
