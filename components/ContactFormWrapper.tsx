'use client'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import ContactForm from './ContactForm'

function ContactFormWithParams({ services }: { services?: { slug: string; title: string }[] }) {
  const searchParams = useSearchParams()
  const defaultService = searchParams.get('servicio') ?? undefined
  return <ContactForm defaultService={defaultService} services={services} />
}

export default function ContactFormWrapper({ services }: { services?: { slug: string; title: string }[] }) {
  return (
    <Suspense fallback={<ContactForm services={services} />}>
      <ContactFormWithParams services={services} />
    </Suspense>
  )
}
