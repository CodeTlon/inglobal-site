import type { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ScrollReveal from '@/components/ScrollReveal'
import RegisterSW from '@/components/RegisterSW'
import OfflineBanner from '@/components/OfflineBanner'
import GoogleAnalytics from '@/components/GoogleAnalytics'
import CookieConsent from '@/components/CookieConsent'
import BackToTop from '@/components/BackToTop'
import StickyMobileCTA from '@/components/StickyMobileCTA'

// El contenido sale de la base propia y el contenedor se construye SIN base (Coolify):
// si las páginas se prerenderizaran en el build quedarían con los datos de fallback hasta
// la primera edición del panel. Todo se renderiza por request (la base es local al servidor).
export const dynamic = 'force-dynamic'
import { JsonLd } from '@/components/seo/JsonLd'
import { SITE_URL } from '@/lib/site'
import { getSiteSettings } from '@/lib/content'

// Fuentes autoalojadas (app/fonts, subset latin): el build no depende de Google Fonts. Ver FONTS.md.
const manrope = localFont({ src: './fonts/manrope-latin-wght-normal.woff2', weight: '200 800', variable: '--font-manrope', display: 'swap' })

const inter = localFont({ src: './fonts/inter-latin-wght-normal.woff2', weight: '100 900', variable: '--font-inter', display: 'swap' })

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#f5d100',
}

const OG_DESCRIPTION = 'Empresa líder en servicios de grúas, hidrogrúas y movimientos especiales pesados en Córdoba, Argentina.'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Grúas InGlobal S.R.L. | Servicios de Grúas en Córdoba',
    template: '%s | Grúas InGlobal S.R.L.',
  },
  description: 'Empresa líder en servicios de grúas, hidrogrúas y movimientos especiales pesados en Córdoba, Argentina. Más de 40 años de experiencia.',
  keywords: ['grúas Córdoba', 'alquiler grúas', 'hidrogrúas', 'movimientos pesados', 'montajes industriales', 'grúas telescópicas', 'InGlobal'],
  authors: [{ name: 'CodeTlon' }],
  alternates: { canonical: '/' },
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    locale: 'es_AR',
    url: SITE_URL,
    siteName: 'Grúas InGlobal S.R.L.',
    title: 'Grúas InGlobal S.R.L. | Servicios de Grúas en Córdoba',
    description: OG_DESCRIPTION,
    images: [{ url: '/images/og-image.jpg', width: 1200, height: 630, alt: 'Grúas InGlobal en operación de montaje' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Grúas InGlobal S.R.L. | Servicios de Grúas en Córdoba',
    description: OG_DESCRIPTION,
    images: ['/images/og-image.jpg'],
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/icons/apple-touch-icon.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Agenda IGB',
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const navbarSettings = await getSiteSettings('navbar')
  const gaId = process.env.NEXT_PUBLIC_GA_ID
  return (
    <html lang="es" className={`${manrope.variable} ${inter.variable}`}>
      <head>
        <JsonLd
          data={{
            '@context': 'https://schema.org',
            '@type': 'LocalBusiness',
            name: 'Grúas InGlobal S.R.L.',
            description: 'Empresa líder en servicios de grúas, hidrogrúas y movimientos especiales pesados en Córdoba, Argentina. Más de 40 años de experiencia.',
            url: SITE_URL,
            image: `${SITE_URL}/images/logo.png`,
            address: {
              '@type': 'PostalAddress',
              streetAddress: 'Ana Riglos de Irigoyen S/N',
              addressLocality: 'Córdoba',
              addressCountry: 'AR',
            },
            telephone: '+5403513454244',
            email: 'cotizacionesinglobalsrl@gmail.com',
            openingHours: ['Mo-Fr 08:00-18:00', 'Sa 08:00-13:00'],
            priceRange: '$$',
            areaServed: 'Argentina',
          }}
        />
      </head>
      <body className="antialiased">
        {gaId && <GoogleAnalytics gaId={gaId} />}
        <OfflineBanner />
        <RegisterSW />
        <ScrollReveal />
        <Navbar labels={navbarSettings} />
        <main>{children}</main>
        <Footer />
        <BackToTop />
        <StickyMobileCTA />
        <CookieConsent />
      </body>
    </html>
  )
}
