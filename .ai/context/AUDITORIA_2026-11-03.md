# Auditoría 2026-11-03 (inglobal-agenda-app, más el pairing de TV del sitio)

Método: lectura de todo `src/` de la app, `tsc`, lint, `expo-doctor`, `npm audit` y `expo export` para medir el peso. **No se probó en dispositivos reales**: lo que dependa de iOS/Android nativo queda para el build 18 en TestFlight.

## Hallazgos y estado

| # | Hallazgo | Estado |
|---|---|---|
| 1 | La caché de eventos de la app no vencía nunca: lo que se cargaba desde el panel u otro celular no aparecía hasta cerrar la app. Tampoco los cambios de nombre en catálogos. | **Corregido.** Vence a los 30 s, se invalida al volver a primer plano y al editar catálogos; Mes y Semana tienen deslizar para refrescar (`src/lib/agenda-api.ts`, `useVersionEventos`). |
| 2 | Arranque: la carga esperaba la validación de la sesión (hasta 20 s con mala señal) y la precarga de fotos (hasta 4 s). | **Corregido.** Sesión guardada al instante y validada por detrás (`loadSessionRapida`); precarga sin bloquear. Se mantiene el mínimo de 1,8 s de marca. |
| 3 | Velo con logo en cada cambio de pestaña: al menos 1,5 s bloqueando toques. | **Corregido** (decisión de Mateo): fundido de 300 ms de las pestañas, sin bloquear. `VeloCarga` eliminado. |
| 4 | Peso: 17 MB exportados. Importar desde el índice de `@expo-google-fonts/*` y `@expo/vector-icons` metía los 18 pesos de Inter, 7 de Manrope y todas las familias de íconos. Logo de Perfil de 566 KB mostrado a 56 px. | **Corregido.** Imports por peso y `@expo/vector-icons/Ionicons`; logo de 43 KB (`logo-isotipo-perfil.png`). Ahora 7,3 MB. Lo grande que queda es `MaterialSymbols` (966 KB), que trae `expo-router` por dentro. |
| 5 | Vista Día: montaba la grilla de 45-90 días × 24 franjas (miles de vistas). | **Corregido.** Solo se dibuja la grilla de ±4 días alrededor del enfocado. |
| 6 | Formulario: la fecha de fin no se podía quitar. | **Corregido** (botón ×). |
| 7 | Horas que no son múltiplo de 15 (cargadas desde el panel) no estaban en el selector y podían cambiarse al editar. | **Corregido** (se agregan a las opciones). |
| 8 | "Cerrar sesión" sin indicador; la baja de avisos podía tardar 20 s sin red. | **Corregido** (spinner y tope de 4 s). |
| 9 | Errores de carga en Mes/Semana/Día sin "Reintentar". | **Corregido** (`ErrorReintentar`). |
| 10 | Vincular TV: se aprobaba cualquier QR sin verificar de qué TV era, y la TV recibe una sesión completa de 30 días. | **Corregido.** Código de 6 dígitos derivado del token (`lib/tv-pair-codigo.ts`), mostrado en `/agenda-tv/pair` y en la app vía `GET /api/tv-pair/info` (requiere sesión). `approve` no cambió: apps viejas siguen funcionando. |
| 11 | Cuenta `+applereview` activa en producción. | Pendiente (ya en `PENDIENTES.md`). |
| — | Código muerto: `react-native-svg`, `expo-web-browser`, `estadoColorClasses`, `nombresGruas`, `scripts/reset-project.js`, variables de Supabase en `.env.local`. | **Eliminado.** `@expo/ui` y `expo-symbols` quedan: los requiere `expo-router`. |
| — | Estilo: barra de pestañas con fuente del sistema; flechas de texto (‹ › ◂) en la agenda. | **Corregido** (Inter e Ionicons). |
| — | `npm audit` (prod): 23 avisos, 1 crítico. | `npm audit fix` sin `--force`: 19, 0 críticos. El resto pide `--force` (cambia la versión de Expo); la mayoría es tooling de build. |

## Orden de despliegue
1. Sitio primero (`/api/tv-pair/info` y el código en `/agenda-tv/pair`): una app nueva contra un sitio viejo no puede obtener el código y no deja aprobar.
2. App: quitar `react-native-svg` y `expo-web-browser` cambia el binario, así que va como build 18 (no alcanza con `eas update`).

## A verificar en el build 18
Arranque sin señal con sesión guardada, cuenta desactivada desde el panel (debe desloguear al rato de abrir), deslizar para refrescar en Mes/Semana, fundido entre pestañas, vista Día con scroll rápido largo, vincular TV con el código.
