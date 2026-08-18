import Image from 'next/image'
import type { Cliente } from '@/lib/content'

const cardClass =
  'bg-white rounded-xl p-4 flex items-center justify-center h-20 w-[30%] sm:w-[20%] md:w-[13%] shrink-0 border border-slate-100 shadow-sm grayscale opacity-70'

function LogoCard({ cliente }: { cliente: Cliente }) {
  return (
    <div className={cardClass}>
      <Image
        src={cliente.logo}
        alt={`Logo ${cliente.name}`}
        width={140}
        height={60}
        sizes="(max-width: 640px) 30vw, (max-width: 1024px) 20vw, 13vw"
        quality={70}
        loading="lazy"
        className="object-contain h-full w-full max-h-8"
      />
    </div>
  )
}

// ponytail: animación 100% CSS (@keyframes clientes-marquee en globals.css) — sin librería,
// sin JS. Track duplicado x2 para que el loop sea invisible. Pausa en hover/focus vía CSS
// y respeta prefers-reduced-motion, mismo criterio que .hero-anim/.hero-bg-zoom.
export default function ClientesLogoMarquee({ clientes }: { clientes: Cliente[] }) {
  if (clientes.length === 0) return null

  return (
    <div className="clientes-marquee-mask overflow-hidden">
      <div className="clientes-marquee-track flex gap-6 w-max">
        {[...clientes, ...clientes].map((cliente, i) => (
          <LogoCard key={`${cliente.slug}-${i}`} cliente={cliente} />
        ))}
      </div>
    </div>
  )
}
