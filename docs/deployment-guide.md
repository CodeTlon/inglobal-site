# Deployment Guide — Grúas InGlobal S.R.L.

## Estado actual (verificado 2026-08-05)

| Servicio | Plataforma | URL real |
|---|---|---|
| Frontend + API + Agenda | Vercel | **https://inglobal-site-theta.vercel.app** (alias de producción) |
| `gruasinglobal.com` | — | Apunta a **otro sitio** (marketing, GoDaddy Website Builder / `cdn-website.com`), NO a este proyecto. El PASO 4 de esta guía (dominio personalizado) nunca se completó. |
| Base de datos | Supabase | mismo proyecto que usa la mobile app (`inglobal-agenda-app`) |
| Email | Resend | resend.com |

**✅ La integración Git↔Vercel SÍ está conectada — auto-deploy activo en push a `main`.** Confirmado el 2026-09-18 contra la API de Vercel (`GET /v9/projects/<id>` → `link.type: "github"`, `link.repo: "inglobal-site"`, `link.productionBranch: "main"`), con `link.createdAt` igual a la fecha de creación del proyecto (2026-06-16) — es decir, la conexión existe **desde el día 1**, no es algo que se haya activado después. Corroborado además con un caso real: el commit `dc3f9a0` (2026-09-17 21:51 ARG) generó un deployment de Production creado por `vercel[bot]` doce minutos después, sin que nadie corriera `vercel --prod` a mano.

**Nota de discrepancia (agregada 2026-09-17/18):** este archivo decía hasta acá que no había integración Git↔Vercel y que el deploy era manual. Esa afirmación era incorrecta — no se sabe si lo fue desde que se escribió este doc o si alguien conectó el repo después sin actualizarlo, pero la evidencia de la API dice que la conexión es tan vieja como el proyecto. Ver `.ai/context/KNOWN_ISSUES.md` para el hallazgo completo (impacto de proceso: cualquier push a `main` deploya solo a producción, sin gate de revisión manual).

---

## PASO 1: Supabase

### 1.1 Crear proyecto
1. Ir a [supabase.com](https://supabase.com) → New Project
2. Nombre: `inglobal-site`
3. Región: South America (São Paulo) — más cercano a Argentina
4. Guardar la contraseña de la DB

### 1.2 Crear la tabla contact_leads
1. Ir a **SQL Editor**
2. Pegar el contenido de `supabase/migrations/001_contact_leads.sql`
3. Hacer clic en **Run**

### 1.3 Obtener credenciales
- Ir a **Settings → API**
- Copiar: `Project URL`, `anon public key`, `service_role key`

---

## PASO 2: Resend

### 2.1 Configurar dominio
1. Ir a [resend.com](https://resend.com) → Domains → Add Domain
2. Agregar `gruasinglobal.com`
3. Agregar los registros DNS que Resend indica
4. Esperar verificación (puede tomar hasta 48h)

### 2.2 Obtener API key
- Settings → API Keys → Create API Key
- Guardar como `RESEND_API_KEY`

### 2.3 Dirección from
- Una vez el dominio verificado: `noreply@gruasinglobal.com`
- Mientras tanto: `onboarding@resend.dev` (solo para testing)

---

## PASO 3: Vercel

### 3.1 Importar repositorio
1. Ir a [vercel.com/new](https://vercel.com/new)
2. Importar repo `codetlon/inglobal-site`
3. Framework Preset: **Next.js** (autodetectado)
4. Root Directory: `/` (por defecto)

### 3.2 Variables de entorno
En Vercel → Settings → Environment Variables, agregar:

```
NEXT_PUBLIC_SUPABASE_URL       = [Project URL de Supabase]
NEXT_PUBLIC_SUPABASE_ANON_KEY  = [anon public key]
SUPABASE_SERVICE_ROLE_KEY      = [service_role key]
RESEND_API_KEY                 = [API key de Resend]
RESEND_FROM_NAME               = Grúas InGlobal
RESEND_FROM_EMAIL              = noreply@gruasinglobal.com
COMPANY_EMAIL                  = cotizacionesinglobalsrl@gmail.com
```

### 3.3 Deploy
1. Hacer clic en **Deploy**
2. Vercel hará el build automáticamente
3. URL real de producción (alias fijo del proyecto): `inglobal-site-theta.vercel.app` — no `inglobal-site.vercel.app`, ese es otro proyecto/deployment viejo que no tiene el código actual.

---

## PASO 4: Dominio personalizado

### 4.1 En Vercel
1. Project → Settings → Domains
2. Agregar `gruasinglobal.com` y `www.gruasinglobal.com`
3. Vercel te dará los registros DNS a configurar

### 4.2 En el registrador del dominio
Agregar los registros DNS que Vercel indica:
- `A` record apuntando a la IP de Vercel
- `CNAME` para `www` apuntando a `cname.vercel-dns.com`

### 4.3 Verificar HTTPS
- Vercel configura SSL automáticamente (Let's Encrypt)
- Esperar ~10 minutos para que propague

---

## PASO 5: Verificación post-deploy

### Checklist final
- [ ] Sitio accesible en `gruasinglobal.com`
- [ ] HTTPS activo (candado verde)
- [ ] Formulario de contacto envía email
- [ ] Email llega a `cotizacionesinglobalsrl@gmail.com`
- [ ] Lead guardado en Supabase → Table `contact_leads`
- [ ] WhatsApp button abre chat correcto
- [ ] Teléfono `0351 345-4244` funciona en mobile
- [ ] Redirects .php funcionan (ej: `/contacto.php` → `/contacto`)
- [ ] Google Search Console: verificar dominio y enviar sitemap
- [ ] Sitemap en `/sitemap.xml` (generado por Next.js automáticamente)

---

## Actualizaciones futuras

**El auto-deploy en push a `main` está activo** (ver "Estado actual" arriba) — `git push origin main` alcanza, Vercel builda y deploya solo a Production en unos minutos. No hace falta ningún paso manual en el flujo normal.

El comando manual queda documentado solo como **fallback** para el caso en que el auto-deploy falle o haya que forzar un redeploy sin un commit nuevo (ej. reintentar tras un error de build, o revertir a un estado sin generar un commit de revert):

```bash
npx vercel --prod            # fallback: fuerza un deploy a Production sin depender del auto-deploy
```

`vercel` ya queda autenticado y linkeado al proyecto (`.vercel/project.json`) después del primer `vercel link` — no hace falta repetirlo salvo en una máquina nueva.

### Route cache — cuidado con páginas sin `force-dynamic`
Una página sin `export const dynamic = 'force-dynamic'` puede quedar servida desde el Full Route Cache de Next/Vercel **incluso después de un deploy nuevo** — pasó con `/agenda-tv/pair`, el HTML viejo se siguió sirviendo varios minutos post-deploy hasta que se le agregó `force-dynamic`. Cualquier página que dependa de datos que cambian en tiempo real (o de código que se está iterando activamente) necesita ese flag explícito.

## Agenda de Grúas (mobile + TV)

El módulo de agenda (`/agenda-tv`, `/dashboard/agenda`, `/api/agenda/*`, `/api/tv-pair/*`) es el backend de la app mobile `inglobal-agenda-app` (Expo/React Native, repo separado). Esa app tiene su propia documentación de deploy (EAS Build/Update, bundle IDs, roadmap a las tiendas) en `docs/deployment.md` de ese repo — no duplicado acá.
