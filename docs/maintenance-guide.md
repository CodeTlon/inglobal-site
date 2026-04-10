# Maintenance Guide — Grúas InGlobal S.R.L.

## Tareas frecuentes

### Agregar un nuevo proyecto/montaje

Editar `app/montajes/page.tsx`:
```typescript
const montajes = [
  // ... existentes ...
  {
    title: 'Nuevo Proyecto',
    desc: 'Descripción del proyecto.',
    img: '/images/igb-X.webp',  // agregar imagen a public/images/
    tags: ['Tag1', 'Tag2'],
  },
]
```

### Agregar un nuevo cliente

Editar `app/clientes/page.tsx` y `app/page.tsx`:
```typescript
{ name: 'Nuevo Cliente', logo: '/images/logos/NUEVOCLIENTE-logo.png' }
```
Y copiar el logo a `public/images/logos/`.

### Cambiar datos de contacto

Buscar en el código con grep:
```bash
grep -r "03513454244\|info@gruasinglobal\|wa.me" app/ components/
```
Archivos a actualizar: `app/layout.tsx`, `components/Navbar.tsx`, `components/Footer.tsx`, `components/WhatsAppButton.tsx`, `app/contacto/page.tsx`

### Actualizar imágenes del hero/portada

Reemplazar archivo en `public/images/igb-3.webp` (hero de la home).
El nombre del archivo se puede cambiar editando `app/page.tsx`:
```typescript
src="/images/igb-3.webp"  // cambiar este path
```

## Agregar una nueva página

1. Crear carpeta en `app/nueva-pagina/`
2. Crear `page.tsx`:
```typescript
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Nueva Página',
  description: '...',
}

export default function NuevaPaginaPage() {
  return (
    <>
      <section className="pt-32 pb-16 bg-igb-surface-low">
        <div className="container-igb">
          <h1 className="heading-display">Nueva Página</h1>
        </div>
      </section>
      {/* resto del contenido */}
    </>
  )
}
```
3. Agregar el link en `components/Navbar.tsx` y `components/Footer.tsx`

## Ver leads del formulario

### En Supabase
1. Ir a [supabase.com](https://supabase.com) → tu proyecto
2. Table Editor → `contact_leads`
3. Ver todas las consultas recibidas

### Exportar a CSV
En Supabase → SQL Editor:
```sql
SELECT * FROM contact_leads ORDER BY created_at DESC;
```
Hacer clic en "Export" para descargar CSV.

## Actualizar dependencias

```bash
# Ver qué está desactualizado
npm outdated

# Actualizar Next.js (con cuidado)
npm install next@latest

# Verificar que todo sigue funcionando
npm run build
```

## Monitoreo de errores

### Vercel
- Ver logs en Vercel Dashboard → Deployments → el deploy activo → View Logs
- Para errores en producción: Vercel → Functions → ver invocaciones fallidas

### Resend
- Ver emails enviados en Resend Dashboard → Emails
- Ver bounces y errores de entrega

## Backup

El código está en GitHub: `github.com/CodeTlon/inglobal-site`

Los leads del formulario están en Supabase. Para hacer backup:
```sql
-- En Supabase SQL Editor
SELECT * FROM contact_leads ORDER BY created_at DESC;
-- Exportar como CSV
```

## Checklist mensual

- [ ] Revisar leads en Supabase (¿alguno sin responder?)
- [ ] Verificar que el formulario sigue enviando emails (test manual)
- [ ] Revisar logs de errores en Vercel
- [ ] `npm outdated` para ver actualizaciones disponibles
- [ ] Google Search Console: revisar errores de indexación
