import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { fmtCurrency, currencySymbol } from '../../shared/lib/format'
import { useTheme } from '../../shared/context/ThemeContext'
import { useAuth } from '../../shared/context/AuthContext'
import { api } from '../../shared/lib/api'

/* ══════════════════════════════════════════════════════
   PRIMITIVOS
══════════════════════════════════════════════════════ */
function Toggle({ checked, onChange }) {
  return (
    <button onClick={() => onChange(!checked)} role="switch" aria-checked={checked}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none ${checked ? 'bg-[var(--accent)]' : 'bg-[var(--surface-overlay)]'}`}>
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  )
}

function Section({ title, sub, children, danger = false }) {
  return (
    <div className={`bg-[var(--surface)] border rounded-2xl overflow-hidden ${danger ? 'border-red-500/30' : 'border-[var(--border)]'}`}>
      <div className={`px-5 py-4 border-b ${danger ? 'border-red-500/20' : 'border-[var(--border)]'}`}>
        <h2 className={`text-sm font-semibold ${danger ? 'text-red-500' : 'text-[var(--fg)]'}`}>{title}</h2>
        {sub && <p className="text-xs mt-0.5" style={{ color: 'var(--fg-subtle)' }}>{sub}</p>}
      </div>
      <div className="divide-y divide-[var(--border)]">{children}</div>
    </div>
  )
}

function Row({ label, sub, children }) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-4">
      <div>
        <p className="text-sm text-[var(--fg)]">{label}</p>
        {sub && <p className="text-xs text-[var(--fg-muted)] mt-0.5">{sub}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}

function FieldInput({ value, onChange, type = 'text', className = '', readOnly }) {
  return (
    <input type={type} value={value} onChange={onChange} readOnly={readOnly}
      className={`px-3 py-1.5 rounded-lg bg-[var(--surface-raised)] border border-[var(--border)] text-sm text-[var(--fg)] outline-none focus:border-[var(--accent-border)] transition-colors ${readOnly ? 'opacity-60 cursor-not-allowed' : ''} ${className}`} />
  )
}

function SelectInput({ value, onChange, children, className = '' }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}
      className={`px-3 py-1.5 rounded-lg bg-[var(--surface-raised)] border border-[var(--border)] text-sm text-[var(--fg)] outline-none focus:border-[var(--accent-border)] ${className}`}>
      {children}
    </select>
  )
}

function SaveBar({ status, loading, onSave }) {
  return (
    <div className="px-5 py-4 flex items-center justify-end gap-3">
      {status === 'error' && <p className="text-xs text-red-500">Error al guardar. Intenta de nuevo.</p>}
      <button onClick={onSave} disabled={loading}
        className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-60 ${status === 'saved' ? 'bg-[var(--color-success)] text-white' : 'bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white'}`}>
        {loading ? 'Guardando…' : status === 'saved' ? '✓ Guardado' : 'Guardar cambios'}
      </button>
    </div>
  )
}

/* ══════════════════════════════════════════════════════
   MODALES
══════════════════════════════════════════════════════ */
function DeleteModal({ onConfirm, onCancel, loading }) {
  const [input, setInput] = useState('')
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} />
      <div className="relative w-full max-w-md rounded-2xl p-6 bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow-xl)]">
        <h3 className="text-base font-bold text-[var(--fg)] mb-2">¿Eliminar cuenta?</h3>
        <p className="text-sm text-[var(--fg-muted)] mb-4">
          Esta acción es <strong>irreversible</strong>. Perderás todos tus datos, transacciones y metas.
          Escribe <strong>ELIMINAR</strong> para confirmar.
        </p>
        <input value={input} onChange={e => setInput(e.target.value)} placeholder="ELIMINAR"
          className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface-raised)] text-sm text-[var(--fg)] outline-none mb-4" />
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel}
            className="px-4 py-2 rounded-xl border border-[var(--border)] text-sm text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--surface-raised)] transition-colors">
            Cancelar
          </button>
          <button onClick={onConfirm} disabled={input !== 'ELIMINAR' || loading}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-red-500 hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
            {loading ? 'Eliminando…' : 'Eliminar cuenta'}
          </button>
        </div>
      </div>
    </div>
  )
}

