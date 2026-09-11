---
description: Abre una sesión de mantenimiento (crea la rama). Cada prompt commitea acá; no mergea ni pushea hasta /cerrar.
---

Tema de la sesión: $ARGUMENTS

Abrí una sesión de mantenimiento:

1. **Contexto:** Ya tenés `AGENTS.md` cargado. Tené a mano `.ai/context/00_INDEX.md` para leer SOLO el archivo de `.ai/context/` que corresponda a cada cambio (no releas el repo entero, ni todo `.ai/context/`).
2. **Elegí el tipo** según el trabajo (e inferilo de la descripción; si el usuario lo indica, respetalo):
   `feat/` pedido/feature nueva · `fix/` bug · `perf/` optimización · `refactor/` refactor · `chore/` deps/config/contenido · `style/` visual · `docs/` documentación.
3. **Crear la rama desde main:**
   `git checkout main && git pull origin main`
   `git checkout -b <tipo>/<tema-corto>`
4. **Avisá:** "Sesión abierta en `<tipo>/<tema>`. Por cada cosa que me pidas voy a commitear en esta rama. NO voy a mergear ni pushear a main hasta que me digas `/cerrar`."

A partir de ahora, en CADA prompt de la sesión:
- Implementás lo pedido leyendo solo los archivos necesarios.
- `git add` + `git commit` granular y convencional (`fix:`/`feat:`/...), **sin `Co-Authored-By: Claude`**.
- Si el cambio fue estructural (archivo/tabla/env nuevos), actualizás el/los archivo(s) correspondiente(s) de `.ai/context/` (`DOMAIN.md` si es de datos, `ARCHITECTURE.md` si es de arquitectura, `CONVENTIONS.md` si es un patrón nuevo, `DECISIONS.md` si es una decisión con alternativas) en el mismo commit, y `AGENTS.md` si afecta una convención crítica no negociable.
- Si el cambio tiene riesgo real de bug que los tests automáticos no van a atrapar (UI con criterio humano, timing/concurrencia, credenciales externas), sumá su sección a `MANUAL-PRUEBAS.md` en el mismo commit.
- **NO** `git push`, **NO** merge a main. Quedás en la rama esperando el próximo pedido.

Regla: si ya estás parado en una rama de trabajo (cualquier prefijo `feat/`/`fix/`/`perf/`/..., no `main`), seguís en la misma sesión — no abras otra rama salvo que el usuario lo pida.
