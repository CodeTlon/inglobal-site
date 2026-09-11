# 00_INDEX — Grúas InGlobal

Qué leer según el tipo de tarea. Leé solo lo que necesites — no cargues todo el directorio por las dudas (disciplina de tokens, mismo criterio que el resto de la fábrica).

| Tipo de tarea | Leer primero |
|---|---|
| Primera sesión en el repo / onboarding | `PROJECT.md` + `ARCHITECTURE.md` |
| Tocar auth, roles, RLS, middleware | `ARCHITECTURE.md` (sección "Auth y roles") + `CONVENTIONS.md` |
| Tocar agenda (eventos, catálogos, estados, TV/kiosco) | `DOMAIN.md` (tablas de agenda + estados) + `ARCHITECTURE.md` (sección "Agenda como sub-sistema propio") + `KNOWN_ISSUES.md` |
| Agregar un upload nuevo (imagen/video/PDF) | `CONVENTIONS.md` (sección "Uploads grandes") |
| Agregar/editar un campo de `site_settings` o cualquier tabla de contenido | `DOMAIN.md` + `CONVENTIONS.md` (contrato de nombres) |
| Agregar focal point a un campo nuevo | `DOMAIN.md` + `CONVENTIONS.md` (sección "Focal point") |
| Entender por qué algo se hizo de una forma específica | `DECISIONS.md` |
| Saber qué está pendiente/bloqueado ahora mismo | `CURRENT_STATE.md` |
| Antes de asumir que algo funciona de cierta forma | `KNOWN_ISSUES.md` + `OPEN_QUESTIONS.md` (evitar repetir suposiciones ya identificadas como riesgosas) |
| Tocar la capa `app/api/**` (consumida por la app mobile) | `ARCHITECTURE.md` (secciones "Dos capas de mutación" y "Cinco clientes Supabase") |
| Tocar SEO/Analytics/CSP | `ARCHITECTURE.md` (sección "SEO, Analytics y CSP") |
| deps / vulnerabilidades, seguridad de código, accesibilidad, CI/CD, observabilidad | Módulos de la fábrica en `codetlon-cloud/.claude/modules/` — ver tabla al final de `AGENTS.md` |

Para QA manual paso a paso: `MANUAL-PRUEBAS.md` (raíz). Para causas raíz de bugs ya resueltos: `.claude/ERRORES.md`. Ninguno de los dos se duplica acá.
