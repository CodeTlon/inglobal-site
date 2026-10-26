# Auditoría profunda 2026-10-26 (inglobal-site + inglobal-agenda-app)

Reemplaza la pasada rápida del mismo día. Método: lectura de código, gate automático (tsc, lint, tests con base local, audit) y pruebas con Playwright en 2 tamaños del sitio y 5 de la app (web exportada). **No es un pentest y la app no se probó en dispositivos reales**: lo nativo (teclado, safe areas reales, video, pushes) queda marcado como "a verificar".
Capturas: `screenshots/auditoria/` en cada repo. Nada de esto está corregido todavía.

## Gate automático (sitio)
- `tsc` 0 errores; lint 0 errores y 13 warnings (11 `setState` dentro de efectos, 1 `window.location.href`, 1 eslint-disable sobrante).
- Tests unitarios con Postgres local: 22 pasan, 0 fallan, 12 salteados (paridad con prod, necesitan backup).
- `npm audit --omit=dev`: **1 moderada nueva** (`fast-uri` 3.0.0–3.1.8, 4 advisories). Se arregla con `npm audit fix`. El gate del proyecto pide 0.

## Severidad alta
1. **SEO: todas las páginas declaran como canónica la portada.** `app/layout.tsx` tiene `alternates: { canonical: '/' }` y ninguna página lo pisa. Confirmado en producción (`/servicios` → `canonical=https://gruasinglobal.com`). Google trata las subpáginas como duplicadas de la home y puede no indexarlas. Arreglo: canonical por página (relativo a su ruta) o quitarlo del layout.
2. **App: la barra de pestañas queda pegada/cortada abajo en teléfonos sin barra de gestos** (iPhone SE/8, Android con botones): con `insets.bottom = 0` el chip activo toca el borde (`src/app/(tabs)/_layout.tsx`: `paddingBottom: insets.bottom`). Arreglo: `paddingBottom: Math.max(insets.bottom, 8)` y alto acorde.
3. **App Android: teclado sobre los formularios.** Todos los `KeyboardAvoidingView` usan `behavior={ios ? 'padding' : undefined}`. Con SDK 57 Android es edge-to-edge obligatorio y `adjustResize` ya no achica la ventana: los campos de abajo (notas, operarios en "Nuevo evento", formularios de catálogo) pueden quedar tapados. **A verificar en dispositivo**; arreglo típico: `react-native-keyboard-controller` o `behavior="height"` en Android.

## Severidad media
4. **Rate limit evadible**: login (Better Auth aparte), contacto, `tv-pair/start` y `check-email` toman la IP del **primer** valor de `X-Forwarded-For`, que lo manda el cliente. Rotando ese header se saltea el límite. Usar la IP que agrega el proxy (último salto de Traefik o `x-real-ip`).
5. **Enumeración de cuentas**: `POST /api/auth/check-email` (sin sesión) responde si un email existe. Combinado con el punto 4, se puede enumerar sin límite real. Evaluar devolverlo solo con un desafío o quitarlo (la app puede conservar el email siempre).
6. **Filtro sin validar en la API de eventos**: `desde` de `GET /api/agenda/eventos` se interpola en `.or()` (`lib/agenda.ts:165`). No es inyección SQL (la capa `lib/db.ts` parametriza y valida identificadores), pero un usuario logueado puede agregar condiciones y una fecha inválida da 500. Validar `YYYY-MM-DD` con zod.
7. **Subidas**: el tipo de video/PDF se decide por `file.type` (lo manda el cliente) y no se verifica el contenido. Las imágenes sí pasan por sharp. Verificar magic bytes.
8. **Lista de agenda del panel** (`/dashboard/agenda`): trae todos los eventos desde hoy sin límite y los apila en una columna de `max-w-3xl` (en 1440 px queda un tercio de pantalla vacío; 32 eventos con el seed). Ver propuesta abajo.
9. **App, pantalla de 320 px** (iPhone SE 1ra gen / Android chicos):
   - Mes: el número del día y el contador se pisan con 2 dígitos ("29" + "10" se lee "2910").
   - Catálogos: el nombre queda en "ZZ-PRUE…": badge, interruptor y flecha se comen el ancho. Apilar el badge debajo del nombre en pantallas angostas.
   - El botón flotante "+" tapa la última fila del mes y la última tarjeta de catálogos (falta `paddingBottom` en el contenido).
