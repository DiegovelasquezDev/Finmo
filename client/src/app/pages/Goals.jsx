import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import { api } from '../../shared/lib/api'
import { useAuth } from '../../shared/context/AuthContext'
import { fmtCurrency, currencySymbol } from '../../shared/lib/format'

/* ── Helpers ─────────────────────────────────────────────────────────────────── */
const fmtDate = d => new Date(d).toLocaleDateString('es-CO', { month: 'short', day: 'numeric', year: 'numeric' })

/* ── Goal card ───────────────────────────────────────────────────────────────── */
function GoalCard({ goal, onContribute, onEdit, onDelete, onTogglePause, currency }) {
  const { t } = useTranslation()
  const targetAmount  = Number(goal.targetAmount)
  const currentAmount = Number(goal.currentAmount)
  const pct     = targetAmount > 0 ? Math.min((currentAmount / targetAmount) * 100, 100) : 0
  const remaining = Math.max(targetAmount - currentAmount, 0)
  const achieved  = currentAmount >= targetAmount || goal.status === 'COMPLETED'
  const color     = goal.color || '#5d4573'

  let statusLabel, statusClass
  if (achieved) {
    statusLabel = t('app.goals.achieved'); statusClass = 'bg-emerald-500/10 text-emerald-600'
  } else if (goal.status === 'PAUSED') {
    statusLabel = 'Pausada'; statusClass = 'bg-[var(--surface-overlay)] text-[var(--fg-muted)]'
  } else {
    statusLabel = t('app.goals.onTrack'); statusClass = 'bg-[var(--accent-subtle)] text-[var(--accent)]'
  }

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 flex flex-col gap-4 group">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
            style={{ background: color + '20' }}>
            {goal.icon || '🎯'}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[var(--fg)] truncate">{goal.name}</p>
            {goal.deadline && (
              <p className="text-xs text-[var(--fg-muted)]">{t('app.goals.deadline')}: {fmtDate(goal.deadline)}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusClass}`}>
            {statusLabel}
          </span>
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            {!achieved && (
              <button onClick={() => onTogglePause(goal)}
                className="p-1.5 rounded-lg text-[var(--fg-subtle)] hover:text-[var(--fg)] hover:bg-[var(--surface-raised)] transition-colors"
                title={goal.status === 'PAUSED' ? 'Reanudar' : 'Pausar'}>
                {goal.status === 'PAUSED' ? (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                ) : (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                )}
              </button>
            )}
            <button onClick={() => onEdit(goal)}
              className="p-1.5 rounded-lg text-[var(--fg-subtle)] hover:text-[var(--fg)] hover:bg-[var(--surface-raised)] transition-colors"
              title="Editar">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
            <button onClick={() => onDelete(goal)}
              className="p-1.5 rounded-lg text-[var(--fg-subtle)] hover:text-red-500 hover:bg-red-500/10 transition-colors"
              title="Eliminar">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                <path d="M10 11v6M14 11v6"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div>
        <div className="flex justify-between text-xs mb-1.5">
          <span className="text-[var(--fg-muted)]">
            {t('app.goals.saved')} <span className="font-semibold text-[var(--fg)]">{fmtCurrency(currentAmount, currency)}</span>
          </span>
          <span className="text-[var(--fg-muted)]">
            {t('app.goals.target')} <span className="font-semibold text-[var(--fg)]">{fmtCurrency(targetAmount, currency)}</span>
          </span>
        </div>
        <div className="h-2 rounded-full bg-[var(--surface-overlay)] overflow-hidden">
          <div className="h-full rounded-full transition-all duration-700"
            style={{ width: `${pct}%`, background: color }} />
        </div>
        <div className="flex justify-between mt-1.5 text-xs text-[var(--fg-subtle)]">
          <span>{pct.toFixed(0)}%</span>
          {!achieved && (
            <span>{t('app.goals.remaining')}: <span className="font-medium text-[var(--fg-muted)]">{fmtCurrency(remaining, currency)}</span></span>
          )}
        </div>
      </div>

      {!achieved && goal.status === 'ACTIVE' && (
        <button onClick={() => onContribute(goal)}
          className="w-full py-2 rounded-xl border border-[var(--accent-border)] text-[var(--accent)] text-sm font-semibold hover:bg-[var(--accent-subtle)] transition-colors">
          + {t('app.goals.contribute')}
        </button>
      )}
      {goal.status === 'PAUSED' && !achieved && (
        <button onClick={() => onTogglePause(goal)}
          className="w-full py-2 rounded-xl border border-[var(--border)] text-[var(--fg-muted)] text-sm font-semibold hover:bg-[var(--surface-raised)] transition-colors">
          ▶ Reanudar meta
        </button>
      )}
      {achieved && (
        <div className="flex items-center justify-center gap-2 py-2 rounded-xl bg-emerald-500/10 text-emerald-600 text-sm font-semibold">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          {t('app.goals.achieved')}!
        </div>
      )}
    </div>
  )
}

/* ── Create / Edit modal ─────────────────────────────────────────────────────── */
function GoalModal({ onClose, onSaved, editGoal = null, prefill = null }) {
  const { t } = useTranslation()
  const ICONS  = ['🎯', '✈️', '🏠', '💻', '🛡️', '💍', '🚗', '📚', '💊', '🎓', '🏖️', '💰', '🏋️', '🎸', '🌍']
  const COLORS = ['#5d4573', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#ef4444', '#8b5cf6', '#06b6d4']

  const src = editGoal ?? prefill
  const [form, setForm] = useState({
    name:         src?.name ?? '',
    targetAmount: editGoal ? String(editGoal.targetAmount) : '',
    deadline:     editGoal?.deadline ? new Date(editGoal.deadline).toISOString().slice(0, 10) : '',
    icon:         src?.icon  ?? '🎯',
    color:        editGoal?.color ?? '#5d4573',
    description:  src?.description ?? '',
  })
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!form.name) return setError('El nombre es obligatorio.')
    if (!form.targetAmount || Number(form.targetAmount) <= 0) return setError('El monto objetivo debe ser mayor a 0.')

    setLoading(true)
    try {
      const payload = {
        name:         form.name,
        targetAmount: Number(form.targetAmount),
        icon:         form.icon,
        color:        form.color,
        description:  form.description || undefined,
        deadline:     form.deadline ? new Date(form.deadline + 'T12:00:00').toISOString() : undefined,
      }
      if (editGoal) {
        await api.patch(`/goals/${editGoal.id}`, payload)
      } else {
        await api.post('/goals', payload)
      }
      onSaved()
      onClose()
    } catch (err) {
      setError(err.message ?? 'Error al guardar la meta.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-[var(--surface)] rounded-2xl shadow-[var(--shadow-xl)] border border-[var(--border)] p-6 max-h-[90vh] overflow-y-auto">
        <h3 className="text-base font-semibold text-[var(--fg)] mb-5">
          {editGoal ? 'Editar meta' : t('app.goals.modalTitle')}
        </h3>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-medium text-[var(--fg-muted)] mb-2 block">Icono</label>
            <div className="flex flex-wrap gap-2">
              {ICONS.map(ic => (
                <button key={ic} type="button" onClick={() => set('icon', ic)}
                  className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center transition-colors ${form.icon === ic ? 'bg-[var(--accent-subtle)] ring-2 ring-[var(--accent)]' : 'bg-[var(--surface-raised)] hover:bg-[var(--surface-overlay)]'}`}>
                  {ic}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-[var(--fg-muted)] mb-2 block">Color</label>
            <div className="flex gap-2">
              {COLORS.map(c => (
                <button key={c} type="button" onClick={() => set('color', c)}
                  className={`w-7 h-7 rounded-full transition-transform ${form.color === c ? 'ring-2 ring-offset-2 ring-[var(--fg-subtle)] scale-110' : ''}`}
                  style={{ background: c }} />
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-[var(--fg-muted)] mb-1.5 block">{t('app.goals.modalName')}</label>
            <input value={form.name} onChange={e => set('name', e.target.value)} required
              className="w-full px-3 py-2 rounded-lg bg-[var(--surface-raised)] border border-[var(--border)] text-sm text-[var(--fg)] outline-none focus:border-[var(--accent-border)]" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-[var(--fg-muted)] mb-1.5 block">{t('app.goals.modalTarget')}</label>
              <input type="number" min="1" value={form.targetAmount} onChange={e => set('targetAmount', e.target.value)} required
                className="w-full px-3 py-2 rounded-lg bg-[var(--surface-raised)] border border-[var(--border)] text-sm text-[var(--fg)] outline-none focus:border-[var(--accent-border)]" />
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--fg-muted)] mb-1.5 block">{t('app.goals.modalDeadline')}</label>
              <input type="date" value={form.deadline} onChange={e => set('deadline', e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[var(--surface-raised)] border border-[var(--border)] text-sm text-[var(--fg)] outline-none focus:border-[var(--accent-border)]" />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-[var(--fg-muted)] mb-1.5 block">Descripción <span className="text-[var(--fg-subtle)]">(opcional)</span></label>
            <input value={form.description} onChange={e => set('description', e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[var(--surface-raised)] border border-[var(--border)] text-sm text-[var(--fg)] outline-none focus:border-[var(--accent-border)]" />
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2 rounded-lg border border-[var(--border)] text-sm font-medium text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--surface-raised)] transition-colors">
              {t('app.goals.modalCancel')}
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2 rounded-lg bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-sm font-medium transition-colors disabled:opacity-60">
              {loading ? 'Guardando…' : editGoal ? 'Guardar' : t('app.goals.modalCreate')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ── Contribute modal ────────────────────────────────────────────────────────── */
function ContributeModal({ goal, onClose, onSaved, currency }) {
  const [amount,  setAmount]  = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    const n = Number(amount)
    if (!n || n <= 0) return setError('Ingresa un monto válido.')
    setLoading(true)
    try {
      const newAmount = Number(goal.currentAmount) + n
      const patch = { currentAmount: newAmount }
      if (newAmount >= Number(goal.targetAmount)) patch.status = 'COMPLETED'
      await api.patch(`/goals/${goal.id}`, patch)
      onSaved()
      onClose()
    } catch (err) {
      setError(err.message ?? 'Error al registrar el aporte.')
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-[var(--surface)] rounded-2xl border border-[var(--border)] shadow-[var(--shadow-xl)] p-6">
        <h3 className="text-base font-bold text-[var(--fg)] mb-1">Agregar aporte</h3>
        <p className="text-sm text-[var(--fg-muted)] mb-4">Meta: <strong>{goal?.name}</strong></p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-medium text-[var(--fg-muted)] mb-1.5 block">Monto del aporte</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--fg-subtle)]">{currencySymbol(currency)}</span>
              <input type="number" min="1" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} required autoFocus
                className="w-full pl-7 pr-3 py-2 rounded-lg bg-[var(--surface-raised)] border border-[var(--border)] text-sm text-[var(--fg)] outline-none focus:border-[var(--accent-border)]" />
            </div>
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
          <div className="flex gap-3">
            <button type="button" onClick={onClose}
              className="flex-1 py-2 rounded-xl border border-[var(--border)] text-sm text-[var(--fg-muted)] hover:bg-[var(--surface-raised)] transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-sm font-semibold disabled:opacity-50 transition-colors">
              {loading ? 'Guardando…' : 'Aportar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ── Delete confirm ──────────────────────────────────────────────────────────── */
function DeleteModal({ goal, onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} />
      <div className="relative w-full max-w-sm bg-[var(--surface)] rounded-2xl border border-[var(--border)] shadow-[var(--shadow-xl)] p-6">
        <h3 className="text-base font-bold text-[var(--fg)] mb-2">Eliminar meta</h3>
        <p className="text-sm text-[var(--fg-muted)] mb-5">
          ¿Eliminar <strong>{goal?.name}</strong>? Esta acción no se puede deshacer.
        </p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel}
            className="px-4 py-2 rounded-xl border border-[var(--border)] text-sm text-[var(--fg-muted)] hover:bg-[var(--surface-raised)] transition-colors">
            Cancelar
          </button>
          <button onClick={onConfirm} disabled={loading}
            className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold disabled:opacity-40 transition-colors">
            {loading ? 'Eliminando…' : 'Eliminar'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Main page ───────────────────────────────────────────────────────────────── */
export default function Goals() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const currency = user?.currency ?? 'COP'
  const [goals,       setGoals]       = useState([])
  const [loading,     setLoading]     = useState(true)
  const [showModal,   setShowModal]   = useState(false)
  const [editGoal,    setEditGoal]    = useState(null)
  const [prefill,     setPrefill]     = useState(null)

  // Auto-open create modal from URL params (e.g. from Analysis archetype CTA)
  useEffect(() => {
    if (searchParams.get('create') === '1') {
      const pf = {}
      if (searchParams.get('name'))        pf.name = searchParams.get('name')
      if (searchParams.get('icon'))        pf.icon = searchParams.get('icon')
      if (searchParams.get('description')) pf.description = searchParams.get('description')
      setPrefill(Object.keys(pf).length > 0 ? pf : null)
      setEditGoal(null)
      setShowModal(true)
      setSearchParams({}, { replace: true })
    }
  }, [searchParams, setSearchParams])
  const [contributeGoal, setContributeGoal] = useState(null)
  const [deleteGoal,  setDeleteGoal]  = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [statusFilter, setStatusFilter] = useState('all')
  const [deadlineFilter, setDeadlineFilter] = useState('all')
  const [customFrom, setCustomFrom] = useState('')
  const [customTo,   setCustomTo]   = useState('')

  const fetchGoals = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get('/goals')
      setGoals(res.data?.goals ?? [])
    } catch {
      // keep existing
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchGoals() }, [fetchGoals])

  async function handleDelete() {
    if (!deleteGoal) return
    setDeleteLoading(true)
    try {
      await api.delete(`/goals/${deleteGoal.id}`)
      setDeleteLoading(false)
      setDeleteGoal(null)
      fetchGoals()
    } catch {
      setDeleteLoading(false)
    }
  }

  async function handleTogglePause(goal) {
    try {
      const newStatus = goal.status === 'PAUSED' ? 'ACTIVE' : 'PAUSED'
      await api.patch(`/goals/${goal.id}`, { status: newStatus })
      fetchGoals()
    } catch { /* silent */ }
  }

  const active    = goals.filter(g => g.status === 'ACTIVE' && Number(g.currentAmount) < Number(g.targetAmount))
  const paused    = goals.filter(g => g.status === 'PAUSED')
  const completed = goals.filter(g => g.status === 'COMPLETED' || Number(g.currentAmount) >= Number(g.targetAmount))
  const totalSaved = goals.reduce((s, g) => s + Number(g.currentAmount), 0)
  const totalTarget = goals.reduce((s, g) => s + Number(g.targetAmount), 0)

  // Deadline date filter
  function matchesDeadline(g) {
    if (deadlineFilter === 'all') return true
    if (!g.deadline) return deadlineFilter === 'nodate'
    const dl = new Date(g.deadline)
    const now = new Date()
    if (deadlineFilter === 'nodate') return false
    if (deadlineFilter === 'overdue') return dl < now && g.status !== 'COMPLETED' && Number(g.currentAmount) < Number(g.targetAmount)
    if (deadlineFilter === '3m') {
      const limit = new Date(now.getFullYear(), now.getMonth() + 3, now.getDate())
      return dl >= now && dl <= limit
    }
    if (deadlineFilter === 'year') {
      return dl.getFullYear() === now.getFullYear() && dl >= now
    }
    if (deadlineFilter === 'custom' && customFrom && customTo) {
      const from = new Date(customFrom + 'T00:00:00')
      const to   = new Date(customTo   + 'T23:59:59')
      return dl >= from && dl <= to
    }
    return true
  }

  const filteredActive    = (statusFilter === 'all' || statusFilter === 'active'    ? active    : []).filter(matchesDeadline)
  const filteredPaused    = (statusFilter === 'all' || statusFilter === 'paused'    ? paused    : []).filter(matchesDeadline)
  const filteredCompleted = (statusFilter === 'all' || statusFilter === 'completed' ? completed : []).filter(matchesDeadline)

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[var(--fg)]">{t('app.goals.title')}</h1>
          <p className="text-sm text-[var(--fg-muted)] mt-0.5">{t('app.goals.subtitle')}</p>
        </div>
        <button onClick={() => { setEditGoal(null); setPrefill(null); setShowModal(true) }}
          className="self-start sm:self-auto flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-sm font-semibold transition-colors shadow-sm">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          {t('app.goals.addBtn')}
        </button>
      </div>

      {/* Stats */}
      {!loading && goals.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: t('app.goals.activeGoals'),  value: active.length },
            { label: t('app.goals.completed'),    value: completed.length },
            { label: t('app.goals.totalSaved'),   value: fmtCurrency(totalSaved, currency) },
            { label: 'Progreso total', value: totalTarget > 0 ? `${Math.round((totalSaved / totalTarget) * 100)}%` : '—' },
          ].map(s => (
            <div key={s.label} className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl px-4 py-4">
              <p className="text-xs text-[var(--fg-muted)] mb-1">{s.label}</p>
              <p className="text-2xl font-bold text-[var(--fg)]">{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      {!loading && goals.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex rounded-xl overflow-hidden border border-[var(--border)] text-sm font-medium">
            {[
              { key: 'all',       label: 'Todas',      count: goals.length },
              { key: 'active',    label: 'Activas',     count: active.length },
              { key: 'paused',    label: 'Pausadas',    count: paused.length },
              { key: 'completed', label: 'Completadas', count: completed.length },
            ].map(f => (
              <button key={f.key} onClick={() => setStatusFilter(f.key)}
                className={`px-3 py-2 transition-colors ${statusFilter === f.key ? 'bg-[var(--accent)] text-white' : 'bg-[var(--surface)] text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--surface-raised)]'}`}>
                {f.label} {f.count > 0 && <span className="ml-1 text-xs opacity-70">{f.count}</span>}
              </button>
            ))}
          </div>
          <select value={deadlineFilter} onChange={e => setDeadlineFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-sm text-[var(--fg)] outline-none focus:border-[var(--accent-border)]">
            <option value="all">Fecha límite: Todas</option>
            <option value="overdue">Vencidas</option>
            <option value="3m">Próximos 3 meses</option>
            <option value="year">Este año</option>
            <option value="nodate">Sin fecha</option>
            <option value="custom">Personalizado</option>
          </select>
          {deadlineFilter === 'custom' && (
            <div className="flex items-center gap-2">
              <label className="text-xs text-[var(--fg-muted)]">Desde</label>
              <input type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)}
                className="px-2 py-1.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-sm text-[var(--fg)] outline-none focus:border-[var(--accent-border)]" />
              <label className="text-xs text-[var(--fg-muted)]">Hasta</label>
              <input type="date" value={customTo} onChange={e => setCustomTo(e.target.value)}
                className="px-2 py-1.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-sm text-[var(--fg)] outline-none focus:border-[var(--accent-border)]" />
            </div>
          )}
        </div>
      )}

      {/* Tip */}
      {!loading && active.length > 0 && (
        <div className="flex items-start gap-3 px-4 py-3.5 rounded-2xl bg-[var(--accent-subtle)] border border-[var(--accent-border)]">
          <span className="text-xl shrink-0 mt-0.5">💡</span>
          <div>
            <p className="text-xs font-semibold text-[var(--accent)] mb-0.5">{t('app.goals.tip')}</p>
            <p className="text-xs text-[var(--fg-muted)]">{t('app.goals.tipText')}</p>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <svg className="animate-spin w-6 h-6 text-[var(--accent)]" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
        </div>
      )}

      {/* Goals grid */}
      {!loading && filteredActive.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-[var(--fg-muted)] uppercase tracking-widest mb-3">{t('app.goals.activeGoals')}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredActive.map(g => (
              <GoalCard key={g.id} goal={g}
                onContribute={setContributeGoal}
                onEdit={g => { setEditGoal(g); setShowModal(true) }}
                onDelete={setDeleteGoal}
                onTogglePause={handleTogglePause}
                currency={currency} />
            ))}
          </div>
        </div>
      )}

      {!loading && filteredPaused.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-[var(--fg-muted)] uppercase tracking-widest mb-3">Pausadas</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredPaused.map(g => (
              <GoalCard key={g.id} goal={g}
                onContribute={setContributeGoal}
                onEdit={g => { setEditGoal(g); setShowModal(true) }}
                onDelete={setDeleteGoal}
                onTogglePause={handleTogglePause}
                currency={currency} />
            ))}
          </div>
        </div>
      )}

      {!loading && filteredCompleted.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-[var(--fg-muted)] uppercase tracking-widest mb-3">{t('app.goals.completed')}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredCompleted.map(g => (
              <GoalCard key={g.id} goal={g}
                onContribute={setContributeGoal}
                onEdit={g => { setEditGoal(g); setShowModal(true) }}
                onDelete={setDeleteGoal}
                onTogglePause={handleTogglePause}
                currency={currency} />
            ))}
          </div>
        </div>
      )}

      {!loading && goals.length > 0 && filteredActive.length === 0 && filteredPaused.length === 0 && filteredCompleted.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-sm text-[var(--fg-muted)]">No hay metas en este filtro.</p>
        </div>
      )}

      {!loading && goals.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <span className="text-5xl mb-4">🎯</span>
          <p className="text-base font-semibold text-[var(--fg)]">{t('app.goals.empty')}</p>
          <p className="text-sm text-[var(--fg-muted)] mt-1">{t('app.goals.emptyDesc')}</p>
          <button onClick={() => setShowModal(true)}
            className="mt-4 px-5 py-2.5 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-sm font-semibold transition-colors">
            Crear primera meta
          </button>
        </div>
      )}

      {showModal && (
        <GoalModal
          key={editGoal?.id ?? 'new'}
          onClose={() => { setShowModal(false); setEditGoal(null); setPrefill(null) }}
          onSaved={fetchGoals}
          editGoal={editGoal}
          prefill={prefill}
        />
      )}
      {contributeGoal && (
        <ContributeModal
          goal={contributeGoal}
          onClose={() => setContributeGoal(null)}
          onSaved={fetchGoals}
          currency={currency}
        />
      )}
      {deleteGoal && (
        <DeleteModal
          goal={deleteGoal}
          onConfirm={handleDelete}
          onCancel={() => setDeleteGoal(null)}
          loading={deleteLoading}
        />
      )}
    </div>
  )
}
