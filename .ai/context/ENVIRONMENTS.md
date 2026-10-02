# Entornos (inglobal-site + inglobal-agenda-app)

Fuente de verdad de los 3 entornos. La app móvil solo enlaza acá.

| Entorno | Branch | Supabase | Sitio | App móvil |
|---|---|---|---|---|
| **Desarrollo** (local) | `dev` | stack local `inglobal-local` (Docker), datos de seed | `npm run dev:local` → `localhost:3200` | `npm run start:local` (en la app) |
| **Homologación** | `test` | proyecto Supabase de homologación — **PENDIENTE: lo define el dueño** | Vercel (entorno Preview) | perfil EAS `preview`, canal `preview` |
| **Producción** | `main` | proyecto Supabase real del cliente | Vercel Production (auto-deploy desde `main`) | perfil EAS `production`, canal `production` |

Flujo: `dev` → `test` → `main`. Las ramas `dev` y `test` ya existen en GitHub (espejo de `main` al crearlas). Un push a `main` despliega a producción. `main` es producción: se mantiene ese nombre técnico (Vercel despliega desde `main`). El proyecto Supabase de `test` todavía no está conectado:
no asumir que existe hasta que `CURRENT_STATE.md` lo diga.

## Reglas
- **Producción tiene datos reales del cliente.** Nunca correr seeds, scripts de prueba ni `db reset` contra homologación o producción.
- Las migraciones (`supabase/migrations`) se aplican en orden: local → homologación → producción. Una migración que ya corrió en producción no se edita; se agrega una nueva.
- Los `.env*` reales no se versionan (`.gitignore`); solo los `*.example`. Los valores de producción viven en Vercel / EAS.
- `seed.sql` y las cuentas de prueba son solo para local. Los scripts (`dev-local.mjs`, `db-local-users.mjs`, `start-local.mjs`) se niegan a correr si el Supabase no es local.

## Desarrollo local (Docker)
Requisitos: Docker, Node, y `inglobal-agenda-app` clonada al lado de este repo.

```bash
npm run db:local:up      # levanta Supabase local, aplica las migraciones y el seed, crea las cuentas de prueba
npm run dev:local        # sitio en http://localhost:3200 apuntando al Supabase local (no toca ningún .env)
npm run db:local:reset   # vuelve a cargar migraciones + seed + cuentas (borra todo lo local)
npm run db:local:down    # apaga el stack
```

- Puertos propios (rango 54420-54429) para no chocar con otros stacks de Supabase en la misma máquina: API 54421, DB 54422, Studio 54423.
- Studio local: http://127.0.0.1:54423.
- **Cuentas de prueba** (solo locales): `admin-local@inglobal.test` y `operador-local@inglobal.test`, contraseña `Local-Test-1234`.
  Se crean con `must_change_password = false` (si no, la API `/api/*` responde 403).
- **Seed** (`supabase/seed.sql`): 9 grúas, 6 empresas (4 frecuentes y 2 particulares), 10 operarios (2 ex operarios) y 43 eventos con
  fechas relativas al día de hoy en Córdoba. Incluye un día con 9 servicios, servicios de 30 min seguidos, turnos que cruzan
  medianoche, eventos multi-día y uno sin `hora_fin`. Todo lo ficticio lleva el prefijo `ZZ-PRUEBA`.
- TV: iniciar sesión en el sitio local y abrir `/agenda-tv`.
- App móvil: ver la sección "Entorno local" de `inglobal-agenda-app/AGENTS.md`.

## Pendiente de definir
- Proyecto Supabase de homologación (URL y claves) y su sitio en Vercel.
- Mapeo de la branch `test` en Vercel (Preview) y de `dev`/`test` en EAS (`preview`).
- Cargar migraciones en homologación con `supabase db push` contra ese proyecto (no con seed).