10. **App: texto grande de accesibilidad sin tope.** No hay `maxFontSizeMultiplier`; con fuente grande del sistema, la pestaña (`TabBarIcon`, caja fija 96×48) y el header se cortan. Poner un tope (~1.3) en Text de tabs y header.
11. **Cron**: la comparación del `CRON_SECRET` no es de tiempo constante (`timingSafeEqual`).

## Severidad baja
- **SEO**: `/agenda-tv` (pide login) está en el sitemap y no está en `disallow` de robots. Las páginas públicas sí tienen `title`, `description`, un `h1`, `og:image` y `alt` en todas las imágenes (verificado en 7 rutas, móvil y escritorio, sin desborde horizontal).
- **Paginación pública** en el navegador (`useState` + `slice`): la página 2 no tiene URL. Alcanza con el volumen actual.
- **Panel**: `/consultas` corta en 200 sin aviso ni búsqueda; clientes, montajes, galería, servicios y usuarios sin paginar (volumen bajo). Labels del menú lateral cortados ("Páginas (Quiénes somos…", "Navbar y footer (todo el …"). "Calendario (solo lectura)" ya permite "Nuevo evento": el label miente.
- **Formularios con contraseña**: solo el login tiene ojito. `useFormState` deprecado (React 19 → `useActionState`).
- **Rate limits en memoria** por instancia (no se comparten entre réplicas).
- **Sesiones de 30 días** sin cierre en todos los dispositivos.
- **App iOS**: `supportsTablet` sin definir (iPad corre la app en modo iPhone, escalada). Correcto para uso interno; si se quiere iPad nativo hay que diseñar el layout ancho (en tablets Android ya se ve estirada: celdas del mes muy altas).
- **App listas** con `ScrollView` + `.map` (sin virtualización). Bien para decenas de ítems.

## Lo que está bien
- Capa `lib/db.ts`: valores siempre parametrizados, identificadores validados por regex.
- Autorización: todas las server actions chequean sesión/rol (salvo `contact`, público con rate limit); todas las rutas `app/api/**` usan `requireApiUser` salvo `health`, `auth/*` y `tv-pair/*`, que son públicas a propósito.
- TV pairing: token de 24 bytes aleatorios, vencimiento y un solo uso (se consume antes de crear la sesión).
- `/media`: ruta resuelta con `resolveStoragePath`, `nosniff`, tipos acotados.
- HTML de montajes/trabajos sanitizado (iframes solo YouTube); JSON-LD escapado.
- Redirect post-login acotado a `/dashboard` y `/agenda-tv` (sin open redirect).
- Headers de seguridad y CSP en producción; zona horaria de Córdoba con `OFFSET_AR`; anti-solapamiento de grúas por trigger y guardado en transacción.
- App: `expo-doctor` 21/21; permisos de cámara y fotos con texto en español; timeouts de red de 20 s; token en SecureStore; caché de agenda por rango; módulos nativos opcionales (`expo-notifications`, `expo-video`) cargados con guarda.

## Agenda de grúas (panel): propuesta
1. Agrupar por día con encabezado ("Hoy", "Mañana", "mié 28 oct") y contador.
2. Rango por defecto de 7 o 14 días, en la URL (`?desde=&hasta=`), con "Cargar más": acota también la consulta.
3. Usar el ancho: 2 columnas desde `xl` o tabla compacta en escritorio.
4. Filtros en la URL: estado, grúa, empresa, texto.
5. Mostrar hora de fin y operarios; atajo claro al calendario semanal.

## Orden sugerido
1. Canonical (1) y `npm audit fix` — minutos, impacto alto.
2. Barra de pestañas y teclado en Android (2, 3) antes del próximo build de la app.
3. IP real del rate limit y check-email (4, 5), validar `desde` (6), cron (11).
4. Pantallas de 320 px y tope de fuente (9, 10).
5. Vista de agenda del panel (8).
6. Lo de severidad baja.
