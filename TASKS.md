# Tasks — Grúas InGlobal S.R.L.
Generado por CodeTlon FOS v2.2 — 2026-04-10

## Setup
- [x] Repo GitHub codetlon/inglobal-site (private)
- [x] Rama main + dev pusheadas
- [ ] next.config.mjs con image optimization
- [ ] postcss.config.mjs
- [ ] .browserslistrc
- [ ] public/favicon.ico
- [ ] brand-config.json
- [ ] sharp instalado
- [ ] Dependencias backend: resend, react-hook-form, @hookform/resolvers, zod
- [ ] Dependencias: @supabase/supabase-js

## Imágenes
- [ ] igb-1 a igb-10.webp copiadas a public/images/
- [ ] logos de clientes copiados a public/images/logos/
- [ ] logo.png / logo.webp copiados

## Frontend (feature/IGB-frontend)
- [ ] layout.tsx (Navbar glassmorphism + Footer dark + WhatsApp + CodeTlonBadge)
- [ ] page.tsx — Home: Hero + Services + CTA Banner + Gallery Bento + Clients + Map
- [ ] /servicios/page.tsx — detalle de flota
- [ ] /montajes/page.tsx — casos de estudio
- [ ] /galeria/page.tsx — masonry grid
- [ ] /clientes/page.tsx — logo grid completo
- [ ] /contacto/page.tsx — formulario + info + mapa
- [ ] /aviso-legal/page.tsx — textos legales

## Backend (feature/IGB-backend)
- [ ] lib/supabase.ts con placeholders
- [ ] supabase/migrations/001_contact_leads.sql
- [ ] lib/validations/contact.ts (Zod)
- [ ] app/actions/contact.ts (Server Action)
- [ ] emails/contact.tsx (React Email template)
- [ ] .env.example

## Redirects SEO
- [ ] next.config.mjs con redirects .php → rutas limpias

## Testing (feature/IGB-testing)
- [ ] npx playwright install
- [ ] tests/e2e/inglobal.spec.ts — 3 viewports (375/768/1280)
- [ ] Lighthouse en producción

## Docs (feature/IGB-docs)
- [ ] README.md
- [ ] deployment-guide.md
- [ ] technical-docs.md
- [ ] maintenance-guide.md

## Entrega
- [ ] Merge dev → main
- [ ] tag v1.0.0-inglobal-site
- [ ] LEEME.txt
