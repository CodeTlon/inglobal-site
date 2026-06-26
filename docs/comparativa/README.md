# Comparativa: sitio nuevo vs. sitio actual

Auditoría hecha con **Playwright** (Chromium, mismos viewports para ambos).
Capturas en esta carpeta:

- `nuestro-desktop.png` / `nuestro-mobile.png` — sitio nuevo (Next.js)
- `actual-desktop.png` / `actual-mobile.png` — sitio actual (gruasinglobal.com, Duda)

## Velocidad y peso (home)

| Métrica | Nuevo | Actual (Duda) | Ventaja |
|---|---|---|---|
| First Contentful Paint | 204 ms | 1.616 ms | ~8× |
| DOMContentLoaded | 78 ms | 2.906 ms | ~37× |
| DOM completo | 245 ms | 4.841 ms | ~20× |
| Peso de página | 1.683 KB | 6.487 KB | 3,9× más liviano |
| Requests | 31 | 86 | mitad |
| Errores de consola | 0 | 1 | — |

## Mobile (375px)

| Chequeo | Nuevo | Actual (Duda) |
|---|---|---|
| Scroll horizontal | 0 px (7 páginas) | 393 px → roto en celular |
| Popups intrusivos al cargar | 0 | 3 |
| Imágenes sin `alt` | 0 | 2 |
| Formulario de contacto | 10 campos validados | 0 |
| Email de contacto | OK | roto (`...inglobalsr@gmail.com`, falta la "l") |

## SEO

- Nuevo: 7 páginas, cada una con título único, meta description, canonical, 1 `<h1>`, sitemap.xml + robots.txt + datos estructurados (LocalBusiness).
- Actual: una sola página.