function ChangePasswordModal({ onClose }) {
  const [form, setForm] = useState({ current: '', next: '', confirm: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }))

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (form.next.length < 8 || !/[A-Z]/.test(form.next) || !/[0-9]/.test(form.next))
      return setError('Mínimo 8 caracteres, una mayúscula y un número.')
    if (form.next !== form.confirm) return setError('Las contraseñas no coinciden.')
    setLoading(true)
    try {
      await api.patch('/users/me/password', { currentPassword: form.current, newPassword: form.next })
      setSuccess(true)
      setTimeout(onClose, 1500)
    } catch (err) { setError(err.message ?? 'Error al cambiar la contraseña.') }
    finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-2xl p-6 bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow-xl)]">
        <h3 className="text-base font-bold text-[var(--fg)] mb-4">Cambiar contraseña</h3>
        {success
          ? <p className="text-sm text-center py-4" style={{ color: 'var(--color-success)' }}>✓ Contraseña actualizada</p>
          : <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              {[['current','Contraseña actual'],['next','Nueva contraseña'],['confirm','Confirmar nueva']].map(([k,lbl]) => (
                <div key={k}>
                  <label className="text-xs font-medium text-[var(--fg-muted)] block mb-1">{lbl}</label>
                  <input type="password" value={form[k]} onChange={set(k)}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface-raised)] text-sm text-[var(--fg)] outline-none" />
                </div>
              ))}
              {error && <p className="text-xs text-red-500">{error}</p>}
              <div className="flex gap-3 justify-end mt-2">
                <button type="button" onClick={onClose}
                  className="px-4 py-2 rounded-xl border border-[var(--border)] text-sm text-[var(--fg-muted)] hover:bg-[var(--surface-raised)] transition-colors">Cancelar</button>
                <button type="submit" disabled={loading}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-[var(--accent)] hover:bg-[var(--accent-hover)] disabled:opacity-50 transition-colors">
                  {loading ? 'Guardando…' : 'Guardar'}
                </button>
              </div>
            </form>
        }
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════
   TAB: CUENTA
