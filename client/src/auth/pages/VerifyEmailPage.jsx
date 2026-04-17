import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CheckCircle, AlertTriangle, Loader } from 'lucide-react'
import { useAuth } from '../../shared/context/AuthContext'

export default function VerifyEmailPage() {
  const { verifyEmail } = useAuth()
  const [params] = useSearchParams()
  const token = params.get('token')

  const [status, setStatus] = useState('loading') // 'loading' | 'success' | 'error'
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('No se encontró el token de verificación.')
      return
    }

    verifyEmail(token)
      .then(() => setStatus('success'))
      .catch((err) => {
        setStatus('error')
        setMessage(err.message ?? 'El enlace es inválido o ha expirado.')
      })
  }, [token, verifyEmail])

  return (
    <div className="flex flex-col items-center gap-6 text-center">
      {status === 'loading' && (
        <>
          <Loader size={40} className="animate-spin" style={{ color: 'var(--color-brand-500)' }} />
          <p className="text-sm" style={{ color: 'var(--fg-muted)' }}>Verificando tu cuenta…</p>
        </>
      )}

      {status === 'success' && (
        <>
          <div className="w-16 h-16 rounded-full flex items-center justify-center"
               style={{ background: 'var(--color-success-light)' }}>
            <CheckCircle size={32} style={{ color: 'var(--color-success)' }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--fg)' }}>
              ¡Cuenta verificada!
            </h1>
            <p className="mt-2 text-sm" style={{ color: 'var(--fg-muted)' }}>
              Tu correo ha sido verificado correctamente. Ya puedes iniciar sesión.
            </p>
          </div>
          <Link to="/auth/login"
                className="w-full rounded-xl py-2.5 text-sm font-semibold text-center text-white transition-all bg-brand-500 hover:bg-brand-600"
                style={{ background: 'var(--color-brand-500)' }}>
            Iniciar sesión
          </Link>
        </>
      )}

      {status === 'error' && (
        <>
          <div className="w-16 h-16 rounded-full flex items-center justify-center"
               style={{ background: 'var(--color-warning-light)' }}>
            <AlertTriangle size={32} style={{ color: 'var(--color-warning)' }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--fg)' }}>
              Verificación fallida
            </h1>
            <p className="mt-2 text-sm" style={{ color: 'var(--fg-muted)' }}>
              {message || 'El enlace es inválido o ya fue usado.'}
            </p>
          </div>
          <Link to="/auth/login" className="text-sm font-medium hover:underline"
                style={{ color: 'var(--color-brand-500)' }}>
            Volver al inicio de sesión
          </Link>
        </>
      )}
    </div>
  )
}
