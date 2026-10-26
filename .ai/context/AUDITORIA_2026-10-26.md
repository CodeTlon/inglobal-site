# Auditoría 2026-10-26 (sitio + app) — paginación, agenda, SEO, UX, seguridad, lógica

Alcance: lectura de código y pruebas puntuales; no es un pentest. Nada de esto está corregido salvo lo indicado.

## Paginación
| Dónde | Estado |
|---|---|
| Público: `/clientes` (20 por página), `/montajes` (8), `/clientes/[slug]` trabajos | Sí, pero **en el cliente** (`useState` + `slice`): trae todo y la página no vive en la URL (no se comparte ni se indexa). Con el volumen actual alcanza. |
| Dashboard: clientes, montajes, galería, servicios, usuarios | No. Listas completas. Volumen bajo. |
| Dashboard `/consultas` | Sin paginación, tope duro `limit(200)`: las consultas más viejas desaparecen sin aviso. |
| Dashboard `/agenda` (lista) | **No.** Trae todos los eventos desde hoy (`getEventosAgenda({ desde })` sin `hasta` ni límite) y los muestra en una sola columna `max-w-3xl`. Es el punto más débil. |
| Calendario web / TV | Por rango (mes/semana): bien. |
| API de la app (`app/api/**`) | Sin `limit`/`offset`. La app pide por rango de fechas para agenda y cachea (`getEventosAgendaCached`); catálogos se piden completos. |
| App móvil | Listas con `ScrollView` + `.map` (sin `FlatList`): sin virtualización ni paginación. Aceptable con ~10 grúas/operarios y decenas de empresas; no escala a cientos. |

## Agenda de grúas (dashboard): cómo mejorarla
Hoy: una tarjeta por evento, una debajo de otra, sin agrupar, sin filtros, ancho 3xl en pantallas grandes, y crece sin límite.
Propuesta (por prioridad):
1. Agrupar por día con encabezado ("Hoy", "Mañana", "mié 28 oct") y contador por día.
2. Rango acotado por defecto (próximos 7 o 14 días) con "Cargar más" o `?desde=&hasta=` en la URL; así la consulta también queda acotada.
3. Usar el ancho: contenedor `max-w-6xl` y 2 columnas desde `xl`, o tabla compacta en escritorio.
4. Filtros en la URL: estado, grúa, empresa y buscador de texto.
5. Mostrar fin de turno, grúas con "+N" y operarios sin truncar la empresa; estados con color + texto.
6. Atajo claro al calendario semanal (ya existe `/dashboard/agenda/calendario`).

## SEO
- Bien: `sitemap.ts` con fichas dinámicas, `robots.ts` con `/dashboard/` y `/api/` bloqueados, JSON-LD (`components/seo/JsonLd.tsx`), `llms.txt`, `generateMetadata` en las páginas públicas.
- **`/agenda-tv` está en el sitemap**, pero exige sesión y redirige a `/agenda-tv/pair`: quitarla del sitemap y agregar `/agenda-tv` al `disallow` de robots.
- Open Graph definido solo en 3 archivos y sin `opengraph-image`: al compartir en WhatsApp/Redes las fichas pueden salir sin imagen. Agregar OG por ficha (montaje, cliente, trabajo).
- Grids paginados en cliente: la página 2+ no tiene URL propia. Si el catálogo crece, paginar en el servidor con `?page=` y `rel=prev/next` o canonical.
- 3 `alt=""` en componentes: revisar que sean decorativos.

## UX / UI / accesibilidad
- Ojo de contraseña: solo el login lo tiene; faltan en cambiar contraseña, crear usuario y resetear. (El "no anda" reportado era el servidor de desarrollo por Tailscale: corregido con `DEV_ALLOWED_ORIGINS`.)
- `/dashboard/consultas` sin paginación ni búsqueda ni marcado de leídas.
- Solo 7 `loading.tsx` en el panel: las listas largas sin skeleton parpadean.
- `useFormState` (react-dom) está deprecado en React 19: migrar a `useActionState` (el login lo usa).
- `cambiar-password` no tiene `<h1>`/PageHeader propio.

## Seguridad
- Bien: headers (HSTS, X-Frame-Options DENY, nosniff, Permissions-Policy), CSP en producción, SVG rechazado en subidas, imágenes reprocesadas con sharp, server actions con chequeo de rol (todas salvo `contact`, que es público y tiene rate limit), `npm audit --omit=dev` sin vulnerabilidades altas reportadas por el gate del proyecto, rate limit de Better Auth (10/min en login).
- Rate limits (login, contacto, TV pair) **en memoria de la instancia**: no se comparten si hay más de una réplica (ya anotado en PENDIENTES).
- Subidas: el tipo se decide por `file.type` (lo manda el cliente). Imágenes pasan por sharp (seguro); **videos y PDF no se verifican por contenido** (firma de archivo). Agregar sniffing de magic bytes.
- Cron: comparación `auth !== \`Bearer ${CRON_SECRET}\`` no es de tiempo constante; usar `timingSafeEqual`.
- CSP solo en producción (esperable); revisar que no use `unsafe-inline` si se puede pasar a nonces.
- Sesión de 30 días sin rotación forzada ni cierre en todos los dispositivos: aceptable para uso interno, anotar.

## Lógica
- Zona horaria de Córdoba ya resuelta con `OFFSET_AR` (v2.1.2). Mantenerla en todo código nuevo.
- Doble reserva de grúas protegida por trigger (`chequear_solapamiento_grua`) y guardado en transacción (PR #11).
- `getEventosAgenda` sin tope: una consulta con rango enorme devuelve todo (la lista de agenda lo hace hoy).
- Política de `hora_fin` por defecto (18:00 en la app / 23:59 en el sitio) sigue sin decidir (OPEN_QUESTIONS).
- Web de la app ≠ producto: el export web de la app existe pero no es un destino soportado.

## Orden sugerido
1. Vista de lista de agenda (agrupar, rango, 2 columnas, filtros). 2. Sitemap/robots de `/agenda-tv` y OG por ficha. 3. `timingSafeEqual` en cron y magic bytes en subidas. 4. Ojo de contraseña en los otros formularios y `useActionState`. 5. Paginación de `/consultas` y paginar en servidor si el catálogo público crece.
