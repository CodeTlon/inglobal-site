import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Clientes',
  description: 'Empresas que confían en Grúas InGlobal S.R.L. para sus trabajos de elevación, montaje y transporte pesado en Argentina.',
}

const clients = [
  { name: 'Aguas Cordobesas', logo: '/images/logos/AGUASCORDOBESAS-logo.png' },
  { name: 'Armoy', logo: '/images/logos/ARMOY-logo.png' },
  { name: 'BBC', logo: '/images/logos/BBC-logo.png' },
  { name: 'Bunge', logo: '/images/logos/BUNGE-logo.png' },
  { name: 'Coca-Cola', logo: '/images/logos/COCACOLA-logo.png' },
  { name: 'Electro Ingeniería', logo: '/images/logos/ELECTROINGENIERIA-logo.png' },
  { name: 'ENCO', logo: '/images/logos/ENCO-logo.png' },
  { name: 'EPEC', logo: '/images/logos/EPEC-logo.png' },
  { name: 'GAMA', logo: '/images/logos/GAMA-logo.png' },
  { name: 'Grupo Edisur', logo: '/images/logos/GRUPOEDISUR-logo.png' },
  { name: 'Grupo Proaco', logo: '/images/logos/GRUPOPROACO-logo.png' },
  { name: 'Habika', logo: '/images/logos/HABIKA-logo.png' },
  { name: 'HASA', logo: '/images/logos/HASA-logo.png' },
  { name: 'Holcim', logo: '/images/logos/HOLCIM-logo.png' },
  { name: 'Horpas', logo: '/images/logos/HORPAS-logo.png' },
  { name: 'Infinito Open', logo: '/images/logos/INFINITO-logo.png' },
  { name: 'Ingenia', logo: '/images/logos/INGENIA-logo.png' },
  { name: 'Ivecor', logo: '/images/logos/IVECOR-logo.png' },
  { name: 'Lucy', logo: '/images/logos/LUCY-logo.png' },
  { name: 'Porta', logo: '/images/logos/PORTA-logo.png' },
  { name: 'Quimex', logo: '/images/logos/QUIMEX-logo.png' },
  { name: 'Roggio', logo: '/images/logos/ROGGIO-logo.png' },
  { name: 'Siglo 21', logo: '/images/logos/SIGLO21-logo.png' },
  { name: 'Sullair', logo: '/images/logos/SULLAIR-logo.png' },
  { name: 'Tecsma', logo: '/images/logos/TECSMA-logo.png' },
]

export default function ClientesPage() {
  return (
    <>
      {/* Header */}
      <section className="pt-32 pb-16 bg-igb-surface-low">
        <div className="container-igb">
          <span className="label-tag">Confían en nosotros</span>
          <h1 className="heading-display mb-4">Nuestros Clientes</h1>
          <p className="text-body-lg max-w-2xl">
            Empresas líderes de Argentina que nos eligen por nuestro compromiso, responsabilidad y resultados. Su confianza es nuestro mayor aval.
          </p>
        </div>
      </section>

      {/* Logo grid */}
      <section className="section-pad bg-igb-surface">
        <div className="container-igb">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {clients.map((client) => (
              <div
                key={client.name}
                className="bg-white rounded-xl p-6 flex items-center justify-center shadow-igb grayscale opacity-70 hover:grayscale-0 hover:opacity-100 hover:-translate-y-1 transition-all duration-300 aspect-[3/2]"
              >
                <Image
                  src={client.logo}
                  alt={`Logo ${client.name}`}
                  width={140}
                  height={70}
                  sizes="(max-width: 640px) 45vw, (max-width: 1024px) 22vw, 18vw"
                  className="object-contain max-h-12 w-auto"
                />
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <p className="text-igb-secondary text-sm font-medium mb-6">
              {clients.length} empresas que ya eligieron Grúas InGlobal
            </p>
          </div>
        </div>
      </section>

      {/* Testimonial-like section */}
      <section className="section-pad bg-slate-900">
        <div className="container-igb text-center">
          <p className="text-igb-yellow text-xs font-bold tracking-widest uppercase mb-6">
            Por qué nos eligen
          </p>
          <h2 className="text-3xl md:text-4xl font-headline font-extrabold text-white tracking-tight mb-6">
            &ldquo;La cordialidad y las buenas costumbres<br className="hidden md:block" /> son los pilares de nuestra cultura&rdquo;
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-10">
            Somos una PyME con una gran fortaleza humana donde construimos relaciones comerciales excelentes y duraderas.
          </p>
          <Link href="/contacto" className="btn-primary mx-auto">
            Trabajar con nosotros
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </>
  )
}
