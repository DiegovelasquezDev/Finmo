import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { api } from '../../shared/lib/api'

const ALERT_ICONS = {
  BUDGET_EXCEEDED:  '🚨',
  BUDGET_WARNING:   '⚠️',
  UNUSUAL_EXPENSE:  '💸',
  GOAL_ACHIEVED:    '✅',
  GOAL_DEADLINE:    '⏰',
  RECURRING_DUE:    '🔁',
  NEGATIVE_PATTERN: '🧠',
  LOW_INCOME_RATIO: '📉',
}

const PRIORITY_MAP = {
  BUDGET_EXCEEDED:  'high',
  LOW_INCOME_RATIO: 'high',
  BUDGET_WARNING:   'medium',
  UNUSUAL_EXPENSE:  'medium',
  NEGATIVE_PATTERN: 'medium',
  GOAL_DEADLINE:    'medium',
  RECURRING_DUE:    'low',
  GOAL_ACHIEVED:    'low',
}

const PRIORITY_CONFIG = {
  high:   { color: '#ef4444', bg: 'rgba(239,68,68,0.1)',   label: 'app.alerts.priorityHigh' },
  medium: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  label: 'app.alerts.priorityMed'  },
  low:    { color: '#10b981', bg: 'rgba(16,185,129,0.1)',  label: 'app.alerts.priorityLow'  },
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1)   return 'Ahora mismo'
  if (m < 60)  return `Hace ${m}m`
  const h = Math.floor(m / 60)
  if (h < 24)  return `Hace ${h}h`
  const d = Math.floor(h / 24)
  return d === 1 ? 'Ayer' : `Hace ${d} días`
}

