# OPEN_QUESTIONS — Grúas InGlobal

Todo lo que quedó como UNKNOWN o ASSUMPTION al reconstruir el contexto de este proyecto (2026-09-11). Resolver con Mateo/el cliente cuando corresponda, no asumir una respuesta.

## ¿Cuándo se corta `gruasinglobal.com` a la producción real de Vercel?

`lib/site.ts` sugiere que todavía no pasó (confirmado por Mateo el 2026-09-11: sigue sin pasar). Sin fecha ni bloqueador conocido documentado — ver `.ai/context/CURRENT_STATE.md`.

## ¿Está planeado agregar CI real (GitHub Actions con lint/tsc/build), o el gate manual es deliberado?

No existe ese workflow (el único `.github/workflows/` hoy es el cron de agenda, no un gate de calidad) pese a que `.claude/commands/cerrar.md` habla de "correr el mismo gate que el CI" — sugiere que en algún momento se planeó CI real. No está confirmado si sigue en el radar o se descartó a favor del gate manual.

## ¿Vale la pena una herramienta de mantenimiento de contexto a nivel de fábrica?

Fuera del alcance de este repo — ver el veredicto completo en `.ai/context/DECISIONS.md` ("Veredicto Fase 3"). Mateo mantiene la misma estructura `.claude/CLAUDE.md`/`AGENTS.md`+`.ai/context/` en varios proyectos (`output/*`, `portfolio/*`), así que el dolor de sincronización manual se repite entre proyectos. Si esto se vuelve a desincronizar en más de un proyecto, vale la pena evaluar un mecanismo compartido a nivel `codetlon-cloud`/`codetlon-forge` — no un subagente dedicado a `inglobal-site`.
