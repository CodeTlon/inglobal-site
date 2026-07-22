import Picture from '@/components/Picture'

export default function DashboardAuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    /* Cubre la Navbar/Footer del layout raíz con z-index alto */
    <div className="fixed inset-0 z-[100] lg:grid lg:grid-cols-2">
      {/* Imagen decorativa — solo desktop, 50vw x 100vh */}
      <div className="hidden lg:block relative h-screen">
        <Picture src="igb-5" alt="" fill priority sizes="50vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-zinc-950/20 to-transparent" />
      </div>

      <div className="flex items-center justify-center h-screen bg-zinc-50 p-6 overflow-y-auto">
        {children}
      </div>
    </div>
  )
}
