import { useState } from 'react'
import { StepButton, FormRow, MoneyInput } from '../components/OnboardingUI'
import { fmtCurrency } from '../../shared/lib/format'

const EXPENSE_FIELDS = [
  { key: 'rentMortgage',   label: 'Arriendo / Hipoteca',           icon: '🏠', sub: 'Pago mensual de vivienda' },
  { key: 'utilities',      label: 'Servicios públicos',             icon: '💡', sub: 'Agua, luz, gas, internet' },
  { key: 'transportFixed', label: 'Transporte fijo',               icon: '🚌', sub: 'Bus, gasolina, parqueadero' },
  { key: 'insurances',     label: 'Seguros',                        icon: '🛡️', sub: 'Salud, vida, vehículo, etc.' },
  { key: 'subscriptions',  label: 'Suscripciones',                  icon: '📱', sub: 'Netflix, Spotify, gym, etc.' },
  { key: 'loanPayments',   label: 'Cuotas de créditos / Deudas',   icon: '💳', sub: 'Tarjetas, créditos, préstamos' },
  { key: 'otherFixed',     label: 'Otros gastos fijos',             icon: '📦', sub: 'Cuotas de colegio, pensión, etc.' },
]

export default function Step3FixedExpenses({ onSubmit, loading }) {
  const [form, setForm] = useState(
    Object.fromEntries(EXPENSE_FIELDS.map(f => [f.key, '']))
  )

  const set = (k) => (v) => setForm(p => ({ ...p, [k]: v }))

  // Calcula el total de gastos fijos ingresados
  const total = EXPENSE_FIELDS.reduce((sum, f) => sum + (Number(form[f.key]) || 0), 0)

  function handleSubmit(e) {
    e.preventDefault()
    const payload = {}
    EXPENSE_FIELDS.forEach(f => {
      if (form[f.key] && Number(form[f.key]) > 0) {
        payload[f.key] = Number(form[f.key])
      }
    })
    onSubmit(3, payload)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <p className="text-sm" style={{ color: 'var(--fg-muted)' }}>
        Ingresa los montos que pagas cada mes de forma fija. Déjalo en 0 si no aplica.
      </p>

      {EXPENSE_FIELDS.map(field => (
        <div key={field.key} className="flex items-center gap-3">
          <span className="text-xl w-7 shrink-0 text-center">{field.icon}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium" style={{ color: 'var(--fg)' }}>{field.label}</p>
            <p className="text-xs" style={{ color: 'var(--fg-subtle)' }}>{field.sub}</p>
          </div>
          <div className="w-36 shrink-0">
            <MoneyInput
              value={form[field.key]}
              onChange={set(field.key)}
              placeholder="0"
            />
          </div>
        </div>
      ))}

      {/* Total */}
      {total > 0 && (
        <div className="flex items-center justify-between rounded-xl px-4 py-3 mt-1"
             style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}>
          <span className="text-sm font-semibold" style={{ color: 'var(--fg)' }}>
            Total gastos fijos
          </span>
          <span className="text-base font-bold" style={{ color: 'var(--color-brand-500)' }}>
            {fmtCurrency(total)}
          </span>
        </div>
      )}

      <StepButton loading={loading}>Continuar →</StepButton>
    </form>
  )
}
