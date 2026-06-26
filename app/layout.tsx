import type { Metadata, Viewport } from 'next'
import { Manrope, Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ScrollReveal from '@/components/ScrollReveal'
import WhatsAppButton from '@/components/WhatsAppButton'
import { SITE_URL } from '@/lib/site'

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
}

const OG_DESCRIPTION =
  'Empresa líder en servicios de grúas, hidrogrúas y movimientos especiales pesados en Córdoba, Argentina.'

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
    // ponytail: reusa el hero ya optimizado. Si querés preview social a medida, un 1200x630 dedicado lo reemplaza.
    images: [{ url: '/images/opt/igb-3-lg.webp', width: 1920, height: 1440, alt: 'Grúas InGlobal en operación' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Grúas InGlobal S.R.L. | Servicios de Grúas en Córdoba',
    description: OG_DESCRIPTION,
    images: ['/images/opt/igb-3-lg.webp'],
  },
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
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
        <ScrollReveal />
        <Navbar />
        <main>{children}</main>
        <Footer />
        <WhatsAppButton />
      </body>
    </html>
  )
}
