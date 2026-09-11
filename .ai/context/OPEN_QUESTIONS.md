# OPEN_QUESTIONS — Grúas InGlobal

Todo lo que quedó como UNKNOWN o ASSUMPTION al reconstruir el contexto de este proyecto (2026-09-11). Resolver con Mateo/el cliente cuando corresponda, no asumir una respuesta.

## ¿La app mobile usa el mismo proyecto Supabase que el web, o uno separado?

`docs/deployment-guide.md` dice "el mismo proyecto Supabase que usa la mobile app", pero el resto de la documentación (y las migraciones dev/prod separadas) describe un esquema `inglobal-dev`/`inglobal-prod`. Contradicción real entre dos fuentes, no reconciliable leyendo solo este repo — puede que la respuesta esté en `inglobal-agenda-app` (repo aparte).

## ¿Sigue en pie la migración a Coolify para `services/video-transcode`, o ya está resuelto de otra forma?

El `.claude/CLAUDE.md` original (antes de esta restructuración) trataba el microservicio como "pendiente/inerte hasta Coolify". El código muestra que la integración (`lib/transcode-token.ts`, `app/actions/transcode.ts`) ya está completa y funcional con soft-fail. Falta confirmar si el microservicio en sí ya tiene un hosting real (Coolify u otro) o si sigue sin desplegar.

## ¿Cuándo se corta `gruasinglobal.com` a la producción real de Vercel?

`lib/site.ts` sugiere que todavía no pasó. Sin fecha ni bloqueador conocido documentado.

## ¿Está planeado agregar CI real (GitHub Actions), o el gate manual es deliberado?

No existe `.github/workflows/` pese a que `.claude/commands/cerrar.md` habla de "correr el mismo gate que el CI" — sugiere que en algún momento se planeó CI real. No está confirmado si sigue en el radar o se descartó a favor del gate manual.

## ¿El rol `trabajador` va a ganar algún acceso al panel web en el futuro?

Hoy su única superficie es la app mobile vía `app/api/**` — el middleware lo desloguea activamente si intenta entrar a `/dashboard/**`. No hay evidencia de que esto vaya a cambiar, pero tampoco de que sea una decisión final.

## ¿Vale la pena una herramienta de mantenimiento de contexto a nivel de fábrica?

Fuera del alcance de este repo — ver el veredicto completo en `.ai/context/DECISIONS.md` ("Veredicto Fase 3"). Mateo mantiene la misma estructura `.claude/CLAUDE.md`/`AGENTS.md`+`.ai/context/` en varios proyectos (`output/*`, `portfolio/*`), así que el dolor de sincronización manual se repite entre proyectos. Si esto se vuelve a desincronizar en más de un proyecto, vale la pena evaluar un mecanismo compartido a nivel `codetlon-cloud`/`codetlon-forge` — no un subagente dedicado a `inglobal-site`.