══════════════════════════════════════════════════════ */
function TabCuenta({ user, updateUser }) {
  const { t } = useTranslation()
  const [profile, setProfile] = useState({
    firstName: user?.firstName ?? '', lastName: user?.lastName ?? '',
    email: user?.email ?? '', monthlyIncome: user?.monthlyIncome ?? '', currency: user?.currency ?? 'COP',
  })
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const { logout } = useAuth()
  const navigate = useNavigate()

  const initials = `${profile.firstName[0] ?? ''}${profile.lastName[0] ?? ''}`.toUpperCase()

  async function handleSave() {
    setLoading(true); setStatus('')
    try {
      const { data } = await api.patch('/users/me', {
        firstName: profile.firstName, lastName: profile.lastName,
        monthlyIncome: profile.monthlyIncome ? Number(profile.monthlyIncome) : undefined,
        currency: profile.currency,
      })
      updateUser(data.user)
      setStatus('saved'); setTimeout(() => setStatus(''), 2500)
    } catch { setStatus('error') }
    finally { setLoading(false) }
  }

  async function handleDelete() {
    setDeleteLoading(true)
    try { await api.delete('/users/me'); await logout(); navigate('/auth/login', { replace: true }) }
    catch { setDeleteLoading(false); setShowDelete(false) }
  }

  return (
    <>
      {showPass && <ChangePasswordModal onClose={() => setShowPass(false)} />}
      {showDelete && <DeleteModal onConfirm={handleDelete} onCancel={() => setShowDelete(false)} loading={deleteLoading} />}

      <div className="flex flex-col gap-5">
        <Section title="Información personal">
          <div className="flex items-center gap-4 px-5 py-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--color-brand-700)] to-[var(--color-brand-400)] flex items-center justify-center text-white text-xl font-bold shadow-sm shrink-0">
              {initials || '?'}
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--fg)]">{profile.firstName} {profile.lastName}</p>
              <p className="text-xs text-[var(--fg-muted)]">{profile.email}</p>
              <span className={`text-xs font-medium mt-1 block ${user?.isVerified ? 'text-[var(--color-success)]' : 'text-[var(--color-warning)]'}`}>
                {user?.isVerified ? '✓ Correo verificado' : '⚠ Correo no verificado'}
              </span>
            </div>
          </div>
          <Row label="Nombre">
            <FieldInput value={profile.firstName} onChange={e => setProfile(p => ({ ...p, firstName: e.target.value }))} className="w-36" />
          </Row>
          <Row label="Apellido">
            <FieldInput value={profile.lastName} onChange={e => setProfile(p => ({ ...p, lastName: e.target.value }))} className="w-36" />
          </Row>
          <Row label="Correo electrónico" sub="No se puede cambiar aquí">
            <FieldInput value={profile.email} readOnly className="w-52" />
          </Row>
          <Row label="Ingreso mensual neto" sub="Para calcular tu tasa de ahorro">
            <FieldInput type="number" value={profile.monthlyIncome} onChange={e => setProfile(p => ({ ...p, monthlyIncome: e.target.value }))} className="w-36" />
          </Row>
          <Row label="Moneda principal">
            <SelectInput value={profile.currency} onChange={v => setProfile(p => ({ ...p, currency: v }))}>
              <option value="COP">🇨🇴 COP — Peso colombiano</option>
              <option value="USD">🇺🇸 USD — Dólar americano</option>
              <option value="EUR">🇪🇺 EUR — Euro</option>
              <option value="MXN">🇲🇽 MXN — Peso mexicano</option>
              <option value="GBP">🇬🇧 GBP — Libra esterlina</option>
            </SelectInput>
          </Row>
          <SaveBar status={status} loading={loading} onSave={handleSave} />
        </Section>

        <Section title="Seguridad">
          <Row label="Contraseña" sub="Cambia tu contraseña periódicamente">
            <button onClick={() => setShowPass(true)}
              className="px-4 py-1.5 rounded-xl border border-[var(--border)] text-xs font-medium text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--surface-raised)] transition-colors">
              Cambiar →
            </button>
          </Row>
          <Row label="Verificación de correo">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${user?.isVerified ? 'bg-[var(--color-success-light)] text-[var(--color-success-dark)]' : 'bg-[var(--color-warning-light)] text-[var(--color-warning-dark)]'}`}>
              {user?.isVerified ? 'Verificado' : 'Pendiente'}
            </span>
          </Row>
        </Section>

        <Section title="Zona de peligro" danger>
          <div className="px-5 py-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-[var(--fg)]">Eliminar cuenta</p>
              <p className="text-xs text-[var(--fg-muted)] mt-0.5">Elimina permanentemente tu cuenta y todos tus datos.</p>
            </div>
            <button onClick={() => setShowDelete(true)}
              className="shrink-0 px-4 py-2 rounded-xl border border-red-500/40 text-red-500 text-xs font-semibold hover:bg-red-500/10 transition-colors">
              Eliminar cuenta
            </button>
          </div>
        </Section>
      </div>
    </>
  )
}

/* ══════════════════════════════════════════════════════
   TAB: PREFERENCIAS
══════════════════════════════════════════════════════ */
function TabPreferencias() {
  const { t, i18n } = useTranslation()
  const { mode: theme, toggle: toggleTheme } = useTheme()
  const [notifs, setNotifs] = useState({ email: true, alerts: true, goals: true })
  const setNotif = (k, v) => setNotifs(n => ({ ...n, [k]: v }))

  return (
    <div className="flex flex-col gap-5">
      <Section title="Apariencia e idioma">
        <Row label="Idioma">
          <SelectInput value={i18n.language.startsWith('es') ? 'es' : 'en'} onChange={v => i18n.changeLanguage(v)}>
            <option value="en">🇺🇸 English</option>
            <option value="es">🇪🇸 Español</option>
          </SelectInput>
        </Row>
        <Row label="Tema" sub={theme === 'dark' ? 'Modo oscuro activo' : 'Modo claro activo'}>
          <div className="flex rounded-xl overflow-hidden border border-[var(--border)] text-xs font-medium">
            {[['light','☀️ Claro'],['dark','🌙 Oscuro']].map(([th, lbl]) => (
              <button key={th} onClick={() => { if (theme !== th) toggleTheme() }}
                className={`px-3 py-1.5 transition-colors ${theme === th ? 'bg-[var(--accent)] text-white' : 'bg-[var(--surface-raised)] text-[var(--fg-muted)] hover:text-[var(--fg)]'}`}>
                {lbl}
              </button>
            ))}
          </div>
        </Row>
      </Section>

      <Section title="Notificaciones">
        <Row label="Alertas por correo" sub="Recibe alertas financieras en tu email">
          <Toggle checked={notifs.email} onChange={v => setNotif('email', v)} />
        </Row>
        <Row label="Alertas de presupuesto" sub="Cuando te acercas al límite mensual">
          <Toggle checked={notifs.alerts} onChange={v => setNotif('alerts', v)} />
        </Row>
        <Row label="Recordatorios de metas" sub="Progreso y fechas límite de tus objetivos">
          <Toggle checked={notifs.goals} onChange={v => setNotif('goals', v)} />
        </Row>
      </Section>
    </div>
  )
}

/* ══════════════════════════════════════════════════════
   TAB: PERFIL FINANCIERO
══════════════════════════════════════════════════════ */
const INCOME_SOURCES   = [['SALARY','💼 Salario'],['FREELANCE','💻 Freelance'],['BUSINESS','🏪 Negocio'],['INVESTMENTS','📈 Inversiones'],['PENSION','🏦 Pensión'],['MIXED','🔀 Mixto'],['OTHER','📦 Otro']]
const EMPLOYMENT_TYPES = [['EMPLOYED_FULL','👔 Empleado tiempo completo'],['EMPLOYED_PART','⏰ Tiempo parcial'],['SELF_EMPLOYED','🧑‍💼 Independiente'],['STUDENT','🎓 Estudiante'],['UNEMPLOYED','🔍 Desempleado'],['RETIRED','🌅 Jubilado']]
const EDUCATION_LEVELS = [['PRIMARY','Primaria'],['SECONDARY','Secundaria'],['TECHNICAL','Técnico / Tecnólogo'],['UNDERGRADUATE','Pregrado'],['GRADUATE','Posgrado'],['POSTGRADUATE','Maestría / Doctorado']]
const SPENDING_BEHAVIORS = [['SAVER','🐖 Ahorrador'],['PLANNER','📋 Planificador'],['BALANCED','⚖️ Equilibrado'],['IMPULSIVE','🛍️ Impulsivo']]
const FINANCIAL_GOALS   = [['EMERGENCY_FUND','🆘 Fondo de emergencia'],['PAY_DEBT','💳 Pagar deudas'],['SAVE_TRAVEL','✈️ Viaje'],['BUY_PROPERTY','🏠 Vivienda'],['RETIREMENT','🌅 Pensión'],['EDUCATION','🎓 Educación'],['INVESTMENT','📈 Invertir'],['OTHER','🎯 Otro']]
const STRESS_LABELS     = ['Sin estrés','Poco','Moderado','Bastante','Muy alto']

const FIXED_EXPENSE_FIELDS = [
  { key: 'rentMortgage',   label: 'Arriendo / Hipoteca', icon: '🏠' },
  { key: 'utilities',      label: 'Servicios públicos',  icon: '💡' },
  { key: 'transportFixed', label: 'Transporte fijo',     icon: '🚌' },
  { key: 'insurances',     label: 'Seguros',              icon: '🛡️' },
  { key: 'subscriptions',  label: 'Suscripciones',        icon: '📱' },
  { key: 'loanPayments',   label: 'Cuotas / Deudas',     icon: '💳' },
  { key: 'otherFixed',     label: 'Otros fijos',          icon: '📦' },
]

function TabPerfilFinanciero({ user }) {
  const profile = user?.profile ?? {}

  const [personal, setPersonal] = useState({
    birthYear:          profile.birthYear ?? '',
    occupation:         profile.occupation ?? '',
    educationLevel:     profile.educationLevel ?? '',
    householdSize:      profile.householdSize ?? '',
    financialKnowledge: profile.financialKnowledge ?? 'BASIC',
  })

  const [income, setIncome] = useState({
    primaryIncomeSource:   profile.primaryIncomeSource ?? 'SALARY',
    employmentType:        profile.employmentType ?? 'EMPLOYED_FULL',
    hasSecondaryIncome:    profile.hasSecondaryIncome ?? false,
    secondaryIncomeAmount: profile.secondaryIncomeAmount ?? '',
  })

  const [fixed, setFixed] = useState(
    Object.fromEntries(FIXED_EXPENSE_FIELDS.map(f => [f.key, profile[f.key] ?? '']))
  )

  const [behavior, setBehavior] = useState({
    savingsGoalPct:       profile.savingsGoalPct ?? 20,
    hasEmergencyFund:     profile.hasEmergencyFund ?? false,
    emergencyFundMonths:  profile.emergencyFundMonths ?? 0,
    hasDebts:             profile.hasDebts ?? false,
    totalDebtAmount:      profile.totalDebtAmount ?? '',
    financialStressLevel: profile.financialStressLevel ?? 3,
    spendingBehavior:     profile.spendingBehavior ?? 'BALANCED',
    mainFinancialGoal:    profile.mainFinancialGoal ?? 'EMERGENCY_FUND',
    alertBudgetPct:       profile.alertBudgetPct ?? 80,
  })

  const [status, setStatus] = useState({})   // { section: 'saved'|'error'|'' }
  const [loading, setLoading] = useState({})

  async function saveSection(stepNum, data, key) {
    setLoading(p => ({ ...p, [key]: true }))
    setStatus(p => ({ ...p, [key]: '' }))
    try {
      await api.post(`/onboarding/step/${stepNum}`, data)
      setStatus(p => ({ ...p, [key]: 'saved' }))
      setTimeout(() => setStatus(p => ({ ...p, [key]: '' })), 2500)
    } catch {
      setStatus(p => ({ ...p, [key]: 'error' }))
    } finally {
      setLoading(p => ({ ...p, [key]: false }))
    }
  }

  const fixedTotal = FIXED_EXPENSE_FIELDS.reduce((s, f) => s + (Number(fixed[f.key]) || 0), 0)

  return (
    <div className="flex flex-col gap-5">

      {/* ── Información personal ── */}
      <Section title="Información personal" sub="Datos demográficos para personalizar el análisis">
        <Row label="Año de nacimiento">
          <FieldInput type="number" value={personal.birthYear} className="w-28"
            onChange={e => setPersonal(p => ({ ...p, birthYear: e.target.value }))} />
        </Row>
        <Row label="Ocupación">
          <FieldInput value={personal.occupation} className="w-48"
            onChange={e => setPersonal(p => ({ ...p, occupation: e.target.value }))} />
        </Row>
        <Row label="Nivel educativo">
          <SelectInput value={personal.educationLevel} onChange={v => setPersonal(p => ({ ...p, educationLevel: v }))} className="w-52">
            <option value="">Seleccionar…</option>
            {EDUCATION_LEVELS.map(([v,l]) => <option key={v} value={v}>{l}</option>)}
          </SelectInput>
        </Row>
        <Row label="Personas en el hogar" sub="Incluyéndote a ti">
          <FieldInput type="number" value={personal.householdSize} className="w-20"
            onChange={e => setPersonal(p => ({ ...p, householdSize: e.target.value }))} />
        </Row>
        <Row label="Conocimiento financiero">
          <SelectInput value={personal.financialKnowledge} onChange={v => setPersonal(p => ({ ...p, financialKnowledge: v }))}>
            <option value="BASIC">🌱 Básico</option>
            <option value="INTERMEDIATE">📊 Intermedio</option>
            <option value="ADVANCED">🚀 Avanzado</option>
          </SelectInput>
        </Row>
        <SaveBar status={status.personal} loading={loading.personal}
          onSave={() => saveSection(1, {
            ...(personal.birthYear     && { birthYear: Number(personal.birthYear) }),
            ...(personal.occupation    && { occupation: personal.occupation }),
            ...(personal.educationLevel && { educationLevel: personal.educationLevel }),
            ...(personal.householdSize  && { householdSize: Number(personal.householdSize) }),
            financialKnowledge: personal.financialKnowledge,
          }, 'personal')} />
      </Section>

      {/* ── Fuentes de ingreso ── */}
      <Section title="Fuentes de ingreso" sub="Tu situación laboral y de ingresos">
        <Row label="Fuente principal de ingresos">
          <SelectInput value={income.primaryIncomeSource} onChange={v => setIncome(p => ({ ...p, primaryIncomeSource: v }))} className="w-52">
            {INCOME_SOURCES.map(([v,l]) => <option key={v} value={v}>{l}</option>)}
          </SelectInput>
        </Row>
        <Row label="Tipo de empleo">
          <SelectInput value={income.employmentType} onChange={v => setIncome(p => ({ ...p, employmentType: v }))} className="w-52">
            {EMPLOYMENT_TYPES.map(([v,l]) => <option key={v} value={v}>{l}</option>)}
          </SelectInput>
        </Row>
        <div className="px-5 py-4 flex flex-col gap-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={income.hasSecondaryIncome}
              onChange={e => setIncome(p => ({ ...p, hasSecondaryIncome: e.target.checked }))}
              className="w-4 h-4 rounded accent-[var(--color-brand-500)]" />
            <span className="text-sm text-[var(--fg)]">Tengo ingresos adicionales</span>
          </label>
          {income.hasSecondaryIncome && (
            <Row label="Monto mensual adicional">
              <FieldInput type="number" value={income.secondaryIncomeAmount} className="w-36"
                onChange={e => setIncome(p => ({ ...p, secondaryIncomeAmount: e.target.value }))} />
            </Row>
          )}
        </div>
        <SaveBar status={status.income} loading={loading.income}
          onSave={() => saveSection(2, {
            monthlyIncome: user?.monthlyIncome ? Number(user.monthlyIncome) : 0,
            primaryIncomeSource: income.primaryIncomeSource,
            employmentType: income.employmentType,
            hasSecondaryIncome: income.hasSecondaryIncome,
            ...(income.hasSecondaryIncome && income.secondaryIncomeAmount && { secondaryIncomeAmount: Number(income.secondaryIncomeAmount) }),
          }, 'income')} />
      </Section>

      {/* ── Gastos fijos ── */}
      <Section title="Gastos fijos mensuales" sub="Lo que pagas cada mes independiente de tu comportamiento">
        {FIXED_EXPENSE_FIELDS.map(f => (
          <Row key={f.key} label={`${f.icon} ${f.label}`}>
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs" style={{ color: 'var(--fg-subtle)' }}>{currencySymbol(profile.currency)}</span>
              <input type="number" min={0} value={fixed[f.key]}
                onChange={e => setFixed(p => ({ ...p, [f.key]: e.target.value }))}
                placeholder="0"
                className="w-36 pl-6 pr-3 py-1.5 rounded-lg bg-[var(--surface-raised)] border border-[var(--border)] text-sm text-[var(--fg)] outline-none focus:border-[var(--accent-border)]" />
            </div>
          </Row>
        ))}
        {fixedTotal > 0 && (
          <div className="px-5 py-3 flex justify-between items-center bg-[var(--bg-subtle)]">
            <span className="text-sm font-semibold text-[var(--fg)]">Total gastos fijos</span>
            <span className="text-base font-bold" style={{ color: 'var(--color-brand-500)' }}>
              {fmtCurrency(fixedTotal, profile.currency)}
            </span>
          </div>
        )}
        <SaveBar status={status.fixed} loading={loading.fixed}
          onSave={() => {
            const payload = {}
            FIXED_EXPENSE_FIELDS.forEach(f => { if (fixed[f.key] !== '') payload[f.key] = Number(fixed[f.key]) })
            saveSection(3, payload, 'fixed')
          }} />
      </Section>

      {/* ── Comportamiento financiero ── */}
      <Section title="Comportamiento y objetivos" sub="Información clave para el análisis de IA">
        <Row label={`Meta de ahorro: ${behavior.savingsGoalPct}% del ingreso`} sub="¿Cuánto quieres ahorrar cada mes?">
          <div className="flex items-center gap-3">
            <input type="range" min={0} max={60} step={5} value={behavior.savingsGoalPct}
              onChange={e => setBehavior(p => ({ ...p, savingsGoalPct: Number(e.target.value) }))}
              className="w-32 accent-[var(--color-brand-500)]" />
            <span className="text-sm font-semibold w-8 text-right" style={{ color: 'var(--color-brand-500)' }}>{behavior.savingsGoalPct}%</span>
          </div>
        </Row>
        <Row label="Estilo de gasto predominante">
          <SelectInput value={behavior.spendingBehavior} onChange={v => setBehavior(p => ({ ...p, spendingBehavior: v }))}>
            {SPENDING_BEHAVIORS.map(([v,l]) => <option key={v} value={v}>{l}</option>)}
          </SelectInput>
        </Row>
        <Row label="Principal objetivo financiero">
          <SelectInput value={behavior.mainFinancialGoal} onChange={v => setBehavior(p => ({ ...p, mainFinancialGoal: v }))} className="w-52">
            {FINANCIAL_GOALS.map(([v,l]) => <option key={v} value={v}>{l}</option>)}
          </SelectInput>
        </Row>
        <Row label={`Nivel de estrés financiero: ${STRESS_LABELS[behavior.financialStressLevel - 1]}`}>
          <div className="flex items-center gap-3">
            <input type="range" min={1} max={5} step={1} value={behavior.financialStressLevel}
              onChange={e => setBehavior(p => ({ ...p, financialStressLevel: Number(e.target.value) }))}
              className="w-32 accent-[var(--color-brand-500)]" />
            <span className="text-sm font-semibold w-4 text-right" style={{ color: 'var(--color-brand-500)' }}>{behavior.financialStressLevel}</span>
          </div>
        </Row>
        <div className="px-5 py-4 flex flex-col gap-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={behavior.hasEmergencyFund}
              onChange={e => setBehavior(p => ({ ...p, hasEmergencyFund: e.target.checked }))}
              className="w-4 h-4 rounded accent-[var(--color-brand-500)]" />
            <span className="text-sm text-[var(--fg)]">Tengo fondo de emergencia</span>
          </label>
          {behavior.hasEmergencyFund && (
            <Row label="¿Cuántos meses cubre?">
              <FieldInput type="number" min={0} max={36} value={behavior.emergencyFundMonths} className="w-20"
                onChange={e => setBehavior(p => ({ ...p, emergencyFundMonths: Number(e.target.value) }))} />
            </Row>
          )}
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={behavior.hasDebts}
              onChange={e => setBehavior(p => ({ ...p, hasDebts: e.target.checked }))}
              className="w-4 h-4 rounded accent-[var(--color-brand-500)]" />
            <span className="text-sm text-[var(--fg)]">Tengo deudas activas</span>
          </label>
          {behavior.hasDebts && (
            <Row label="Monto total de deudas">
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs" style={{ color: 'var(--fg-subtle)' }}>$</span>
                <input type="number" min={0} value={behavior.totalDebtAmount} placeholder="0"
                  onChange={e => setBehavior(p => ({ ...p, totalDebtAmount: e.target.value }))}
                  className="w-36 pl-6 pr-3 py-1.5 rounded-lg bg-[var(--surface-raised)] border border-[var(--border)] text-sm text-[var(--fg)] outline-none" />
              </div>
            </Row>
          )}
        </div>
        <Row label={`Alertarme al ${behavior.alertBudgetPct}% del presupuesto`} sub="Umbral para notificaciones de presupuesto">
          <div className="flex items-center gap-3">
            <input type="range" min={50} max={100} step={5} value={behavior.alertBudgetPct}
              onChange={e => setBehavior(p => ({ ...p, alertBudgetPct: Number(e.target.value) }))}
              className="w-32 accent-[var(--color-brand-500)]" />
            <span className="text-sm font-semibold w-8 text-right" style={{ color: 'var(--color-brand-500)' }}>{behavior.alertBudgetPct}%</span>
          </div>
        </Row>
        <SaveBar status={status.behavior} loading={loading.behavior}
          onSave={() => saveSection(4, {
            savingsGoalPct: behavior.savingsGoalPct,
            hasEmergencyFund: behavior.hasEmergencyFund,
            ...(behavior.hasEmergencyFund && { emergencyFundMonths: behavior.emergencyFundMonths }),
            hasDebts: behavior.hasDebts,
            ...(behavior.hasDebts && behavior.totalDebtAmount && { totalDebtAmount: Number(behavior.totalDebtAmount) }),
            financialStressLevel: behavior.financialStressLevel,
            spendingBehavior: behavior.spendingBehavior,
            mainFinancialGoal: behavior.mainFinancialGoal,
            alertBudgetPct: behavior.alertBudgetPct,
          }, 'behavior')} />
      </Section>
    </div>
  )
}

/* ══════════════════════════════════════════════════════
   PÁGINA PRINCIPAL CON TABS
══════════════════════════════════════════════════════ */
const TABS = [
  { key: 'cuenta',    label: '👤 Cuenta' },
  { key: 'prefs',     label: '⚙️ Preferencias' },
  { key: 'financiero',label: '📊 Perfil financiero' },
]

export default function Settings() {
  const { user, updateUser } = useAuth()
  const [activeTab, setActiveTab] = useState('cuenta')

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-[var(--fg)]">Configuración</h1>
        <p className="text-sm text-[var(--fg-muted)] mt-0.5">Administra tu cuenta, preferencias y perfil financiero</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl w-fit"
           style={{ background: 'var(--surface-raised)', border: '1px solid var(--border)' }}>
        {TABS.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={[
              'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
              activeTab === tab.key
                ? 'bg-[var(--surface)] shadow-sm text-[var(--fg)]'
                : 'text-[var(--fg-muted)] hover:text-[var(--fg)]',
            ].join(' ')}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Contenido */}
      {activeTab === 'cuenta'     && <TabCuenta user={user} updateUser={updateUser} />}
      {activeTab === 'prefs'      && <TabPreferencias />}
      {activeTab === 'financiero' && <TabPerfilFinanciero user={user} />}
    </div>
  )
}
