'use client'

import { useState, type ReactNode } from 'react'

// Selector arriba + un solo form visible abajo a la vez — en vez de tener
// todos los forms de la página apilados uno debajo del otro.
export default function ContentTabs({ tabs }: { tabs: { label: string; content: ReactNode }[] }) {
  const [active, setActive] = useState(0)
  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-8 border-b border-zinc-200 pb-6">
        {tabs.map((t, i) => (
          <button
            key={t.label}
            type="button"
            onClick={() => setActive(i)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              i === active ? 'bg-igb-navy text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tabs[active].content}
    </div>
  )
}
