import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../../shared/context/AuthContext'
import { AuthInput } from '../components/AuthInput'
import { AuthButton } from '../components/AuthButton'

const PASSWORD_RULES = [
  { label: 'Mínimo 8 caracteres', test: (p) => p.length >= 8 },
  { label: 'Una letra mayúscula', test: (p) => /[A-Z]/.test(p) },
  { label: 'Un número', test: (p) => /[0-9]/.test(p) },
]

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' })
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
    if (!form.firstName.trim()) errs.firstName = 'El nombre es requerido'
    if (!form.lastName.trim()) errs.lastName = 'El apellido es requerido'
    if (!form.email) errs.email = 'El correo es requerido'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Correo inválido'
    if (!form.password) errs.password = 'La contraseña es requerida'
    else if (PASSWORD_RULES.some(r => !r.test(form.password)))
      errs.password = 'La contraseña no cumple los requisitos'
    return errs
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) return setErrors(errs)

    setLoading(true)
    try {
      await register(form)
      navigate('/auth/check-email', { state: { email: form.email } })
    } catch (err) {
      setServerError(err.message ?? 'Error al crear la cuenta')
    } finally {
      setLoading(false)
    }
  }

  const passStrength = PASSWORD_RULES.filter(r => r.test(form.password)).length

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--fg)' }}>
          Crea tu cuenta
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--fg-muted)' }}>
          Empieza a controlar tus finanzas hoy
        </p>
      </div>

      {serverError && (
        <div className="rounded-xl px-4 py-3 text-sm border"
             style={{ background: 'var(--color-error-light)', borderColor: 'var(--color-error)', color: 'var(--color-error-dark)' }}>
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <div className="grid grid-cols-2 gap-3">
          <AuthInput
            label="Nombre"
            type="text"
            placeholder="Juan"
            icon={User}
            value={form.firstName}
            onChange={set('firstName')}
            error={errors.firstName}
            autoComplete="given-name"
          />
          <AuthInput
            label="Apellido"
            type="text"
            placeholder="Pérez"
            value={form.lastName}
            onChange={set('lastName')}
            error={errors.lastName}
            autoComplete="family-name"
          />
        </div>

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
          <label className="text-sm font-medium" style={{ color: 'var(--fg-muted)' }}>
            Contraseña
          </label>
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
              autoComplete="new-password"
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

          {/* Indicador de fortaleza */}
          {form.password && (
            <div className="flex flex-col gap-2 mt-1">
              <div className="flex gap-1">
                {PASSWORD_RULES.map((_, i) => (
                  <div key={i} className="h-1 flex-1 rounded-full transition-all duration-300"
                       style={{
                         background: i < passStrength
                           ? passStrength === 1 ? 'var(--color-error)'
                             : passStrength === 2 ? 'var(--color-warning)'
                             : 'var(--color-success)'
                           : 'var(--border)',
                       }} />
                ))}
              </div>
              <div className="flex flex-col gap-0.5">
                {PASSWORD_RULES.map((rule, i) => (
                  <span key={i} className="flex items-center gap-1.5 text-xs"
                        style={{ color: rule.test(form.password) ? 'var(--color-success)' : 'var(--fg-subtle)' }}>
                    <span>{rule.test(form.password) ? '✓' : '○'}</span>
                    {rule.label}
                  </span>
                ))}
              </div>
            </div>
          )}
          {errors.password && (
            <p className="text-xs" style={{ color: 'var(--color-error)' }}>{errors.password}</p>
          )}
        </div>

        <AuthButton type="submit" loading={loading}>
          Crear cuenta
        </AuthButton>
      </form>

      <p className="text-center text-sm" style={{ color: 'var(--fg-muted)' }}>
        ¿Ya tienes cuenta?{' '}
        <Link to="/auth/login"
              className="font-semibold hover:underline"
              style={{ color: 'var(--color-brand-500)' }}>
          Inicia sesión
        </Link>
      </p>
    </div>
  )
}
