'use client'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import ContactForm from './ContactForm'

function ContactFormWithParams() {
  const searchParams = useSearchParams()
  const defaultService = searchParams.get('servicio') ?? undefined
  return <ContactForm defaultService={defaultService} />
}

export default function ContactFormWrapper() {
  return (
    <Suspense fallback={<ContactForm />}>
      <ContactFormWithParams />
    </Suspense>
  )
}
