import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../shared/context/AuthContext'
import { api } from '../shared/lib/api'
import Step1Personal from './steps/Step1Personal'
import Step2Income from './steps/Step2Income'
import Step3FixedExpenses from './steps/Step3FixedExpenses'
import Step4Behavior from './steps/Step4Behavior'

const STEPS = [
  { number: 1, label: 'Perfil',    description: 'Cuéntanos sobre ti' },
  { number: 2, label: 'Ingresos',  description: 'Tus fuentes de ingreso' },
  { number: 3, label: 'Gastos',    description: 'Gastos fijos mensuales' },
  { number: 4, label: 'Metas',     description: 'Comportamiento y objetivos' },
]

function StepIndicator({ current }) {
  return (
    <div className="flex items-center gap-0">
      {STEPS.map((s, i) => (
        <div key={s.number} className="flex items-center">
          <div className="flex flex-col items-center">
            <div className={[
              'w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300',
              current === s.number
                ? 'bg-[var(--color-brand-500)] text-white shadow-[var(--shadow-brand)] scale-110'
                : current > s.number
                ? 'bg-[var(--color-success)] text-white'
                : 'bg-[var(--surface-raised)] text-[var(--fg-subtle)] border border-[var(--border)]',
            ].join(' ')}>
              {current > s.number ? '✓' : s.number}
            </div>
            <span className={`text-[10px] mt-1 font-medium hidden sm:block ${current === s.number ? 'text-[var(--color-brand-500)]' : 'text-[var(--fg-subtle)]'}`}>
              {s.label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`h-0.5 w-12 sm:w-20 mx-1 transition-all duration-500 ${current > s.number ? 'bg-[var(--color-success)]' : 'bg-[var(--border)]'}`} />
          )}
        </div>
      ))}
    </div>
  )
}

export default function OnboardingPage() {
  const { user, updateUser } = useAuth()
  const navigate = useNavigate()

  // Retoma desde el paso donde quedó si ya había avanzado
  const [currentStep, setCurrentStep] = useState(
    user?.onboardingStep >= 1 && user?.onboardingStep < 5
      ? user.onboardingStep + 1
      : 1
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function submitStep(stepNum, data) {
    setLoading(true)
    setError('')
    try {
      const { data: result } = await api.post(`/onboarding/step/${stepNum}`, data)
      updateUser({ onboardingStep: result.onboardingStep })

      if (stepNum === 4) {
        // Completado → ir al dashboard
        navigate('/app', { replace: true })
      } else {
        setCurrentStep(stepNum + 1)
      }
    } catch (err) {
      setError(err.message ?? 'Error al guardar. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  async function handleSkip() {
    setLoading(true)
    try {
      await api.post('/onboarding/skip')
      updateUser({ onboardingStep: 5 })
      navigate('/app', { replace: true })
    } catch {
      navigate('/app', { replace: true })
    }
  }

  const stepProps = { loading, error, onSubmit: submitStep }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-base)' }}>

      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b"
              style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
               style={{ background: 'var(--color-brand-500)' }}>
            <span className="text-white font-bold text-sm">F</span>
          </div>
          <span className="font-bold text-base" style={{ color: 'var(--fg)' }}>Finmo</span>
        </div>
        <button onClick={handleSkip} disabled={loading}
                className="text-xs font-medium hover:underline disabled:opacity-50"
                style={{ color: 'var(--fg-subtle)' }}>
          Omitir por ahora →
        </button>
      </header>

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col items-center justify-start px-4 py-8 sm:py-12">
        <div className="w-full max-w-xl flex flex-col gap-8">

          {/* Bienvenida — solo en paso 1 */}
          {currentStep === 1 && (
            <div className="text-center">
              <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--fg)' }}>
                ¡Hola, {user?.firstName}! 👋
              </h1>
              <p className="mt-2 text-sm sm:text-base" style={{ color: 'var(--fg-muted)' }}>
                Vamos a configurar tu perfil financiero. Solo toma 3 minutos y nos ayuda a darte mejores análisis y alertas.
              </p>
            </div>
          )}

          {/* Indicador de pasos */}
          <div className="flex justify-center">
            <StepIndicator current={currentStep} />
          </div>

          {/* Tarjeta del paso */}
          <div className="rounded-2xl p-6 sm:p-8"
               style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-widest mb-1"
                 style={{ color: 'var(--color-brand-500)' }}>
                Paso {currentStep} de {STEPS.length}
              </p>
              <h2 className="text-lg font-bold" style={{ color: 'var(--fg)' }}>
                {STEPS[currentStep - 1].description}
              </h2>
            </div>

            {error && (
              <div className="mb-4 rounded-xl px-4 py-3 text-sm border"
                   style={{ background: 'var(--color-error-light)', borderColor: 'var(--color-error)', color: 'var(--color-error-dark)' }}>
                {error}
              </div>
            )}

            {currentStep === 1 && <Step1Personal {...stepProps} />}
            {currentStep === 2 && <Step2Income   {...stepProps} />}
            {currentStep === 3 && <Step3FixedExpenses {...stepProps} />}
            {currentStep === 4 && <Step4Behavior {...stepProps} />}
          </div>

          <p className="text-center text-xs" style={{ color: 'var(--fg-subtle)' }}>
            Puedes actualizar estos datos en cualquier momento desde Configuración.
          </p>
        </div>
      </div>
    </div>
  )
}
