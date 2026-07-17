import Link from 'next/link'
import Image from 'next/image'

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6 py-24 bg-igb-surface">
      <div className="text-center max-w-md">
        <Image
          src="/images/logo.png"
          alt="Grúas InGlobal"
          width={140}
          height={41}
          className="h-10 w-auto mx-auto mb-8 object-contain"
        />
        <h1 className="font-headline text-2xl font-bold text-igb-on-surface mb-2">
          Página no encontrada
        </h1>
        <p className="text-igb-secondary mb-8">
          La página que buscás no existe o fue movida. Podés volver al inicio o contactarnos.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link href="/" className="btn-primary">
            Volver al inicio
          </Link>
          <Link href="/contacto" className="btn-outline">
            Contacto
          </Link>
        </div>
      </div>
    </div>
  )
}
