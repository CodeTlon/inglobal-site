---
description: Cierra la sesión de mantenimiento (build, README/Changelog, merge a main, push, tag SemVer).
---

Cerrá la sesión de mantenimiento de la rama actual:

1. **Gate pre-push (local):** correr el MISMO gate que el CI antes de pushear — `npm run lint && npx tsc --noEmit && npm run build` (los tres tienen que pasar; si hay tests afectados, corrélos). Si algo falla, frená y avisá: no pushees un CI que ya sabés que va a salir rojo. Atrapar el rojo local ahorra el run de Actions.
2. **Documentar la release:**
   - `README.md` (raíz) → agregá fila(s) al Changelog (`vX.Y.Z — <fecha> — qué cambió en la sesión`) + actualizá Setup/Scripts/Env/Deploy si cambió.
   - `.ai/context/` → actualizá el/los archivo(s) que la sesión afecta: `ARCHITECTURE.md` (arquitectura), `DOMAIN.md` (modelo de datos/reglas de negocio), `CONVENTIONS.md` (patrón nuevo o corregido), `DECISIONS.md` (decisión con contexto/alternativas/consecuencias), `CURRENT_STATE.md` (qué queda pendiente/en curso), `KNOWN_ISSUES.md`/`OPEN_QUESTIONS.md` (si surgió un riesgo o una pregunta sin resolver). `AGENTS.md` (raíz) solo si cambió una convención crítica no negociable.
   - `docs/deployment-guide.md`/`MANUAL-PRUEBAS.md` → si la sesión los afecta directamente (no son parte de `.ai/context/`, se actualizan aparte).
   - `git add -A && git commit -m "docs: actualizar README/changelog y contexto"` (sin `Co-Authored-By`).
3. **Merge + versionar:**
   `git push -u origin <rama>`  (opcional: `gh pr create --base main ...`)
   `git checkout main && git merge --no-ff <rama>`
   `git tag vX.Y.Z`  (patch=fix · minor=feat · major=breaking)
   `git push origin main --tags`
4. **Confirmá:** README Changelog y el/los archivo(s) de `.ai/context/` correspondientes quedaron al día, y main está pusheado con el tag.
