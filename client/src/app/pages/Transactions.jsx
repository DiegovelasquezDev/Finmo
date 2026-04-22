import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { api } from '../../shared/lib/api'
import { useAuth } from '../../shared/context/AuthContext'
import { fmtAmount, fmtCurrency, currencySymbol } from '../../shared/lib/format'

const fmtDate = (d) =>
  new Date(d).toLocaleDateString('es-CO', { month: 'short', day: 'numeric' })

/* ── Add / Edit Modal ────────────────────────────────────────────────────────── */
function TxModal({ onClose, onSaved, categories, onCategoryCreated, editTx = null, currency = 'COP' }) {
  const { t } = useTranslation()
  const today = new Date().toISOString().slice(0, 10)

  const [form, setForm] = useState({
    description: editTx?.description ?? '',
    amount:      editTx ? String(editTx.amount) : '',
    categoryId:  editTx?.categoryId ?? (categories[0]?.id ?? ''),
    date:        editTx ? new Date(editTx.date).toISOString().slice(0, 10) : today,
    type:        editTx?.type ?? 'EXPENSE',
    notes:       editTx?.notes ?? '',
  })
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const [showNewCat, setShowNewCat] = useState(false)
  const [newCat, setNewCat] = useState({ name: '', icon: '', color: '#6b7280' })
  const [catLoading, setCatLoading] = useState(false)

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  async function handleCreateCategory() {
    if (!newCat.name.trim()) return
    setCatLoading(true)
    try {
      const res = await api.post('/categories', {
        name: newCat.name.trim(),
        icon: newCat.icon || undefined,
        color: newCat.color,
        type: form.type,
      })
      const created = res.data?.category
      if (created) {
        onCategoryCreated(created)
        set('categoryId', created.id)
      }
      setNewCat({ name: '', icon: '', color: '#6b7280' })
      setShowNewCat(false)
    } catch (err) {
      setError(err.message ?? 'Error al crear la categoría.')
    } finally {
      setCatLoading(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0)
      return setError('El monto debe ser mayor a 0.')
    if (!form.categoryId) return setError('Selecciona una categoría.')

    setLoading(true)
    try {
      const payload = {
        description: form.description || undefined,
        amount:      Number(form.amount),
        categoryId:  form.categoryId,
        date:        new Date(form.date + 'T12:00:00').toISOString(),
        type:        form.type,
        notes:       form.notes || undefined,
      }
      if (editTx) {
        await api.patch(`/transactions/${editTx.id}`, payload)
      } else {
        await api.post('/transactions', payload)
      }
      onSaved()
      onClose()
    } catch (err) {
      setError(err.message ?? 'Error al guardar la transacción.')
    } finally {
      setLoading(false)
    }
  }

  const expenseCats = categories.filter(c => c.type === 'EXPENSE' || c.type === null)
  const incomeCats  = categories.filter(c => c.type === 'INCOME'  || c.type === null)
  const filteredCats = form.type === 'INCOME' ? incomeCats : expenseCats

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-[var(--surface)] rounded-2xl shadow-[var(--shadow-xl)] border border-[var(--border)] p-6">
        <h3 className="text-base font-semibold text-[var(--fg)] mb-5">
          {editTx ? 'Editar transacción' : t('app.transactions.modalTitle')}
        </h3>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex rounded-xl overflow-hidden border border-[var(--border)] text-sm font-medium">
            {['EXPENSE', 'INCOME'].map(tp => (
              <button key={tp} type="button" onClick={() => { set('type', tp); set('categoryId', '') }}
                className={`flex-1 py-2 transition-colors ${form.type === tp ? 'bg-[var(--accent)] text-white' : 'bg-[var(--surface-raised)] text-[var(--fg-muted)] hover:text-[var(--fg)]'}`}>
                {tp === 'EXPENSE' ? t('app.transactions.filterExpense') : t('app.transactions.filterIncome')}
              </button>
            ))}
          </div>

          <div>
            <label className="text-xs font-medium text-[var(--fg-muted)] mb-1.5 block">{t('app.transactions.modalDesc')}</label>
            <input value={form.description} onChange={e => set('description', e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[var(--surface-raised)] border border-[var(--border)] text-sm text-[var(--fg)] outline-none focus:border-[var(--accent-border)]" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-[var(--fg-muted)] mb-1.5 block">{t('app.transactions.modalAmount')}</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--fg-subtle)]">{currencySymbol(currency)}</span>
                <input type="number" min="0.01" step="0.01" value={form.amount} onChange={e => set('amount', e.target.value)} required
                  className="w-full pl-7 pr-3 py-2 rounded-lg bg-[var(--surface-raised)] border border-[var(--border)] text-sm text-[var(--fg)] outline-none focus:border-[var(--accent-border)]" />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--fg-muted)] mb-1.5 block">{t('app.transactions.modalDate')}</label>
              <input type="date" value={form.date} onChange={e => set('date', e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[var(--surface-raised)] border border-[var(--border)] text-sm text-[var(--fg)] outline-none focus:border-[var(--accent-border)]" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-[var(--fg-muted)]">{t('app.transactions.modalCategory')}</label>
              <button type="button" onClick={() => setShowNewCat(v => !v)}
                className="text-xs font-medium text-[var(--accent)] hover:underline">
                {showNewCat ? 'Cancelar' : '+ Nueva'}
              </button>
            </div>
            {showNewCat ? (
              <div className="flex flex-col gap-2 p-3 rounded-lg bg-[var(--surface-raised)] border border-[var(--border)]">
                <div className="flex gap-2">
                  <input value={newCat.icon} onChange={e => setNewCat(p => ({ ...p, icon: e.target.value }))}
                    placeholder="🏷️" maxLength={2}
                    className="w-10 px-2 py-1.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-center text-sm outline-none focus:border-[var(--accent-border)]" />
                  <input value={newCat.name} onChange={e => setNewCat(p => ({ ...p, name: e.target.value }))}
                    placeholder="Nombre de categoría"
                    className="flex-1 px-3 py-1.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-sm text-[var(--fg)] outline-none focus:border-[var(--accent-border)]" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex gap-1.5">
                    {['#6b7280','#ef4444','#f59e0b','#10b981','#3b82f6','#8b5cf6','#ec4899','#5d4573'].map(c => (
                      <button key={c} type="button" onClick={() => setNewCat(p => ({ ...p, color: c }))}
                        className={`w-5 h-5 rounded-full transition-transform ${newCat.color === c ? 'ring-2 ring-offset-1 ring-[var(--fg-subtle)] scale-110' : ''}`}
                        style={{ background: c }} />
                    ))}
                  </div>
                  <button type="button" onClick={handleCreateCategory} disabled={catLoading || !newCat.name.trim()}
                    className="px-3 py-1 rounded-lg bg-[var(--accent)] text-white text-xs font-medium disabled:opacity-50 hover:bg-[var(--accent-hover)] transition-colors">
                    {catLoading ? '…' : 'Crear'}
                  </button>
                </div>
              </div>
            ) : (
              <select value={form.categoryId} onChange={e => set('categoryId', e.target.value)} required
                className="w-full px-3 py-2 rounded-lg bg-[var(--surface-raised)] border border-[var(--border)] text-sm text-[var(--fg)] outline-none focus:border-[var(--accent-border)]">
                <option value="">Seleccionar…</option>
                {filteredCats.map(c => (
                  <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="text-xs font-medium text-[var(--fg-muted)] mb-1.5 block">Notas <span className="text-[var(--fg-subtle)]">(opcional)</span></label>
            <input value={form.notes} onChange={e => set('notes', e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[var(--surface-raised)] border border-[var(--border)] text-sm text-[var(--fg)] outline-none focus:border-[var(--accent-border)]" />
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2 rounded-lg border border-[var(--border)] text-sm font-medium text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--surface-raised)] transition-colors">
              {t('app.transactions.modalCancel')}
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2 rounded-lg bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-sm font-medium transition-colors disabled:opacity-60">
              {loading ? 'Guardando…' : t('app.transactions.modalSave')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ── Delete confirm modal ────────────────────────────────────────────────────── */
function DeleteModal({ tx, onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} />
      <div className="relative w-full max-w-sm bg-[var(--surface)] rounded-2xl border border-[var(--border)] shadow-[var(--shadow-xl)] p-6">
        <h3 className="text-base font-bold text-[var(--fg)] mb-2">Eliminar transacción</h3>
        <p className="text-sm text-[var(--fg-muted)] mb-5">
          ¿Eliminar <strong>{tx?.description || 'esta transacción'}</strong>? Esta acción no se puede deshacer.
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
export default function Transactions() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const currency = user?.currency ?? 'COP'

  const [txs,        setTxs]        = useState([])
  const [categories, setCategories] = useState([])
  const [loading,    setLoading]    = useState(true)
  const [filter,     setFilter]     = useState('all')
  const [search,     setSearch]     = useState('')
  const [page,       setPage]       = useState(1)
  const [pagination, setPagination] = useState({ total: 0, limit: 20 })
  const [showModal,  setShowModal]  = useState(false)
  const [editTx,     setEditTx]     = useState(null)
  const [deleteTx,   setDeleteTx]   = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [period,          setPeriod]          = useState('month')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  const fetchTxs = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page, limit: 20 })
      if (filter !== 'all') params.set('type', filter.toUpperCase())
      if (debouncedSearch)  params.set('search', debouncedSearch)

      if (period !== 'all') {
        const now = new Date()
        let sd, ed
        if (period === 'month') {
          sd = new Date(now.getFullYear(), now.getMonth(), 1)
          ed = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
        } else if (period === 'prev') {
          sd = new Date(now.getFullYear(), now.getMonth() - 1, 1)
          ed = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)
        } else if (period === '3m') {
          sd = new Date(now.getFullYear(), now.getMonth() - 2, 1)
          ed = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
        } else if (period === 'year') {
          sd = new Date(now.getFullYear(), 0, 1)
          ed = new Date(now.getFullYear(), 11, 31, 23, 59, 59)
        }
        if (sd) params.set('startDate', sd.toISOString())
        if (ed) params.set('endDate', ed.toISOString())
      }

      const res = await api.get(`/transactions?${params}`)
      setTxs(Array.isArray(res.data) ? res.data : [])
      setPagination({ total: res.pagination?.total ?? 0, limit: res.pagination?.limit ?? 20 })
    } catch {
      // keep existing data on error
    } finally {
      setLoading(false)
    }
  }, [page, filter, debouncedSearch, period])

  useEffect(() => { fetchTxs() }, [fetchTxs])

  const fetchCategories = useCallback(() => {
    api.get('/categories').then(res => setCategories(res.data?.categories ?? [])).catch(() => {})
  }, [])

  useEffect(() => { fetchCategories() }, [fetchCategories])

  // Debounce search input
  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search), 400)
    return () => clearTimeout(id)
  }, [search])

  // Reset to page 1 when filters change
  useEffect(() => { setPage(1) }, [filter, debouncedSearch, period])

  async function handleDelete() {
    if (!deleteTx) return
    setDeleteLoading(true)
    try {
      await api.delete(`/transactions/${deleteTx.id}`)
      setDeleteLoading(false)
      setDeleteTx(null)
      // If last item on page, go back one page
      if (txs.length === 1 && page > 1) setPage(p => p - 1)
      else fetchTxs()
    } catch {
      setDeleteLoading(false)
    }
  }

  const income   = txs.filter(t => t.type === 'INCOME').reduce((s, t) => s + Number(t.amount), 0)
  const expenses = txs.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + Number(t.amount), 0)
  const net      = income - expenses
  const totalPages = Math.ceil(pagination.total / pagination.limit)

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[var(--fg)]">{t('app.transactions.title')}</h1>
          <p className="text-sm text-[var(--fg-muted)] mt-0.5">{t('app.transactions.subtitle')}</p>
        </div>
        <button onClick={() => { setEditTx(null); setShowModal(true) }}
          className="self-start sm:self-auto flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-sm font-semibold transition-colors shadow-sm">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          {t('app.transactions.addBtn')}
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label: t('app.transactions.income'),   value: income,   color: '#10b981', type: 'INCOME' },
          { label: t('app.transactions.expenses'),  value: expenses, color: '#ef4444', type: 'EXPENSE' },
          { label: t('app.transactions.net'),       value: net,      color: net >= 0 ? '#10b981' : '#ef4444', type: net >= 0 ? 'INCOME' : 'EXPENSE' },
        ].map(card => (
          <div key={card.label} className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl px-4 py-3">
            <p className="text-xs text-[var(--fg-muted)] mb-1">{card.label}</p>
            <p className="text-base font-bold" style={{ color: card.color }}>
              {fmtAmount(card.value, card.type, currency)}
            </p>
          </div>
        ))}
      </div>

      {/* Filters + search */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <div className="flex rounded-xl overflow-x-auto border border-[var(--border)] text-sm font-medium">
            {[
              { key: 'all',     label: t('app.transactions.filterAll') },
              { key: 'income',  label: t('app.transactions.filterIncome') },
              { key: 'expense', label: t('app.transactions.filterExpense') },
            ].map(f => (
              <button key={f.key} onClick={() => setFilter(f.key)}
                className={`px-4 py-2 transition-colors ${filter === f.key ? 'bg-[var(--accent)] text-white' : 'bg-[var(--surface)] text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--surface-raised)]'}`}>
                {f.label}
              </button>
            ))}
          </div>
          <select value={period} onChange={e => setPeriod(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-sm text-[var(--fg)] outline-none focus:border-[var(--accent-border)]">
            <option value="month">Este mes</option>
            <option value="prev">Mes anterior</option>
            <option value="3m">Últimos 3 meses</option>
            <option value="year">Este año</option>
            <option value="all">Todo</option>
          </select>
        </div>
        <div className="flex-1 flex items-center gap-2 px-3 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-[var(--fg-subtle)]">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t('app.transactions.searchPlaceholder')}
            className="flex-1 py-2 bg-transparent text-sm text-[var(--fg)] outline-none placeholder:text-[var(--fg-subtle)]" />
          {search && (
            <button onClick={() => setSearch('')} className="hover:text-[var(--fg)] transition-colors">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <svg className="animate-spin w-6 h-6 text-[var(--accent)]" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    {[t('app.transactions.colDate'), t('app.transactions.colDesc'), t('app.transactions.colCategory'), t('app.transactions.colAmount'), ''].map((h, i) => (
                      <th key={i} className="text-left text-xs font-semibold text-[var(--fg-muted)] px-4 py-3 first:pl-5 last:pr-5 last:w-16">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {txs.length === 0 ? (
                    <tr><td colSpan={5} className="px-5 py-12 text-center text-sm text-[var(--fg-muted)]">
                      <span className="text-4xl block mb-3">💸</span>
                      <p className="font-medium">{t('app.transactions.empty')}</p>
                      <p className="text-xs mt-1">{t('app.transactions.emptyDesc')}</p>
                      <button onClick={() => { setEditTx(null); setShowModal(true) }}
                        className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--accent)] text-white text-xs font-semibold hover:opacity-90 transition-opacity">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        {t('app.transactions.addBtn')}
                      </button>
                    </td></tr>
                  ) : txs.map(tx => (
                    <tr key={tx.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--surface-raised)] transition-colors group">
                      <td className="pl-5 pr-4 py-3.5 text-xs text-[var(--fg-muted)] whitespace-nowrap">{fmtDate(tx.date)}</td>
                      <td className="px-4 py-3.5 font-medium text-[var(--fg)]">{tx.description || <span className="text-[var(--fg-subtle)] italic">Sin descripción</span>}</td>
                      <td className="px-4 py-3.5">
                        {tx.category && (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium"
                            style={{ background: (tx.category.color || '#6b7280') + '25', color: tx.category.color || '#6b7280' }}>
                            {tx.category.icon && <span>{tx.category.icon}</span>}
                            {tx.category.name}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 font-semibold tabular-nums"
                        style={{ color: tx.type === 'INCOME' ? '#10b981' : '#ef4444' }}>
                        {fmtAmount(tx.amount, tx.type, currency)}
                      </td>
                      <td className="pr-5 pl-4 py-3.5">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => { setEditTx(tx); setShowModal(true) }}
                            className="p-1.5 rounded-lg hover:bg-[var(--bg-muted)] text-[var(--fg-muted)] hover:text-[var(--fg)] transition-colors"
                            title="Editar">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                          </button>
                          <button onClick={() => setDeleteTx(tx)}
                            className="p-1.5 rounded-lg hover:bg-red-500/10 text-[var(--fg-muted)] hover:text-red-500 transition-colors"
                            title="Eliminar">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile list */}
            <div className="sm:hidden divide-y divide-[var(--border)]">
              {txs.length === 0 ? (
                <div className="py-12 text-center text-sm text-[var(--fg-muted)]">
                  <span className="text-4xl block mb-3">💸</span>
                  <p className="font-medium">{t('app.transactions.empty')}</p>
                  <p className="text-xs mt-1">{t('app.transactions.emptyDesc')}</p>
                  <button onClick={() => { setEditTx(null); setShowModal(true) }}
                    className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--accent)] text-white text-xs font-semibold hover:opacity-90 transition-opacity">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    {t('app.transactions.addBtn')}
                  </button>
                </div>
              ) : txs.map(tx => (
                <div key={tx.id} className="flex items-center gap-3 px-4 py-3.5">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-base"
                    style={{ background: (tx.category?.color || '#6b7280') + '20' }}>
                    {tx.category?.icon || (tx.type === 'INCOME' ? '↓' : '↑')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--fg)] truncate">{tx.description || 'Sin descripción'}</p>
                    <p className="text-xs text-[var(--fg-muted)]">{tx.category?.name} · {fmtDate(tx.date)}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <p className="text-sm font-semibold tabular-nums"
                      style={{ color: tx.type === 'INCOME' ? '#10b981' : '#ef4444' }}>
                      {fmtAmount(tx.amount, tx.type, currency)}
                    </p>
                    <button onClick={() => setDeleteTx(tx)}
                      className="p-1.5 rounded-lg text-[var(--fg-subtle)] hover:text-red-500 transition-colors">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-[var(--border)]">
                <p className="text-xs text-[var(--fg-muted)]">
                  {pagination.total} transacciones · Página {page} de {totalPages}
                </p>
                <div className="flex gap-1">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--border)] text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--surface-raised)] disabled:opacity-40 transition-colors">
                    ← Anterior
                  </button>
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--border)] text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--surface-raised)] disabled:opacity-40 transition-colors">
                    Siguiente →
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {showModal && (
        <TxModal
          key={editTx?.id ?? 'new'}
          onClose={() => { setShowModal(false); setEditTx(null) }}
          onSaved={fetchTxs}
          categories={categories}
          onCategoryCreated={(cat) => setCategories(prev => [...prev, cat])}
          editTx={editTx}
          currency={currency}
        />
      )}
      {deleteTx && (
        <DeleteModal
          tx={deleteTx}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTx(null)}
          loading={deleteLoading}
        />
      )}
    </div>
  )
}
