export default function DashboardAuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    /* Cubre la Navbar/Footer del layout raíz con z-index alto */
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-50 p-6">
      {children}
    </div>
  )
}
