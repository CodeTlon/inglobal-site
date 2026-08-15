import type { Metadata, Viewport } from 'next'
import { Manrope, Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ScrollReveal from '@/components/ScrollReveal'
import RegisterSW from '@/components/RegisterSW'
import OfflineBanner from '@/components/OfflineBanner'
import { SITE_URL } from '@/lib/site'
import { getSiteSettings } from '@/lib/content'

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  weight: ['300', '400', '500', '600'],
})

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
  return (
    <html lang="es" className={`${manrope.variable} ${inter.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
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
              email: 'info@gruasinglobal.com',
              openingHours: ['Mo-Fr 08:00-18:00', 'Sa 08:00-13:00'],
              priceRange: '$$',
              areaServed: 'Argentina',
            }),
          }}
        />
      </head>
      <body className="antialiased">
        <OfflineBanner />
        <RegisterSW />
        <ScrollReveal />
        <Navbar labels={navbarSettings} />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
