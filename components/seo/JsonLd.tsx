interface JsonLdProps {
  data: Record<string, unknown>
}

/** Componente genérico de structured data — solo serializa y emite el <script> ld+json. */
export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
