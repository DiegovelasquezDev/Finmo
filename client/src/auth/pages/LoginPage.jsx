import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../../shared/context/AuthContext'
import { AuthInput } from '../components/AuthInput'
import { AuthButton } from '../components/AuthButton'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from ?? '/app'

  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)

  function set(field) {
    return (e) => {
      setForm(prev => ({ ...prev, [field]: e.target.value }))
      if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }))
      setServerError('')
    }
  }

  function validate() {
    const errs = {}
    if (!form.email) errs.email = 'El correo es requerido'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Correo inválido'
    if (!form.password) errs.password = 'La contraseña es requerida'
    return errs
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) return setErrors(errs)

    setLoading(true)
    try {
      await login(form)
      navigate(from, { replace: true })
    } catch (err) {
      setServerError(err.message ?? 'Credenciales incorrectas')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--fg)' }}>
          Bienvenido de nuevo
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--fg-muted)' }}>
          Ingresa a tu cuenta de Finmo
        </p>
      </div>

      {serverError && (
        <div className="rounded-xl px-4 py-3 text-sm border"
             style={{ background: 'var(--color-error-light)', borderColor: 'var(--color-error)', color: 'var(--color-error-dark)' }}>
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <AuthInput
          label="Correo electrónico"
          type="email"
          placeholder="correo@ejemplo.com"
          icon={Mail}
          value={form.email}
          onChange={set('email')}
          error={errors.email}
          autoComplete="email"
        />

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium" style={{ color: 'var(--fg-muted)' }}>
              Contraseña
            </label>
            <Link
              to="/auth/forgot-password"
              className="text-xs font-medium transition-colors hover:underline"
              style={{ color: 'var(--color-brand-500)' }}
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: 'var(--fg-subtle)' }}>
              <Lock size={16} />
            </span>
            <input
              type={showPass ? 'text' : 'password'}
              placeholder="••••••••"
              value={form.password}
              onChange={set('password')}
              autoComplete="current-password"
              className={[
                'w-full rounded-xl pl-9 pr-10 py-2.5 text-sm outline-none transition-all duration-200 border',
                errors.password
                  ? 'border-error bg-error-light/20 focus:ring-2 focus:ring-error/30'
                  : 'focus:ring-2 focus:ring-brand-400/40',
              ].join(' ')}
              style={{
                background: 'var(--surface)',
                borderColor: errors.password ? 'var(--color-error)' : 'var(--border)',
                color: 'var(--fg)',
              }}
            />
            <button
              type="button"
              onClick={() => setShowPass(p => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
              style={{ color: 'var(--fg-subtle)' }}
            >
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs" style={{ color: 'var(--color-error)' }}>{errors.password}</p>
          )}
        </div>

        <AuthButton type="submit" loading={loading}>
          Iniciar sesión
        </AuthButton>
      </form>

      <p className="text-center text-sm" style={{ color: 'var(--fg-muted)' }}>
        ¿No tienes cuenta?{' '}
        <Link
          to="/auth/register"
          className="font-semibold hover:underline"
          style={{ color: 'var(--color-brand-500)' }}
        >
          Regístrate gratis
        </Link>
      </p>
    </div>
  )
}
