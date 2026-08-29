import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getSiteSettings } from '@/lib/content'
import PageHeader from '@/components/dashboard/PageHeader'
import ContentTabs from '@/components/dashboard/ContentTabs'
import NavbarForm from './NavbarForm'
import FooterForm from '../footer/FooterForm'
import FooterExtraForm from '../footer-extra/FooterExtraForm'

export default async function NavbarFooterContentPage() {
  const [navbar, footer, footerExtra] = await Promise.all([
    getSiteSettings('navbar'),
    getSiteSettings('footer'),
    getSiteSettings('footer_extra'),
  ])
  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 transition-colors">
          <ArrowLeft size={14} /> Volver al panel
        </Link>
      </div>
      <PageHeader
        title="Navbar y footer"
        description="Se ve en todo el sitio: menú de navegación, footer principal y textos extra del footer."
      />
      <ContentTabs
        tabs={[
          { label: 'Menú de navegación', content: <NavbarForm settings={navbar} /> },
          { label: 'Footer', content: <FooterForm settings={footer} /> },
          { label: 'Footer (textos extra)', content: <FooterExtraForm settings={footerExtra} /> },
        ]}
      />
    </div>
  )
}
