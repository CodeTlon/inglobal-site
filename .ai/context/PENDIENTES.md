# PENDIENTES — migración a Coolify (cierre de sesión 2026-10-14)

## Estado al 2026-10-21 (sesión de la noche del 20/10) — LEER PRIMERO
- **Producción corre en Coolify**: `https://inglobal.51.91.253.54.sslip.io` (recurso `p3wqid5ntkim0uw6h4ctd06e`, rama `main`, deploy automático). Datos de Supabase prod del 20/10 cargados y verificados (paridad completa: tablas, hashes, 30 archivos sha256). `main` = `test` = `dev` (`70bf75e`). **Vercel quedó roto a propósito** (el push a `main` lo redesplegó con el código nuevo, sin Supabase); ya no es referencia.
- **Pedidos de Bruno hechos** (sitio + app): (1) varias grúas por servicio — tabla `eventos_gruas`, migración `0004` (aplicada en prod: 12/12 eventos con backfill); (2) empresa primero y grúa(s) debajo. Ver `DOMAIN.md`.
- **`test` quedó con datos ficticios** (seed `ZZ-PRUEBA` + un solo admin con contraseña aleatoria). No hay datos reales ahí.
- **App**: `dev` = `test` = `main` (`0f04fb5`). `eas.json`: perfil `production` -> `https://inglobal.51.91.253.54.sslip.io`, `preview` -> test. **Falta sacar el build nuevo y subirlo a TestFlight / Play** (la URL va fija en el binario: al pasar a `gruasinglobal.com` hay que rehacerlo).
- **Respaldos puntuales en el servidor** (`/home/ubuntu`): `prod-db-pre-0004-*.sql.gz` (prod antes de la 0004) y `test-db-pre-reset-*.sql.gz`. Borrarlos cuando haya backup a B2.
- Pendiente de este bloque: backup diario a B2 de prod (hoy NO hay), verificar `gruasinglobal.com` en Resend, DNS, rotar la `service_role` de Supabase y las claves pegadas en chats, apagar Supabase tras 1–2 semanas, quitar `eventos_agenda.grua_id` solo cuando no queden apps viejas.
- Gotcha de proceso: **todo push a `main` despliega prod en Coolify solo**, y la migración corre al arrancar. Respaldar la base antes de mergear una migración nueva.


Fuente única de lo que falta. Estado detallado en `CURRENT_STATE.md`; runbook en `MIGRACION_SUPABASE.md`; variables y despliegue en `ENVIRONMENTS.md`.

## Dónde quedó todo
- **Test** (`https://inglobal-test.51.91.253.54.sslip.io`) corriendo en Coolify con los datos reales de producción cargados y verificados (13 tablas, 4 usuarios con hash, 27 archivos, sha256). Comparado contra Vercel: 39/40 rutas idénticas en texto y metadatos; visualmente igual salvo el banner de cookies (prod tiene `NEXT_PUBLIC_GA_ID`).
- **Ramas** (sitio): `feature/dev1-coolify-backend-propio` = `dev` = `test`. `main` NO se tocó (es producción y Vercel despliega solo desde ahí). PRs en borrador: #6 y #7 (sitio), #7 y #8 (app). Servicio de video: PR #2 de `codetlon-cloud`, ya en su `main`.
- **Servicio global de compresión de video**: `https://videotranscode.51.91.253.54.sslip.io` (`codetlon-cloud/templates/video-transcode`), con HTTPS, una API key global. Verificado de punta a punta contra test (7.5 MB -> 4.1 MB).
- **Acceso al servidor de Coolify**: usuario `ubuntu` con la clave `~/.ssh/id_coolify_global` (antes `id_gc2_coolify`), desde `codetlon-cloud`. Contenedor de la app: `app-zqezsdb39pwoc78ij5a88n8v-*`.

