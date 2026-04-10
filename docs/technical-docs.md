# Technical Documentation — Grúas InGlobal S.R.L.

## Arquitectura

### Renderizado
Todas las páginas son **Static Site Generation (SSG)** — pre-renderizadas en build time. No hay páginas dinámicas por ruta. El único componente dinámico es el formulario de contacto (Server Action).

### Flujo del formulario de contacto

```
Usuario llena form
       ↓
ContactForm.tsx (Client Component)
useFormState → sendContact Server Action
       ↓
lib/validations/contact.ts (Zod schema)
       ↓
app/actions/contact.ts
  1. createSupabaseServiceClient() → INSERT into contact_leads
  2. resend.emails.send() → Email HTML a info@gruasinglobal.com
       ↓
{ success: true } → Muestra mensaje de éxito
{ error: string } → Muestra mensaje de error
```

### Componentes clave

| Componente | Tipo | Descripción |
|---|---|---|
| `Navbar` | Client | Glassmorphism, hamburguesa en mobile, active states |
| `Footer` | Server | Links + contacto + CodeTlonBadge |
| `ContactForm` | Client | useFormState + useFormStatus (React 18) |
| `ContactFormWrapper` | Client | Wrapper con useSearchParams para preseleccionar servicio |
| `WhatsAppButton` | Server | Botón flotante fijo |
| `CodeTlonBadge` | Server | Badge de la fábrica en footer |

### Design System

**Colores (Tailwind custom tokens):**
```
igb-yellow:     #f5d100  (CTA, accents)
igb-yellow-dark: #6f5d00 (texto sobre amarillo)
igb-on-yellow:  #221b00  (texto encima de botón amarillo)
igb-secondary:  #575d78  (texto secundario)
igb-surface:    #f8f9fa  (fondo base)
igb-surface-low: #f3f4f5 (fondo secciones)
igb-on-surface: #191c1d  (texto principal)
```

**Tipografías:**
- Headlines: **Manrope** (font-headline) — 400/500/600/700/800
- Body: **Inter** (font-body) — 300/400/500/600

**Clases utilitarias personalizadas:**
```css
.section-pad      → py-24 lg:py-32
.container-igb    → max-w-7xl mx-auto px-6
.label-tag        → texto de label (uppercase, yellow-dark)
.heading-display  → h2 estándar de secciones
.heading-hero     → h1 del Hero
.btn-primary      → botón amarillo
.btn-outline      → botón outline navy
.card-igb         → card blanca con shadow y hover
```

### SEO

- `Metadata` API de Next.js en cada página
- `viewport` exportado separado de `metadata` (Bug 1 evitado)
- Schema.org `LocalBusiness` en `layout.tsx` (JSON-LD)
- Open Graph tags configurados
- Redirects 301 de URLs PHP en `next.config.mjs`

### Performance

- Imágenes: Next.js Image con AVIF/WebP (sharp instalado)
- Hero: imagen local `/images/igb-3.webp` con `priority` + `sizes="100vw"`
- Logos de clientes: grayscale CSS con hover a color (sin JS)
- Gallery bento: grayscale con hover (pure CSS transition)
- Fuentes: `next/font/google` con `display: 'swap'`
- `.browserslistrc` configurado para evitar polyfills legacy

### Seguridad

- Variables sensibles en `.env.local` (nunca hardcodeadas)
- Supabase RLS: solo `service_role` puede leer `contact_leads`
- Inserción pública habilitada solo para el formulario
- Server Actions: validación Zod antes de tocar la DB
- Sin SQL injection posible (Supabase JS client usa prepared statements)

## Testing

### E2E (Playwright)
- 25 tests en `tests/e2e/inglobal.spec.ts`
- Cobertura: todas las páginas, 3 viewports, formulario, SEO, redirects
- Config en `playwright.config.ts`

```bash
# Correr tests (requiere servidor en :3000)
npm run build && npm run start &
npx playwright test

# Ver reporte HTML
npx playwright show-report
```

## Dependencias principales

```json
{
  "next": "14.x",
  "react": "18.x",
  "@supabase/supabase-js": "2.x",
  "resend": "4.x",
  "zod": "3.x",
  "lucide-react": "latest",
  "sharp": "latest"
}
```
