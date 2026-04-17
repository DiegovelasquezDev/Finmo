import { useState } from 'react'
import { StepButton, FormRow, Select, RadioGroup } from '../components/OnboardingUI'

const EDUCATION_OPTIONS = [
  { value: 'PRIMARY',        label: 'Primaria' },
  { value: 'SECONDARY',      label: 'Secundaria / Bachillerato' },
  { value: 'TECHNICAL',      label: 'Técnico / Tecnólogo' },
  { value: 'UNDERGRADUATE',  label: 'Pregrado / Universitario' },
  { value: 'GRADUATE',       label: 'Posgrado / Especialización' },
  { value: 'POSTGRADUATE',   label: 'Maestría / Doctorado' },
]

const KNOWLEDGE_OPTIONS = [
  { value: 'BASIC',        label: '🌱 Básico', sub: 'Conozco lo esencial' },
  { value: 'INTERMEDIATE', label: '📊 Intermedio', sub: 'Manejo presupuestos' },
  { value: 'ADVANCED',     label: '🚀 Avanzado', sub: 'Inversiones y portafolios' },
]

const CURRENCY_OPTIONS = [
  { value: 'COP', label: '🇨🇴 COP — Peso colombiano' },
  { value: 'USD', label: '🇺🇸 USD — Dólar americano' },
  { value: 'EUR', label: '🇪🇺 EUR — Euro' },
  { value: 'MXN', label: '🇲🇽 MXN — Peso mexicano' },
]

export default function Step1Personal({ onSubmit, loading }) {
  const [form, setForm] = useState({
    birthYear: '',
    occupation: '',
    educationLevel: '',
    householdSize: '',
    financialKnowledge: 'BASIC',
    currency: 'COP',
  })

  const set = (k) => (v) => setForm(p => ({ ...p, [k]: v }))

  function handleSubmit(e) {
    e.preventDefault()
    const payload = {
      ...(form.birthYear     && { birthYear: Number(form.birthYear) }),
      ...(form.occupation    && { occupation: form.occupation }),
      ...(form.educationLevel && { educationLevel: form.educationLevel }),
      ...(form.householdSize && { householdSize: Number(form.householdSize) }),
      financialKnowledge: form.financialKnowledge,
      currency: form.currency,
    }
    onSubmit(1, payload)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormRow label="Año de nacimiento" sub="Opcional">
          <input
            type="number" placeholder="1995"
            value={form.birthYear}
            onChange={e => set('birthYear')(e.target.value)}
            min={1940} max={2010}
            className="field-input"
          />
        </FormRow>
        <FormRow label="Ocupación" sub="Opcional">
          <input
            type="text" placeholder="Ej: Ingeniero de sistemas"
            value={form.occupation}
            onChange={e => set('occupation')(e.target.value)}
            className="field-input"
          />
        </FormRow>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormRow label="Nivel educativo">
          <Select value={form.educationLevel} onChange={set('educationLevel')} placeholder="Selecciona">
            {EDUCATION_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </Select>
        </FormRow>
        <FormRow label="Personas en el hogar" sub="Incluyéndote a ti">
          <input
            type="number" placeholder="1" min={1} max={20}
            value={form.householdSize}
            onChange={e => set('householdSize')(e.target.value)}
            className="field-input"
          />
        </FormRow>
      </div>

      <FormRow label="Moneda principal">
        <Select value={form.currency} onChange={set('currency')}>
          {CURRENCY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </Select>
      </FormRow>

      <FormRow label="¿Cómo describirías tu conocimiento financiero?">
        <RadioGroup
          value={form.financialKnowledge}
          onChange={set('financialKnowledge')}
          options={KNOWLEDGE_OPTIONS}
        />
      </FormRow>

      <StepButton loading={loading}>Continuar →</StepButton>
    </form>
  )
}
