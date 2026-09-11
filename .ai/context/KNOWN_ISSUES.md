# KNOWN_ISSUES — Grúas InGlobal

Problemas conocidos que afectan decisiones de ingeniería futuras (no son bugs abiertos para arreglar ya — son restricciones/riesgos a tener en cuenta).

## Los docs de mantenimiento se desincronizan si nadie fuerza el proceso

Los 4 docs de mantenimiento del proyecto (`README.md`, `ARCHITECTURE.md`, `MANUAL-PRUEBAS.md`, `.claude/ERRORES.md`) se desincronizaron del código real en ~2 meses (julio→septiembre 2026) pese a que `/cerrar` está diseñado para actualizarlos en cada cierre de sesión — el ejemplo más grave: `.claude/CLAUDE.md` afirmó "no hay roles" mientras el código ya implementaba un sistema real de roles admin/trabajador. Esta restructuración (`AGENTS.md` + `.ai/context/`) ataca la causa reforzando `/cambio`/`/cerrar` para apuntar acá — pero el riesgo de que alguien edite código sin actualizar `.ai/context/` en el mismo cambio sigue existiendo si no se respeta la disciplina.

## Sin CI/CD de calidad real

`.github/workflows/` existe desde el 2026-09-06, pero solo con `cron-transicionar-estados.yml` (dispara el cron de agenda cada 15min — reemplazó al cron nativo de Vercel, ver `.ai/context/DECISIONS.md`). No hay ningún workflow que corra `lint`/`tsc --noEmit`/`build`/tests en push o PR — ese gate de calidad sigue siendo puramente local/manual, depende de que la persona que mergea lo corra antes de pushear.

## Cobertura de tests limitada

24 tests E2E de UI (`tests/e2e/inglobal.spec.ts`, un solo archivo plano, sin agrupar por `test.describe`) + 1 unit test (`services/video-transcode/token.test.mjs`). Sin tests de integración, sin tests de políticas RLS — el incidente de `is_admin()` (migraciones 022→023, ver `.ai/context/DECISIONS.md`) no habría sido detectado por la suite actual.

## Contradicción sin resolver: proyecto Supabase de la app mobile

`docs/deployment-guide.md` dice que la app mobile usa "el mismo proyecto Supabase" que el web, mientras el resto de la documentación describe un esquema dev/prod separado (`inglobal-dev`/`inglobal-prod`). No se pudo resolver desde este repo solamente — ver `.ai/context/OPEN_QUESTIONS.md`.

## Focal point y `tiene_blog` son mecanismos acotados, no genéricos

El focal point de imágenes está limitado a 5 campos específicos (ver `.ai/context/DOMAIN.md`); agregarlo a un campo nuevo requiere replicar el patrón a mano en 4-5 lugares distintos (migración, schema, server action, form, render público). No hay una abstracción genérica — quien agregue un campo similar sin conocer este patrón corre el riesgo de reinventarlo de forma inconsistente.

## `docs/*.md` fósiles del delivery inicial

`docs/README.md`, `docs/technical-docs.md`, `docs/maintenance-guide.md` describen el estado del proyecto en abril 2026 (Next 14, Zod 3, sin dashboard/CMS) — quedaron marcados como obsoletos (banner al inicio) en vez de borrados, por su valor documental/contractual como entregable original. No confiar en su contenido técnico.
