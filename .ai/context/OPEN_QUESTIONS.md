# OPEN_QUESTIONS — Grúas InGlobal

Todo lo que quedó como UNKNOWN o ASSUMPTION al reconstruir el contexto de este proyecto (2026-09-11). Resolver con Mateo/el cliente cuando corresponda, no asumir una respuesta.

## ¿Cuándo se corta `gruasinglobal.com` a la producción real de Vercel?

`lib/site.ts` sugiere que todavía no pasó (confirmado por Mateo el 2026-09-11: sigue sin pasar). Sin fecha ni bloqueador conocido documentado — ver `.ai/context/CURRENT_STATE.md`.

## ¿Está planeado agregar CI real (GitHub Actions con lint/tsc/build), o el gate manual es deliberado?

No existe ese workflow (el único `.github/workflows/` hoy es el cron de agenda, no un gate de calidad) pese a que `.claude/commands/cerrar.md` habla de "correr el mismo gate que el CI" — sugiere que en algún momento se planeó CI real. No está confirmado si sigue en el radar o se descartó a favor del gate manual.

## ¿Dónde corre hoy `services/video-transcode` — tiene hosting real o sigue en soft-fail?

Referenciado desde `.ai/context/CURRENT_STATE.md`, `.ai/context/ARCHITECTURE.md` y `.ai/context/DECISIONS.md` ("Hosting de `services/video-transcode`") pero nunca se había escrito acá — quedó perdida en la restructuración del 2026-09-11. Según Mateo, "cree que ya tiene hosting real" (Coolify u otro), pero dicho con reserva, no confirmado desde este repo — no hay forma de verificarlo sin chequear `NEXT_PUBLIC_TRANSCODE_SERVICE_URL` en las env vars reales de Vercel. Mientras no se confirme, el guard de soft-fail sigue activo en el código (si el servicio no responde, el upload sube sin transcodificar en vez de romper).

## ¿Vale la pena una herramienta de mantenimiento de contexto a nivel de fábrica?

Fuera del alcance de este repo — ver el veredicto completo en `.ai/context/DECISIONS.md` ("Veredicto Fase 3"). Mateo mantiene la misma estructura `.claude/CLAUDE.md`/`AGENTS.md`+`.ai/context/` en varios proyectos (`output/*`, `portfolio/*`), así que el dolor de sincronización manual se repite entre proyectos. Si esto se vuelve a desincronizar en más de un proyecto, vale la pena evaluar un mecanismo compartido a nivel `codetlon-cloud`/`codetlon-forge` — no un subagente dedicado a `inglobal-site`.

## ¿Qué política de `hora_fin` por defecto se quiere? (abierta 2026-10-01)
La app móvil usa 18:00 para el estado visual y 23:59 para ubicar por día; el sitio usa 23:59. Es deliberado pero provoca que un evento sin `hora_fin` que arranca después de las 18:00 se vea distinto en la vista día de la app. Falta que el dueño decida unificar o mantener.

## ¿Los roles de operario deben ser editables? (abierta 2026-10-01)
Hoy son 4 fijos. Si el cliente quiere agregar o quitar roles, hay que crear una tabla y endpoints en el sitio.

## ¿Cuál es el Supabase de homologación (`test`)? (abierta 2026-10-01)
Mateo lo va a aportar. Con eso se configuran las variables de Vercel (Preview) y EAS (`preview`).
