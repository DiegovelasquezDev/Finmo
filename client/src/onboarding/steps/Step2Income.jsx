import { useState } from 'react'
import { StepButton, FormRow, Select, MoneyInput, RadioGroup } from '../components/OnboardingUI'

const INCOME_SOURCES = [
  { value: 'SALARY',      label: '💼 Salario / Empleo fijo' },
  { value: 'FREELANCE',   label: '💻 Freelance / Por proyectos' },
  { value: 'BUSINESS',    label: '🏪 Negocio propio' },
  { value: 'INVESTMENTS', label: '📈 Inversiones' },
  { value: 'PENSION',     label: '🏦 Pensión' },
  { value: 'MIXED',       label: '🔀 Mixto (varios)' },
  { value: 'OTHER',       label: '📦 Otro' },
]

const EMPLOYMENT_TYPES = [
  { value: 'EMPLOYED_FULL',  label: '👔 Empleado tiempo completo' },
  { value: 'EMPLOYED_PART',  label: '⏰ Empleado tiempo parcial' },
  { value: 'SELF_EMPLOYED',  label: '🧑‍💼 Independiente / Emprendedor' },
  { value: 'STUDENT',        label: '🎓 Estudiante' },
  { value: 'UNEMPLOYED',     label: '🔍 Desempleado actualmente' },
  { value: 'RETIRED',        label: '🌅 Jubilado' },
]

export default function Step2Income({ onSubmit, loading }) {
  const [form, setForm] = useState({
    monthlyIncome: '',
    primaryIncomeSource: 'SALARY',
    employmentType: 'EMPLOYED_FULL',
    hasSecondaryIncome: false,
    secondaryIncomeAmount: '',
  })
  const [errors, setErrors] = useState({})

  const set = (k) => (v) => setForm(p => ({ ...p, [k]: v }))

  function validate() {
    const errs = {}
    if (!form.monthlyIncome || Number(form.monthlyIncome) <= 0)
      errs.monthlyIncome = 'Ingresa tu ingreso mensual'
    return errs
  }

  function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) return setErrors(errs)

    onSubmit(2, {
      monthlyIncome: Number(form.monthlyIncome),
      primaryIncomeSource: form.primaryIncomeSource,
      employmentType: form.employmentType,
      hasSecondaryIncome: form.hasSecondaryIncome,
      ...(form.hasSecondaryIncome && form.secondaryIncomeAmount && {
        secondaryIncomeAmount: Number(form.secondaryIncomeAmount),
      }),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <FormRow label="Ingreso mensual neto *" sub="Lo que recibes después de impuestos y descuentos" error={errors.monthlyIncome}>
        <MoneyInput
          value={form.monthlyIncome}
          onChange={set('monthlyIncome')}
          placeholder="0"
          error={!!errors.monthlyIncome}
        />
      </FormRow>

      <FormRow label="¿Cuál es tu principal fuente de ingreso?">
        <Select value={form.primaryIncomeSource} onChange={set('primaryIncomeSource')}>
          {INCOME_SOURCES.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </Select>
      </FormRow>

      <FormRow label="Tipo de empleo">
        <Select value={form.employmentType} onChange={set('employmentType')}>
          {EMPLOYMENT_TYPES.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </Select>
      </FormRow>

      {/* Ingreso secundario */}
      <div className="rounded-xl p-4 flex flex-col gap-3"
           style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={form.hasSecondaryIncome}
            onChange={e => set('hasSecondaryIncome')(e.target.checked)}
            className="w-4 h-4 rounded accent-[var(--color-brand-500)]"
          />
          <span className="text-sm font-medium" style={{ color: 'var(--fg)' }}>
            Tengo ingresos adicionales (freelance, arriendo, etc.)
          </span>
        </label>
        {form.hasSecondaryIncome && (
          <FormRow label="Monto mensual aproximado">
            <MoneyInput
              value={form.secondaryIncomeAmount}
              onChange={set('secondaryIncomeAmount')}
              placeholder="0"
            />
          </FormRow>
        )}
      </div>

      <StepButton loading={loading}>Continuar →</StepButton>
    </form>
  )
}
