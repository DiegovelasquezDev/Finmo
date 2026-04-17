import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Lock, Eye, EyeOff, CheckCircle, AlertTriangle } from 'lucide-react'
import { useAuth } from '../../shared/context/AuthContext'
import { AuthButton } from '../components/AuthButton'

const PASSWORD_RULES = [
  { label: 'Mínimo 8 caracteres', test: (p) => p.length >= 8 },
  { label: 'Una letra mayúscula', test: (p) => /[A-Z]/.test(p) },
  { label: 'Un número', test: (p) => /[0-9]/.test(p) },
]

export default function ResetPasswordPage() {
  const { resetPassword } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const token = params.get('token')

  const [form, setForm] = useState({ password: '', confirm: '' })
  const [showPass, setShowPass] = useState(false)
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!token) setServerError('Enlace inválido o expirado.')
  }, [token])

  function validate() {
    const errs = {}
    if (PASSWORD_RULES.some(r => !r.test(form.password)))
      errs.password = 'La contraseña no cumple los requisitos'
    if (form.password !== form.confirm)
      errs.confirm = 'Las contraseñas no coinciden'
    return errs
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) return setErrors(errs)

    setLoading(true)
    try {
      await resetPassword({ token, password: form.password })
      setSuccess(true)
      setTimeout(() => navigate('/auth/login', { replace: true }), 3000)
    } catch (err) {
      setServerError(err.message ?? 'El enlace es inválido o ha expirado.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="w-16 h-16 rounded-full flex items-center justify-center"
             style={{ background: 'var(--color-success-light)' }}>
          <CheckCircle size={32} style={{ color: 'var(--color-success)' }} />
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--fg)' }}>
            ¡Contraseña actualizada!
          </h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--fg-muted)' }}>
            Serás redirigido al inicio de sesión en unos segundos…
          </p>
        </div>
        <Link to="/auth/login" className="text-sm font-medium hover:underline"
              style={{ color: 'var(--color-brand-500)' }}>
          Ir ahora
        </Link>
      </div>
    )
  }

  if (!token) {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <AlertTriangle size={40} style={{ color: 'var(--color-warning)' }} />
        <h1 className="text-xl font-bold" style={{ color: 'var(--fg)' }}>Enlace inválido</h1>
        <p className="text-sm" style={{ color: 'var(--fg-muted)' }}>
          Este enlace no es válido o ha expirado. Solicita uno nuevo.
        </p>
        <Link to="/auth/forgot-password" className="text-sm font-semibold hover:underline"
              style={{ color: 'var(--color-brand-500)' }}>
          Solicitar nuevo enlace
        </Link>
      </div>
    )
  }

  const passStrength = PASSWORD_RULES.filter(r => r.test(form.password)).length

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--fg)' }}>
          Nueva contraseña
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--fg-muted)' }}>
          Elige una contraseña segura para tu cuenta.
        </p>
      </div>

      {serverError && (
        <div className="rounded-xl px-4 py-3 text-sm border"
             style={{ background: 'var(--color-error-light)', borderColor: 'var(--color-error)', color: 'var(--color-error-dark)' }}>
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        {/* Contraseña */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium" style={{ color: 'var(--fg-muted)' }}>
            Nueva contraseña
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
              onChange={(e) => { setForm(p => ({ ...p, password: e.target.value })); setErrors(p => ({ ...p, password: '' })) }}
              className="w-full rounded-xl pl-9 pr-10 py-2.5 text-sm outline-none transition-all duration-200 border focus:ring-2 focus:ring-brand-400/40"
              style={{ background: 'var(--surface)', borderColor: errors.password ? 'var(--color-error)' : 'var(--border)', color: 'var(--fg)' }}
            />
            <button type="button" onClick={() => setShowPass(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{ color: 'var(--fg-subtle)' }}>
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {form.password && (
            <div className="flex flex-col gap-1.5 mt-1">
              <div className="flex gap-1">
                {PASSWORD_RULES.map((_, i) => (
                  <div key={i} className="h-1 flex-1 rounded-full transition-all duration-300"
                       style={{ background: i < passStrength ? passStrength === 1 ? 'var(--color-error)' : passStrength === 2 ? 'var(--color-warning)' : 'var(--color-success)' : 'var(--border)' }} />
                ))}
              </div>
              {PASSWORD_RULES.map((rule, i) => (
                <span key={i} className="flex items-center gap-1.5 text-xs"
                      style={{ color: rule.test(form.password) ? 'var(--color-success)' : 'var(--fg-subtle)' }}>
                  <span>{rule.test(form.password) ? '✓' : '○'}</span> {rule.label}
                </span>
              ))}
            </div>
          )}
          {errors.password && <p className="text-xs" style={{ color: 'var(--color-error)' }}>{errors.password}</p>}
        </div>

        {/* Confirmar */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium" style={{ color: 'var(--fg-muted)' }}>
            Confirmar contraseña
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: 'var(--fg-subtle)' }}>
              <Lock size={16} />
            </span>
            <input
              type={showPass ? 'text' : 'password'}
              placeholder="••••••••"
              value={form.confirm}
              onChange={(e) => { setForm(p => ({ ...p, confirm: e.target.value })); setErrors(p => ({ ...p, confirm: '' })) }}
              className="w-full rounded-xl pl-9 py-2.5 text-sm outline-none transition-all duration-200 border focus:ring-2 focus:ring-brand-400/40"
              style={{ background: 'var(--surface)', borderColor: errors.confirm ? 'var(--color-error)' : 'var(--border)', color: 'var(--fg)' }}
            />
          </div>
          {errors.confirm && <p className="text-xs" style={{ color: 'var(--color-error)' }}>{errors.confirm}</p>}
        </div>

        <AuthButton type="submit" loading={loading}>
          Guardar nueva contraseña
        </AuthButton>
      </form>
    </div>
  )
}
