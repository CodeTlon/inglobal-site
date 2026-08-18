import Image from 'next/image'
import type { Cliente } from '@/lib/content'

// Ancho fijo en px, no %: el track es w-max (shrink-to-fit), y un % contra un
// contenedor de tamaño indefinido no resuelve — el browser cae a "auto" y cada
// card termina midiendo lo que mide el logo (bug real, entraba solo una).
const cardClass =
  'bg-white rounded-xl p-4 flex items-center justify-center h-20 w-32 sm:w-36 shrink-0 border border-slate-100 shadow-sm grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all duration-300'

function LogoCard({ cliente }: { cliente: Cliente }) {
  return (
    <div className={cardClass}>
      <Image
        src={cliente.logo}
        alt={`Logo ${cliente.name}`}
        width={140}
        height={60}
        sizes="144px"
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
