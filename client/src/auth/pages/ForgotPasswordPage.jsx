import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import { useAuth } from '../../shared/context/AuthContext'
import { AuthInput } from '../components/AuthInput'
import { AuthButton } from '../components/AuthButton'

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email) return setError('El correo es requerido')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError('Correo inválido')

    setLoading(true)
    try {
      await forgotPassword(email)
      setSent(true)
    } catch {
      setSent(true) // No revelar si existe o no
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="w-16 h-16 rounded-full flex items-center justify-center"
             style={{ background: 'var(--color-success-light)' }}>
          <CheckCircle size={32} style={{ color: 'var(--color-success)' }} />
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--fg)' }}>
            Revisa tu correo
          </h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--fg-muted)' }}>
            Si <strong>{email}</strong> está registrado, recibirás un enlace para restablecer tu contraseña en los próximos minutos.
          </p>
        </div>
        <p className="text-xs" style={{ color: 'var(--fg-subtle)' }}>
          ¿No lo recibes? Revisa tu carpeta de spam.
        </p>
        <Link to="/auth/login"
              className="flex items-center gap-2 text-sm font-medium hover:underline"
              style={{ color: 'var(--color-brand-500)' }}>
          <ArrowLeft size={16} /> Volver al inicio de sesión
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link to="/auth/login"
              className="flex items-center gap-1.5 text-sm mb-4 hover:underline"
              style={{ color: 'var(--fg-muted)' }}>
          <ArrowLeft size={15} /> Volver
        </Link>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--fg)' }}>
          Recuperar contraseña
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--fg-muted)' }}>
          Ingresa tu correo y te enviaremos un enlace para restablecerla.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <AuthInput
          label="Correo electrónico"
          type="email"
          placeholder="correo@ejemplo.com"
          icon={Mail}
          value={email}
          onChange={(e) => { setEmail(e.target.value); setError('') }}
          error={error}
          autoComplete="email"
        />
        <AuthButton type="submit" loading={loading}>
          Enviar enlace
        </AuthButton>
      </form>
    </div>
  )
}
