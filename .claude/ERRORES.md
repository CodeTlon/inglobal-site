# Errores y fixes — Grúas InGlobal

Bitácora local de bugs con causa raíz no obvia (no typos) encontrados en desarrollo/mantenimiento.
Se completa a medida que aparecen. Ver protocolo de sincronización con la fábrica en `maintenance.md`.

## 2026-07-04 site_settings con claves distintas entre seed/fallback y frontend

**Síntoma**
El dashboard (`/dashboard/contenido/*`) parecía funcionar (los forms cargaban y guardaban sin error), pero
el contenido público (home, quienes-somos, footer, contacto) no reflejaba lo que el seed SQL / fallback
definían — coincidía por casualidad porque `app/page.tsx` tenía sus propios strings hardcodeados como
default (`heroSettings.headline as string) || 'texto hardcodeado idéntico al real'`). La sección
"Qué Hacemos" directamente no leía `site_settings` en absoluto.

**Causa raíz**
Las migraciones (`002_site_settings.sql`) y el fallback (`lib/constants.ts`) se escribieron con nombres
de campo (`title`, `subtitle`, `p1`, `p2`, `brand_text`, `horario`) distintos a los que realmente leen
las páginas públicas y los forms del dashboard (`headline`, `heading`, `description1`, `description2`,
`description`, `hours`). Los dos lados (seed/fallback vs. consumidores) se escribieron sin un contrato
de nombres compartido.

**Solución**
Se unificaron los nombres de campo en `supabase/migrations/002_site_settings.sql` y `lib/constants.ts`
para que coincidan exactamente con lo que leen `app/page.tsx`, `app/quienes-somos/page.tsx`,
`app/contacto/page.tsx`, `components/Footer.tsx` y los `*Form.tsx` del dashboard. Se agregó también
la llamada a `getSiteSettings('que_hacemos')` en `app/page.tsx` (antes hardcodeado, cero conexión a DB).

**Lección**
Cuando el seed/fallback de una tabla `key/jsonb` y sus consumidores se escriben en momentos o agentes
distintos, verificar explícitamente que los nombres de campo coincidan antes de dar por completo el CMS
— un form que "guarda bien" no prueba que el público lea esa clave.

## 2026-07-04 Playwright corría contra el sitio equivocado (puerto 3000 ocupado)

**Síntoma**
12 de 25 tests E2E fallaban con contenido irreconocible (`toHaveTitle` devolvía el título de otro
proyecto, navbar con links de un e-commerce, stats/schema.org ausentes, etc.) inmediatamente después
de la reestructura del home — parecía una regresión grande.

**Causa raíz**
`playwright.config.ts` usaba `baseURL`/`webServer.url` = `http://localhost:3000` con
`reuseExistingServer: !process.env.CI`. En esta máquina, el puerto 3000 ya estaba ocupado por un
proyecto no relacionado (CHAKAN). Playwright asumió que el server ya levantado en :3000 era el
correcto y corrió toda la suite contra ESE sitio, no contra inglobal-site.

**Solución**
Se cambió `playwright.config.ts` para usar un puerto dedicado (3310): `webServer.command: 'npx next
start -p 3310'`, `baseURL`/`url: 'http://localhost:3310'`. Los 25 tests pasaron sin cambios de código
en el sitio — no había regresión real.

**Lección**
`reuseExistingServer: true` es peligroso en máquinas donde corren varios proyectos Next.js a la vez:
si el puerto configurado está ocupado por OTRO proyecto, Playwright no lo detecta y corre la suite
entera contra el server equivocado sin ningún error obvio. Cada proyecto de la fábrica debería usar
un puerto propio en su `playwright.config.ts` en vez de confiar en el 3000 default.

## 2026-07-12 `updateSiteSettings` nunca pudo guardar ningún form de Contenido

**Síntoma**
Los 9 forms de `/dashboard/contenido/*` (Hero, Footer, Stats, Quiénes Somos, Qué Hacemos, CTA Banner,
Clientes Destacados, Ubicación, Contacto) parecían funcionar (renderizaban, tenían sus campos con
`defaultValue` correcto) pero al apretar "Guardar" siempre devolvían "El valor debe ser JSON válido.".
Nadie lo había reportado porque el contenido de fallback (`lib/constants.ts`) coincide visualmente con
lo que ya está "guardado" — un cambio real nunca llegaba a persistirse, así que el síntoma en el sitio
público era simplemente "edité pero no cambió nada", fácil de confundir con caché.

**Causa raíz**
`updateSiteSettings(key, prevState, formData)` en `app/actions/settings.ts` leía
`formData.get('value')` esperando un único campo JSON — pero ningún `*Form.tsx` de `contenido/*` tiene
un input `name="value"`: todos mandan sus campos individuales tal cual (`name="headline"`,
`name="phone"`, etc.), o una lista serializada en un campo con su propio nombre (`StatsList` manda
`name="items"`). El campo `value` nunca existió en el FormData → `formData.get('value')` daba `null` →
`JSON.parse('')` tiraba siempre. Estaba así desde el commit que introdujo la función (`62bc191`), antes
de que existieran los forms reales de `contenido/*` — el contrato quedó desactualizado cuando se
construyeron los forms.

Además, `stats` tenía una segunda inconsistencia independiente: el seed SQL (`002_site_settings.sql`)
guarda un array crudo (`[{number,label},...]`), pero tanto `StatsForm.tsx` como `app/page.tsx` siempre
leyeron `settings.items` (esperando `{items: [...]}`) — con un array crudo, `.items` es `undefined`, así
que el home siempre mostraba los 3 stats hardcodeados sin importar lo que hubiera en la DB.

**Solución**
`updateSiteSettings` ahora arma el objeto `value` a partir de TODOS los campos del FormData recibido
(`Object.entries` vía `formData.entries()`), parseando como JSON los que empiezan con `[`/`{` (listas
serializadas) y dejando el resto como texto plano. `getSiteSettings` (`lib/content.ts`) normaliza un
array crudo de DB a `{ items: [...] }` antes del merge con el fallback, y `FALLBACK_SITE_SETTINGS.stats`
pasó de array crudo a `{ items: [...] }` para ser consistente en el path de fallback también. No se tocó
la migración `002_site_settings.sql` (las migraciones ya aplicadas no se editan) — la normalización en
`getSiteSettings` cubre el array crudo que ya está en cualquier DB existente.

**Lección**
Un formulario que "no tira error visible al cargar" no prueba que su submit funcione — hay que probar
el guardado end-to-end (editar → guardar → recargar en otra pestaña) antes de dar por completo una
feature de CMS, sobre todo cuando el contrato entre `action` y `*Form.tsx` se escribió en momentos
distintos (la action es de `62bc191`, los forms reales son de `3d783e8`, casi 3 meses después).
