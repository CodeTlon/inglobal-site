# Grúas InGlobal S.R.L. — Sitio Web

Sitio web corporativo de **Grúas InGlobal S.R.L.**, empresa líder en servicios de grúas, hidrogrúas y montajes industriales en Córdoba, Argentina.

Generado por **CodeTlon FOS v2.2** — Refactor L7 (PHP → Next.js 14)

---

## Stack

| Tecnología | Versión |
|---|---|
| Next.js | 14.x (App Router) |
| TypeScript | 5.x |
| Tailwind CSS | 3.x |
| Supabase | 2.x |
| Resend | 4.x |
| Playwright | E2E tests |

## Estructura del proyecto

```
inglobal-site/
├── app/
│   ├── layout.tsx          # Layout global (Navbar + Footer + WhatsApp)
│   ├── page.tsx            # Home
│   ├── servicios/          # Flota de servicios
│   ├── montajes/           # Casos de estudio
│   ├── galeria/            # Galería de imágenes
│   ├── clientes/           # Logos de clientes
│   ├── contacto/           # Formulario de contacto
│   ├── aviso-legal/        # Textos legales
│   └── actions/contact.ts  # Server Action formulario
├── components/
│   ├── Navbar.tsx          # Nav glassmorphism + hamburguesa
│   ├── Footer.tsx          # Footer dark + CodeTlonBadge
│   ├── ContactForm.tsx     # Formulario (useFormState)
│   ├── ContactFormWrapper.tsx
│   └── WhatsAppButton.tsx  # Botón flotante WhatsApp
├── lib/
│   ├── supabase.ts         # Cliente Supabase con placeholders
│   └── validations/        # Schemas Zod
├── supabase/
│   └── migrations/         # SQL migrations
├── public/
│   └── images/             # Imágenes del cliente + logos
└── tests/e2e/              # Tests Playwright (25 tests)
```

## Desarrollo local

```bash
# 1. Instalar dependencias
npm install

# 2. Crear .env.local (copiar .env.example)
cp .env.example .env.local
# Completar las variables de Supabase y Resend

# 3. Correr en desarrollo
npm run dev

# 4. Ver en http://localhost:3000
```

## Scripts

```bash
npm run dev       # Desarrollo con hot reload
npm run build     # Build de producción
npm run start     # Servidor de producción
npm run lint      # ESLint
npx playwright test  # Tests E2E (requiere npm run build + npm run start corriendo)
```

## Páginas

| Ruta | Descripción |
|---|---|
| `/` | Home: Hero, About, Servicios, Gallery, Clientes, Mapa |
| `/servicios` | Detalle de flota: Grúas Telescópicas, Hidrogrúas, Movimientos, Carretones |
| `/montajes` | Casos de estudio de montajes industriales |
| `/galeria` | Galería masonry de operaciones |
| `/clientes` | Grid de 25 logos de clientes |
| `/contacto` | Formulario + info + mapa |
| `/aviso-legal` | Textos legales |

## Redirects SEO (301)

Las URLs del sitio PHP anterior redirigen automáticamente:
- `/contacto.php` → `/contacto`
- `/servicios.php` → `/servicios`
- `/galeria.php` → `/galeria`
- `/montajes.php` → `/montajes`
- `/clientes.php` → `/clientes`
- `/aviso-legal.php` → `/aviso-legal`
- `/index.php` → `/`

## Variables de entorno

Ver `.env.example` para la lista completa. Imprescindibles:
- `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `RESEND_API_KEY` + `RESEND_FROM_EMAIL`
- `COMPANY_EMAIL`
