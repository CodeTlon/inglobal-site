# Deployment Guide — Grúas InGlobal S.R.L.

## Resumen del deploy

| Servicio | Plataforma | URL |
|---|---|---|
| Frontend | Vercel | gruasinglobal.com (por configurar) |
| Base de datos | Supabase | supabase.com |
| Email | Resend | resend.com |

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
COMPANY_EMAIL                  = info@gruasinglobal.com
```

### 3.3 Deploy
1. Hacer clic en **Deploy**
2. Vercel hará el build automáticamente
3. URL temporal: `inglobal-site.vercel.app`

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
- [ ] Email llega a `info@gruasinglobal.com`
- [ ] Lead guardado en Supabase → Table `contact_leads`
- [ ] WhatsApp button abre chat correcto
- [ ] Teléfono `0351 345-4244` funciona en mobile
- [ ] Redirects .php funcionan (ej: `/contacto.php` → `/contacto`)
- [ ] Google Search Console: verificar dominio y enviar sitemap
- [ ] Sitemap en `/sitemap.xml` (generado por Next.js automáticamente)

---

## Actualizaciones futuras

Cualquier push a `main` triggerea un re-deploy automático en Vercel.

```bash
# Flujo estándar
git checkout dev
git checkout -b feature/nueva-funcionalidad
# ... hacer cambios ...
git push origin feature/nueva-funcionalidad
# → Crear PR a dev
# → Hacer merge dev → main para deploy a producción
```