function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded-lg bg-[var(--bg-muted)] ${className}`} />
}

/* ── Alert card ──────────────────────────────────────────────────────────────── */
function AlertCard({ alert, onMarkRead, onDismiss }) {
  const { t } = useTranslation()
  const [expanded, setExpanded] = useState(false)

  const priority = PRIORITY_MAP[alert.type] ?? 'low'
  const cfg = PRIORITY_CONFIG[priority]

  return (
    <div
      className={`bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden transition-all duration-200 ${!alert.isRead ? 'border-l-4' : ''}`}
      style={!alert.isRead ? { borderLeftColor: cfg.color } : {}}
    >
      <div className="p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0" style={{ background: cfg.bg }}>
            {ALERT_ICONS[alert.type] ?? '🔔'}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: cfg.bg, color: cfg.color }}>
                {t(cfg.label)}
              </span>
              <span className="text-xs text-[var(--fg-subtle)]">{timeAgo(alert.triggeredAt)}</span>
              {!alert.isRead && <span className="w-2 h-2 rounded-full bg-[var(--accent)] shrink-0" />}
            </div>
            <p className="text-sm font-semibold text-[var(--fg)] mb-1">{alert.title}</p>
            <p className={`text-xs text-[var(--fg-muted)] leading-relaxed ${expanded ? '' : 'line-clamp-2'}`}>
              {alert.message}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-3 pl-13">
          <button onClick={() => setExpanded(v => !v)}
            className="text-xs text-[var(--accent)] font-medium hover:underline">
            {expanded ? '↑ Menos' : t('app.alerts.viewDetails')}
          </button>
          {!alert.isRead && (
            <>
              <span className="text-[var(--border)]">·</span>
              <button onClick={() => onMarkRead(alert.id)}
                className="text-xs text-[var(--fg-muted)] hover:text-[var(--fg)] transition-colors">
                Marcar leída
              </button>
            </>
          )}
          <span className="text-[var(--border)]">·</span>
          <button onClick={() => onDismiss(alert.id)}
            className="text-xs text-[var(--fg-muted)] hover:text-[var(--color-error)] transition-colors">
            {t('app.alerts.dismiss')}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Main page ───────────────────────────────────────────────────────────────── */
export default function Alerts() {
  const { t } = useTranslation()
  const [alerts, setAlerts]     = useState([])
  const [loading, setLoading]   = useState(true)
  const [filter, setFilter]     = useState('all')
  const [page, setPage]         = useState(1)
  const [total, setTotal]       = useState(0)
  const [dismissed, setDismissed] = useState(new Set())
  const LIMIT = 10

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page, limit: LIMIT })
      if (filter !== 'all') params.set('isRead', filter === 'read' ? 'true' : 'false')
      const res = await api.get(`/alerts?${params}`)
      setAlerts(res.data ?? [])
      setTotal(res.pagination?.total ?? 0)
    } catch {
      setAlerts([])
    } finally {
      setLoading(false)
    }
  }, [page, filter])

  useEffect(() => { load() }, [load])

  async function handleMarkRead(id) {
    try {
      await api.patch(`/alerts/${id}/read`)
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, isRead: true } : a))
    } catch { /* ignore */ }
  }

  async function handleMarkAllRead() {
    try {
      await api.patch('/alerts/read-all')
      setAlerts(prev => prev.map(a => ({ ...a, isRead: true })))
    } catch { /* ignore */ }
  }

  function handleDismiss(id) {
    setDismissed(prev => new Set([...prev, id]))
  }

  const visible = alerts.filter(a => !dismissed.has(a.id))
  const unreadCount = visible.filter(a => !a.isRead).length
  const highCount   = visible.filter(a => PRIORITY_MAP[a.type] === 'high').length
  const resolvedCount = dismissed.size

  const totalPages = Math.ceil(total / LIMIT)

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[var(--fg)]">{t('app.alerts.title')}</h1>
          <p className="text-sm text-[var(--fg-muted)] mt-0.5">{t('app.alerts.subtitle')}</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllRead}
            className="self-start sm:self-auto px-4 py-2 rounded-xl border border-[var(--border)] text-sm font-medium text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--surface-raised)] transition-colors">
            {t('app.alerts.markRead')}
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: t('app.alerts.totalAlerts'),  value: loading ? '—' : total,          color: 'var(--fg)'   },
          { label: t('app.alerts.unread'),        value: loading ? '—' : unreadCount,    color: '#5d4573'     },
          { label: t('app.alerts.highPriority'),  value: loading ? '—' : highCount,      color: '#ef4444'     },
          { label: t('app.alerts.resolved'),      value: resolvedCount,                  color: '#10b981'     },
        ].map(s => (
          <div key={s.label} className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl px-4 py-4">
            <p className="text-xs text-[var(--fg-muted)] mb-1">{s.label}</p>
            <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex rounded-xl overflow-hidden border border-[var(--border)] text-sm font-medium w-fit">
        {[
          { key: 'all',    label: t('app.alerts.filterAll')    },
          { key: 'unread', label: t('app.alerts.filterHigh')   },
          { key: 'read',   label: 'Leídas'                     },
        ].map(f => (
          <button key={f.key} onClick={() => { setFilter(f.key); setPage(1) }}
            className={`px-4 py-2 transition-colors ${filter === f.key ? 'bg-[var(--accent)] text-white' : 'bg-[var(--surface)] text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--surface-raised)]'}`}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Alert list */}
      <div className="flex flex-col gap-3">
        {loading ? (
          [1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)
        ) : visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span className="text-5xl mb-4">🎉</span>
            <p className="text-base font-semibold text-[var(--fg)]">{t('app.alerts.empty')}</p>
            <p className="text-sm text-[var(--fg-muted)] mt-1">{t('app.alerts.emptyDesc')}</p>
          </div>
        ) : (
          visible.map(alert => (
            <AlertCard key={alert.id} alert={alert}
              onMarkRead={handleMarkRead}
              onDismiss={handleDismiss} />
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
            className="px-3 py-1.5 rounded-lg border border-[var(--border)] text-sm text-[var(--fg-muted)] disabled:opacity-40 hover:bg-[var(--surface-raised)] transition-colors">
            ← Anterior
          </button>
          <span className="text-sm text-[var(--fg-muted)]">{page} / {totalPages}</span>
          <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
            className="px-3 py-1.5 rounded-lg border border-[var(--border)] text-sm text-[var(--fg-muted)] disabled:opacity-40 hover:bg-[var(--surface-raised)] transition-colors">
            Siguiente →
          </button>
        </div>
      )}
    </div>
  )
}
