import Image from 'next/image'
import { getSessionUser } from '@/lib/session'
import CambiarPasswordForm from './CambiarPasswordForm'

export default async function CambiarPasswordPage() {
  const user = await getSessionUser()
  const forced = user?.mustChangePassword === true

  return (
    <div className="w-full max-w-sm">
      <div className="flex justify-center mb-8">
        <Image
          src="/images/logo.webp"
          alt="Grúas InGlobal S.R.L."
          width={160}
          height={50}
          className="h-12 w-auto object-contain"
          sizes="160px"
        />
      </div>
      <CambiarPasswordForm forced={forced} />
    </div>
  )
}
