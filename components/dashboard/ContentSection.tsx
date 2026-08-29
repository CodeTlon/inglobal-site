// Bloque con título dentro de una página de Contenido que junta varios
// forms (Inicio, Páginas, etc.) — separador simple, nada de acordeón:
// el pedido fue "una página entera, adentro edito todo", no otro nivel
// de navegación escondida.
export default function ContentSection({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-zinc-200 pt-6 first:border-t-0 first:pt-0 first:mt-0 mt-8">
      <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wide mb-4">{titulo}</h2>
      {children}
    </section>
  )
}