## 1. Seguridad (hacer primero)
- [ ] Revocar el token de gestión de Supabase pegado en el chat (Account -> Access Tokens) y luego borrar `/home/dev1/.secrets/supabase-prod.env` de la VPS.
- [ ] Desactivar el signup abierto en el Auth del Supabase de producción (Authentication -> Providers -> Email) mientras siga vivo: hoy cualquier persona puede registrarse y las policies le dan escritura sobre agenda y contenido.
- [ ] Rotar las claves que pasaron por el chat si la conversación se comparte: Resend de pruebas, API key del servicio de video, `BETTER_AUTH_SECRET` de test.
- [ ] Desactivar la cuenta `...+applereview@gmail.com` cuando termine la revisión de Apple (acceso total).
- [ ] Borrar `/home/dev1/inglobal-import.tgz` (datos personales, permisos 600) de la VPS.

## 2. Test: completar y probar a mano
- [ ] Verificar el dominio `gruasinglobal.com` en Resend y usar un remitente de ese dominio; hasta entonces los mails solo llegan a `codetloncordoba+prueba@gmail.com`.
- [ ] Decidir `NEXT_PUBLIC_GA_ID` en test (vacío = sin banner de cookies = única diferencia visual con producción).
- [ ] Backups: programar respaldo de los volúmenes `pgdata` (base) y `storage` (archivos) con `backup-coolify.sh` de `codetlon-cloud` (`docs/BACKUPS.md`) a B2 y hacer un simulacro de restauración. Sin esto no se debe tocar producción.
- [ ] Probar en la app móvil un build `preview` con `EXPO_PUBLIC_API_BASE_URL` apuntando al sitio de test (login, subir foto, notificaciones push en dispositivo con build nativo).
- [ ] Probar a mano en test: formulario de contacto (llegada del mail y `/dashboard/consultas`), vincular una TV (`/agenda-tv/pair`), subir un video desde el panel, cookie `Secure` e IP real detrás del proxy.

## 3. Corte a producción (bloqueado: el cliente todavía no dio acceso al dominio `gruasinglobal.com`)
> Producción sigue en Vercel + Supabase. Antes del DNS se puede avanzar con el recurso de prod en Coolify, la carga de datos y el backup a B2 (ver `CURRENT_STATE.md`).
- [ ] Crear el recurso de prod en Coolify (mismo compose, `BETTER_AUTH_SECRET` distinto, claves propias de Resend y del servicio de video).
- [ ] Pasada delta de datos con un token nuevo de Supabase en la ventana de corte y el sitio viejo en solo lectura (`importar-en-contenedor.cjs --reset`, luego `comparar-sitios.mjs`).
- [ ] Cambiar el DNS de `gruasinglobal.com`, desconectar Vercel (auto-deploy desde `main`) y recién entonces promover `test` -> `main` por PR.
- [ ] Publicar versión nueva de la app: las instaladas hablan con Supabase Auth; definir convivencia o forzar actualización.
- [ ] Supabase en solo lectura 1-2 semanas como rollback y luego baja del proyecto.

## 4. Deuda técnica
- [ ] `lib/db.ts` es una capa propia con la API de Supabase (filas `any`): migrar consultas a Drizzle módulo por módulo si se quiere tipado.
- [ ] Servicio de video: subir `keepAliveTimeout`/`headersTimeout` de Node (>65 s) por si vuelve el corte intermitente de 60 s (2 de ~14 pedidos, ya no apareció tras activar HTTPS).
- [ ] Rate limits (login de Better Auth y formularios) son en memoria de la instancia: no se comparten si hay más de una réplica.
- [ ] Fotos de la app: cada subida usa un uuid nuevo, el archivo anterior queda huérfano en `storage` (barrido pendiente).
- [ ] `/contacto`: en el HTML crudo el formulario sale después del footer (streaming); en el navegador es idéntico. Revisar si molesta a SEO/lectores.
- [ ] Documentar/limpiar variables viejas en Coolify (`*_MINIO`, `NEXT_PUBLIC_TRANSCODE_SERVICE_URL`, `TRANSCODE_SHARED_SECRET`).
- [ ] Convención: renombrar claves SSH por usuario (dev2 `id_coolify_dev2`, ubuntu `id_coolify_ubuntu`) según el criterio acordado.

## Decisiones tomadas (para no reabrirlas)
Todo en Coolify con un solo `docker-compose` (app, Postgres, cron); archivos en volumen servido por `/media` (sin MinIO, como gc2-entrenamiento); auth con Better Auth importando los hashes bcrypt (sin reset de contraseñas); una API key global para el servicio de video (los proyectos y sus variables los maneja una sola persona).
