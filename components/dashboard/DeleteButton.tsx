'use client'

import { useFormStatus } from 'react-dom'
import { Trash2, Loader2 } from 'lucide-react'

function Inner({ confirmMessage }: { confirmMessage: string }) {
  const { pending } = useFormStatus()

  function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
    if (!window.confirm(confirmMessage)) {
      e.preventDefault()
    }
  }

  return (
    <button
      type="submit"
      onClick={handleClick}
      disabled={pending}
      className="inline-flex items-center gap-2 bg-red-50 text-red-600 border border-red-200 px-4 py-2.5 rounded-md font-headline font-bold text-sm hover:bg-red-100 transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {pending ? (
        <Loader2 size={15} className="animate-spin" />
      ) : (
        <Trash2 size={15} />
      )}
      {pending ? 'Eliminando…' : 'Eliminar'}
    </button>
  )
}

export default function DeleteButton({
  confirmMessage = '¿Eliminar este registro? Esta acción no se puede deshacer.',
}: {
  confirmMessage?: string
}) {
  return <Inner confirmMessage={confirmMessage} />
}
