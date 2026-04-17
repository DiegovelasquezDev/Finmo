import { Link, useLocation } from 'react-router-dom'
import { Mail, ArrowLeft } from 'lucide-react'

export default function CheckEmailPage() {
  const { state } = useLocation()
  const email = state?.email ?? 'tu correo'

  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <div className="w-16 h-16 rounded-full flex items-center justify-center"
           style={{ background: 'var(--color-brand-50)', border: '2px solid var(--color-brand-200)' }}>
        <Mail size={28} style={{ color: 'var(--color-brand-500)' }} />
      </div>

      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--fg)' }}>
          Revisa tu correo
        </h1>
        <p className="mt-2 text-sm" style={{ color: 'var(--fg-muted)' }}>
          Te enviamos un enlace de verificación a{' '}
          <strong style={{ color: 'var(--fg)' }}>{email}</strong>.
          Haz clic en él para activar tu cuenta.
        </p>
      </div>

      <div className="w-full rounded-xl p-4 text-sm text-left"
           style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}>
        <p className="font-medium mb-1" style={{ color: 'var(--fg)' }}>¿No lo recibes?</p>
        <ul className="list-disc list-inside space-y-1" style={{ color: 'var(--fg-muted)' }}>
          <li>Revisa tu carpeta de spam o correo no deseado</li>
          <li>El enlace expira en 24 horas</li>
          <li>Asegúrate de haber ingresado el correo correcto</li>
        </ul>
      </div>

      <Link to="/auth/login"
            className="flex items-center gap-1.5 text-sm font-medium hover:underline"
            style={{ color: 'var(--color-brand-500)' }}>
        <ArrowLeft size={15} /> Volver al inicio de sesión
      </Link>
    </div>
  )
}
