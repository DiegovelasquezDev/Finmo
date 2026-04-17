import { useState } from 'react'
import { StepButton, FormRow, RadioGroup, SliderInput } from '../components/OnboardingUI'

const SPENDING_BEHAVIORS = [
  { value: 'SAVER',    label: '🐖 Ahorrador', sub: 'Ahorro primero, gasto después' },
  { value: 'PLANNER',  label: '📋 Planificador', sub: 'Presupuesto todo antes de gastar' },
  { value: 'BALANCED', label: '⚖️ Equilibrado', sub: 'Balanceo entre ahorro y gasto' },
  { value: 'IMPULSIVE',label: '🛍️ Impulsivo', sub: 'A veces gasto más de lo que debería' },
]

const FINANCIAL_GOALS = [
  { value: 'EMERGENCY_FUND', label: '🆘 Fondo de emergencia' },
  { value: 'PAY_DEBT',       label: '💳 Pagar deudas' },
  { value: 'SAVE_TRAVEL',    label: '✈️ Ahorrar para viajar' },
  { value: 'BUY_PROPERTY',   label: '🏠 Comprar vivienda' },
  { value: 'RETIREMENT',     label: '🌅 Pensión / Retiro' },
  { value: 'EDUCATION',      label: '🎓 Educación' },
  { value: 'INVESTMENT',     label: '📈 Invertir' },
  { value: 'OTHER',          label: '🎯 Otro objetivo' },
]

const STRESS_LABELS = ['Sin estrés', 'Poco', 'Moderado', 'Bastante', 'Muy alto']

export default function Step4Behavior({ onSubmit, loading }) {
  const [form, setForm] = useState({
    savingsGoalPct:      20,
    hasEmergencyFund:    false,
    emergencyFundMonths: 0,
    hasDebts:            false,
    totalDebtAmount:     '',
    financialStressLevel:3,
    spendingBehavior:    'BALANCED',
    mainFinancialGoal:   'EMERGENCY_FUND',
    alertBudgetPct:      80,
  })

  const set = (k) => (v) => setForm(p => ({ ...p, [k]: v }))

  function handleSubmit(e) {
    e.preventDefault()
    onSubmit(4, {
      savingsGoalPct:      form.savingsGoalPct,
      hasEmergencyFund:    form.hasEmergencyFund,
      ...(form.hasEmergencyFund && { emergencyFundMonths: form.emergencyFundMonths }),
      hasDebts:            form.hasDebts,
      ...(form.hasDebts && form.totalDebtAmount && { totalDebtAmount: Number(form.totalDebtAmount) }),
      financialStressLevel:form.financialStressLevel,
      spendingBehavior:    form.spendingBehavior,
      mainFinancialGoal:   form.mainFinancialGoal,
      alertBudgetPct:      form.alertBudgetPct,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">

      {/* Meta de ahorro */}
      <FormRow
        label={`¿Qué porcentaje de tu ingreso quieres ahorrar? — ${form.savingsGoalPct}%`}
        sub="Te ayudará a calcular cuánto puedes gastar cada mes">
        <SliderInput value={form.savingsGoalPct} onChange={set('savingsGoalPct')} min={0} max={60} step={5} />
      </FormRow>

      {/* Comportamiento */}
      <FormRow label="¿Cómo describes tu comportamiento con el dinero?">
        <RadioGroup
          value={form.spendingBehavior}
          onChange={set('spendingBehavior')}
          options={SPENDING_BEHAVIORS}
          cols={2}
        />
      </FormRow>

      {/* Meta principal */}
      <FormRow label="¿Cuál es tu principal objetivo financiero ahora mismo?">
        <div className="grid grid-cols-2 gap-2">
          {FINANCIAL_GOALS.map(g => (
            <button
              key={g.value}
              type="button"
              onClick={() => set('mainFinancialGoal')(g.value)}
              className={[
                'rounded-xl px-3 py-2.5 text-left text-xs font-medium transition-all duration-150 border',
                form.mainFinancialGoal === g.value
                  ? 'border-[var(--color-brand-500)] bg-[var(--color-brand-50)]'
                  : 'border-[var(--border)] hover:border-[var(--color-brand-300)]',
              ].join(' ')}
              style={{ color: form.mainFinancialGoal === g.value ? 'var(--color-brand-600)' : 'var(--fg)' }}
            >
              {g.label}
            </button>
          ))}
        </div>
      </FormRow>

      {/* Estrés financiero */}
      <FormRow
        label={`Nivel de estrés financiero actual — ${STRESS_LABELS[form.financialStressLevel - 1]}`}
        sub="Nos ayuda a personalizar las alertas">
        <SliderInput value={form.financialStressLevel} onChange={set('financialStressLevel')} min={1} max={5} step={1} />
      </FormRow>

      {/* Fondo de emergencia */}
      <div className="rounded-xl p-4 flex flex-col gap-3"
           style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}>
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={form.hasEmergencyFund}
                 onChange={e => set('hasEmergencyFund')(e.target.checked)}
                 className="w-4 h-4 rounded accent-[var(--color-brand-500)]" />
          <span className="text-sm font-medium" style={{ color: 'var(--fg)' }}>
            Tengo un fondo de emergencia
          </span>
        </label>
        {form.hasEmergencyFund && (
          <FormRow label="¿Cuántos meses de gastos cubre?" sub="Ej: 3 meses">
            <input type="number" min={0} max={36} placeholder="3"
                   value={form.emergencyFundMonths}
                   onChange={e => set('emergencyFundMonths')(Number(e.target.value))}
                   className="field-input w-28" />
          </FormRow>
        )}
      </div>

      {/* Deudas */}
      <div className="rounded-xl p-4 flex flex-col gap-3"
           style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}>
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={form.hasDebts}
                 onChange={e => set('hasDebts')(e.target.checked)}
                 className="w-4 h-4 rounded accent-[var(--color-brand-500)]" />
          <span className="text-sm font-medium" style={{ color: 'var(--fg)' }}>
            Actualmente tengo deudas (créditos, tarjetas, etc.)
          </span>
        </label>
        {form.hasDebts && (
          <FormRow label="Monto total aproximado de deudas">
            <input type="number" min={0} placeholder="0"
                   value={form.totalDebtAmount}
                   onChange={e => set('totalDebtAmount')(e.target.value)}
                   className="field-input w-full" />
          </FormRow>
        )}
      </div>

      {/* Alertas */}
      <FormRow
        label={`Alertarme cuando llegue al ${form.alertBudgetPct}% del presupuesto`}
        sub="Recibirás una notificación antes de exceder tu límite">
        <SliderInput value={form.alertBudgetPct} onChange={set('alertBudgetPct')} min={50} max={100} step={5} />
      </FormRow>

      <StepButton loading={loading}>¡Finalizar y empezar! 🎉</StepButton>
    </form>
  )
}
