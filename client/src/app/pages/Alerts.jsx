import { useState } from 'react'
import { useTranslation } from 'react-i18next'

/* ── Data ────────────────────────────────────────────────────────────────────── */
const INITIAL_ALERTS = [
  {
    id: 1, priority: 'high', type: 'spending', unread: true, dismissed: false,
    icon: '🍽️',
    title: 'Dining expenses up 34%',
    desc: 'You spent $218 on dining this week — 34% more than your weekly average of $163. This pattern could push you over budget by end of month.',
    time: '2 min ago',
    action: 'Review dining transactions',
  },
  {
    id: 2, priority: 'high', type: 'cashflow', unread: true, dismissed: false,
    icon: '⚠️',
    title: 'Projected cash shortfall in 12 days',
    desc: 'Based on current spending, your balance may drop below $0 on April 27. Consider reducing discretionary spending by $140 this week.',
    time: '1h ago',
    action: 'See cash flow forecast',
  },
  {
    id: 3, priority: 'medium', type: 'behavior', unread: true, dismissed: false,
    icon: '🧠',
    title: 'Friday night spending pattern detected',
    desc: 'For the past 6 weeks, your spending on Friday evenings is 2.3× higher than other evenings. This is a behavioral pattern worth being aware of.',
    time: '3h ago',
    action: 'View analysis',
  },
  {
    id: 4, priority: 'medium', type: 'spending', unread: false, dismissed: false,
    icon: '🚗',
    title: 'Unusual transport expense',
    desc: 'A $98 transport charge is 4× larger than your typical transport transactions. Please verify this charge is correct.',
    time: 'Yesterday',
    action: 'View transaction',
  },
  {
    id: 5, priority: 'low', type: 'goal', unread: false, dismissed: false,
    icon: '✅',
    title: "You're on track for your savings goal",
    desc: "Great news! At your current savings rate, you'll hit your Emergency Fund goal 3 weeks ahead of schedule.",
    time: '2 days ago',
    action: 'View goal',
  },
  {
    id: 6, priority: 'low', type: 'goal', unread: false, dismissed: false,
    icon: '💻',
    title: 'New Laptop goal at 80%',
    desc: "You've saved $960 of your $1,200 laptop goal. Only $240 more to go — you're almost there!",
    time: '3 days ago',
    action: 'View goal',
  },
  {
    id: 7, priority: 'medium', type: 'spending', unread: false, dismissed: false,
    icon: '📱',
    title: 'Subscription stack growing',
    desc: "You currently pay $89.97/month in subscriptions (Spotify, Netflix, gym). Consider reviewing which ones you actively use.",
    time: '4 days ago',
    action: 'Review subscriptions',
  },
]

const PRIORITY_CONFIG = {
  high:   { color: '#ef4444', bg: 'rgba(239,68,68,0.1)',   label: 'app.alerts.priorityHigh' },
  medium: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  label: 'app.alerts.priorityMed'  },
  low:    { color: '#10b981', bg: 'rgba(16,185,129,0.1)',  label: 'app.alerts.priorityLow'  },
}

/* ── Alert card ──────────────────────────────────────────────────────────────── */
function AlertCard({ alert, onDismiss }) {
  const { t } = useTranslation()
  const [expanded, setExpanded] = useState(false)
  const cfg = PRIORITY_CONFIG[alert.priority]

  if (alert.dismissed) return null

  return (
    <div className={`bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden transition-all duration-200 ${alert.unread ? 'border-l-4' : ''}`}
      style={alert.unread ? { borderLeftColor: cfg.color } : {}}>
      <div className="p-4 sm:p-5">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0" style={{ background: cfg.bg }}>
            {alert.icon}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: cfg.bg, color: cfg.color }}>
                {t(cfg.label)}
              </span>
              <span className="text-xs text-[var(--fg-subtle)]">{alert.time}</span>
              {alert.unread && <span className="w-2 h-2 rounded-full bg-[var(--accent)] shrink-0" />}
            </div>
            <p className="text-sm font-semibold text-[var(--fg)] mb-1">{alert.title}</p>
            <p className={`text-xs text-[var(--fg-muted)] leading-relaxed ${expanded ? '' : 'line-clamp-2'}`}>{alert.desc}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-3 ml-13">
          <button onClick={() => setExpanded(v => !v)}
            className="text-xs text-[var(--accent)] font-medium hover:underline">
            {expanded ? '↑ Less' : t('app.alerts.viewDetails')}
          </button>
          <span className="text-[var(--border)]">·</span>
          <button onClick={() => onDismiss(alert.id)}
            className="text-xs text-[var(--fg-muted)] hover:text-[var(--fg)] transition-colors">
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
  const [alerts, setAlerts] = useState(INITIAL_ALERTS)
  const [filter, setFilter] = useState('all')

  const dismiss = (id) => setAlerts(prev => prev.map(a => a.id === id ? { ...a, dismissed: true } : a))
  const markAllRead = () => setAlerts(prev => prev.map(a => ({ ...a, unread: false })))

  const visible = alerts.filter(a => !a.dismissed)
  const filtered = visible.filter(a => filter === 'all' || a.priority === filter)
  const unreadCount = visible.filter(a => a.unread).length
  const highCount   = visible.filter(a => a.priority === 'high').length

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[var(--fg)]">{t('app.alerts.title')}</h1>
          <p className="text-sm text-[var(--fg-muted)] mt-0.5">{t('app.alerts.subtitle')}</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead}
            className="self-start sm:self-auto px-4 py-2 rounded-xl border border-[var(--border)] text-sm font-medium text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--surface-raised)] transition-colors">
            {t('app.alerts.markRead')}
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: t('app.alerts.totalAlerts'),  value: visible.length,  color: 'var(--fg)'  },
          { label: t('app.alerts.unread'),       value: unreadCount,     color: '#5d4573'    },
          { label: t('app.alerts.highPriority'), value: highCount,       color: '#ef4444'    },
          { label: t('app.alerts.resolved'),     value: alerts.filter(a => a.dismissed).length, color: '#10b981' },
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
          { key: 'high',   label: t('app.alerts.filterHigh')   },
          { key: 'medium', label: t('app.alerts.filterMedium') },
          { key: 'low',    label: t('app.alerts.filterLow')    },
        ].map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={`px-4 py-2 transition-colors ${filter === f.key ? 'bg-[var(--accent)] text-white' : 'bg-[var(--surface)] text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--surface-raised)]'}`}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Alert list */}
      <div className="flex flex-col gap-3">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span className="text-5xl mb-4">🎉</span>
            <p className="text-base font-semibold text-[var(--fg)]">{t('app.alerts.empty')}</p>
            <p className="text-sm text-[var(--fg-muted)] mt-1">{t('app.alerts.emptyDesc')}</p>
          </div>
        ) : (
          filtered.map(alert => <AlertCard key={alert.id} alert={alert} onDismiss={dismiss} />)
        )}
      </div>
    </div>
  )
}
