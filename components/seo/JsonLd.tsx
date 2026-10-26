interface JsonLdProps {
  data: Record<string, unknown>
}

/** Componente genérico de structured data — solo serializa y emite el <script> ld+json. */
export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      // Escapa "<": un título/extracto cargado desde el dashboard con "</script>" cerraría el tag e inyectaría HTML.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  )
}
