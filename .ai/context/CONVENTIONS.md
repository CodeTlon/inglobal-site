# CONVENTIONS — Grúas InGlobal

Convenciones ya establecidas en el código (no inventadas). Antes de escribir un patrón nuevo para algo que ya tiene un patrón acá, replicá el existente.

## Uploads grandes: nunca crudos por un Server Action

**Causa raíz**: Vercel cappea el body de CUALQUIER función serverless (incluidos Server Actions) a **4.5MB de forma dura** — el `experimental.serverActions.bodySizeLimit: '20mb'` de `next.config.mjs` solo afecta el parseo interno de Next, no el límite real de la plataforma, y no hay forma de overridearlo desde la app.

- Imágenes: se resizean en el navegador ANTES de subir (`lib/client-image-resize.ts`, Canvas nativo) y recién ahí van a `uploadMediaAction`.
- Video/PDF: suben directo del navegador al bucket `media` (`lib/client-upload.ts` + `createSupabaseBrowserClient` de `lib/supabase.ts`, usando la sesión ya autenticada vía `@supabase/ssr` — el bucket permite INSERT/DELETE a cualquier `authenticated`), bypaseando el Server Action.

Si agregás un upload nuevo que pueda superar ~4MB, replicá uno de estos dos patrones. `lib/upload-limits.ts` centraliza los límites (`MAX_IMAGE_BYTES`/`MAX_VIDEO_BYTES`/`MAX_DOC_BYTES`), compartido entre `Field.tsx` (chequeo client-side) y el server.

## Errores humanizados — `lib/friendly-error.ts`

`friendlyError(error, fallback?)` traduce códigos Postgres (`23505`/`23503`/etc.) y mensajes de Supabase en inglés a castellano. Usado en TODO `catch`/`if (error)` de los Server Actions (`app/actions/*.ts`) y en los catches client-side de uploads (`Field.tsx`, `ContentEditor.tsx`, `lib/client-upload.ts`) antes de meter el mensaje en `state.error`. **Nunca** exponer `error.message` de Supabase crudo a la UI. Si agregás un action nuevo con manejo de error, replicá este patrón.

## Feedback de guardado en el panel

- CRUD con `redirect()` en éxito (montajes/clientes/servicios/trabajos/galería/eventos de agenda): agregan `?saved=created|updated|deleted` a la URL de destino. `SavedToast` (montado una vez en `(panel)/layout.tsx` dentro de un `Suspense`) lo detecta, muestra el texto según la acción 3s, y limpia el query param con `router.replace`.
- Forms de `site_settings` (`contenido/*`, singleton, sin redirect): usan `InlineSavedBanner` en vez de `SavedToast`, con su propio timeout de 3s y scroll-to-top automático al aparecer.
- Si agregás un CRUD nuevo con redirect en éxito, sumale el query param correspondiente para que también dispare el toast con el texto correcto.

## `prefetch={false}` en links del panel

`middleware.ts` corre `supabase.auth.getUser()` en CUALQUIER ruta de `/dashboard/**` — el prefetch automático de Next dispara una llamada de auth extra por cada `Link` que entra en viewport, no solo al click. Todo `Link` nuevo dentro del panel (sidebar, listados) necesita `prefetch={false}`.

## Contrato de nombres `site_settings` ↔ `constants.ts` ↔ forms

Si agregás un campo nuevo a una `key` de `site_settings`, actualizalo en los 3 lugares: migración/seed, `FALLBACK_SITE_SETTINGS` (`lib/constants.ts`), y el form del dashboard. Si no, el público queda desincronizado sin error visible (ver entrada 2026-07-12 de `.claude/ERRORES.md`).

## CSP solo en producción

La CSP endurecida de `next.config.mjs` solo corre con `NODE_ENV === 'production'` (rompería HMR en dev). No asumir que un bloqueo de CSP (por ejemplo, un script externo nuevo) se manifiesta en `npm run dev` — probar contra un build de producción.

## Focal point — patrón para agregar a un campo nuevo

Ver `.ai/context/DOMAIN.md` para qué campos ya lo tienen. Para sumarlo a uno nuevo: migración `ALTER TABLE ... ADD COLUMN x_focal TEXT`, schema Zod (`.nullable().optional()`), parse del server action, prop `focalName`/`focalDefaultValue` en el form (`ImageUpload`, `Field.tsx`), y `style={{objectPosition: campo ?? undefined}}` en el render público (o `.focal-responsive` + CSS vars `--focal-desktop`/`--focal-mobile` si también tiene foco mobile — `object-position` no se puede condicionar por breakpoint con una sola prop de React).

## `ContentEditorBoundary.tsx` — no saltear

`TrabajoForm` importa el editor de texto rico a través de este wrapper (error boundary de clase), no directo desde `ContentEditor.tsx`. Si TipTap explota parseando contenido legacy en edición, cae a un `<textarea>` plano con el HTML crudo en vez de tirar abajo todo el form.

## Roles — `app_metadata`, no `user_metadata`

El rol (`admin`/`trabajador`) vive en `user.app_metadata.role`, nunca en `user_metadata` — ese último lo puede reescribir el propio usuario logueado desde el cliente. Cualquier chequeo de permisos server-side tiene que leer `app_metadata`.

## Auto-generación de slugs

`montajes`, `clientes` y `trabajos` generan su slug con `slugify()` a partir del título/nombre — no es un campo editable en el form. `trabajos` scopea la unicidad por `cliente_id` (sufijo `-2`/`-3` si colisiona); `montajes`/`clientes` son tablas planas sin scope.

## `getTrabajoById` no filtra `published` (deliberado)

A diferencia de `getMontaje`/`getCliente` (que sí filtran), `getTrabajoById` (`lib/content.ts`) devuelve el trabajo exista o no publicado — es de uso exclusivo del dashboard de edición, que necesita encontrarlo por `id` sin importar su estado. No replicar ese filtro ahí ni asumir que el resto de los getters lo omiten.

## `lucide-react` en versión `1.8.0`

No la típica `0.x` de otros proyectos de la fábrica, y **no exporta `Youtube`** — usar el ícono `Video` para acciones relacionadas a YouTube.

## Tests

Único archivo E2E: `tests/e2e/inglobal.spec.ts` (24 tests, sin `test.describe`, corre en el puerto dedicado **3310** — no 3000, para no chocar con otros proyectos Next corriendo en la misma máquina). Único unit test: `services/video-transcode/token.test.mjs`.
