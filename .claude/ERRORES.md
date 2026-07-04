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
