# PROJECT — Grúas InGlobal

## Qué es

Sitio institucional + dashboard CMS de **Grúas InGlobal S.R.L.**, empresa de grúas, hidrogrúas y montajes industriales en Córdoba, Argentina. Reescritura de un sitio PHP legacy a Next.js 15, deployado en Vercel. El dashboard permite editar casi todo el contenido público (textos, fotos, montajes, clientes, servicios, trabajos, galería) sin tocar código, y además incluye un módulo de **agenda de flota** (grúas, empresas, operarios, eventos) con vistas para jefes (`/dashboard/agenda/calendario`) y un kiosco de TV de solo lectura (`/agenda-tv`).

Desde ~agosto/septiembre 2026 el proyecto ganó una segunda superficie: una **app mobile satélite** (`inglobal-agenda-app`, repo aparte) que consume una capa REST propia (`app/api/**`, autenticación Bearer) para que el personal de campo (rol `trabajador`) gestione la agenda desde el celular sin acceso al panel web.

## Para quién

- **Grúas InGlobal S.R.L.** (el cliente) — usa el dashboard (`/dashboard/**`) para mantener el sitio público y gestionar la agenda de la flota. Roles `admin` (acceso total al panel + agenda) y `trabajador` (solo la app mobile, sin panel web) — ver `.ai/context/ARCHITECTURE.md`.
- **Visitantes del sitio público** — clientes potenciales que llegan a `/`, `/servicios`, `/montajes`, `/clientes`, `/galeria`, `/contacto` buscando información y para dejar una cotización.
- **Personal de campo** (operarios, choferes) — consumen la agenda vía la app mobile o el kiosco `/agenda-tv` (pantalla fija sin login, pairing por QR).

## Qué problema resuelve

1. Reemplaza un sitio PHP legacy que el cliente no podía editar sin depender de un desarrollador.
2. Reemplaza la gestión manual/informal de la agenda de grúas (quién trabaja dónde, con qué grúa, qué operarios) por un sistema con validación de conflictos (una grúa/operario no puede estar en dos eventos que se solapan, a nivel de constraint de base de datos) y estados con transición controlada (`reserva → programado → en_curso → finalizado`, o `cancelado` desde cualquiera de los tres primeros).

## Alcance actual

- Sitio público informativo + formulario de contacto (Resend).
- Dashboard CMS completo: `site_settings` (secciones singleton del home/páginas), CRUD de `montajes`, `clientes` (con mini-blog de `trabajos` por cliente), `servicios`, `galeria`.
- Agenda de flota: catálogos (grúas, empresas, operarios), eventos con validación de solapamiento y transición de estados (con auto-transición vía cron de Vercel), vista semanal para jefes, kiosco de TV con pairing QR.
- Capa REST (`app/api/**`) para la app mobile, separada de los Server Actions que usa el sitio público/dashboard.
- SEO on-page + Google Analytics con Consent Mode v2 + banner de cookies propio (agregado en la última ronda, commit `96d2442`).
- Microservicio propio de transcodificación de video (`services/video-transcode/`, Node/Express) para no depender de `ffmpeg` en el runtime de Vercel.

## No-objetivos

- No es un ERP: no maneja facturación, pagos, ni contabilidad.
- No es multi-tenant: es un proyecto de un solo cliente (Grúas InGlobal), sin arquitectura pensada para reutilizarse como producto para otras empresas de grúas.
- No reemplaza la gestión comercial/administrativa de la empresa — la agenda de grúas es planificación operativa de flota, no un CRM.
- El rol `trabajador` no tiene (ni está pensado para tener) acceso al panel web — su superficie es exclusivamente la app mobile. Confirmar con el cliente/Mateo si esto cambia (ver `.ai/context/OPEN_QUESTIONS.md`).
