import { useState, useRef, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Settings, LogOut, User, ChevronDown } from 'lucide-react'
import ThemeToggle from '../../shared/components/ThemeToggle'
import LangToggle  from '../../shared/components/LangToggle'
import { useAuth } from '../../shared/context/AuthContext'
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

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1)   return 'Ahora'
  if (m < 60)  return `Hace ${m}m`
  const h = Math.floor(m / 60)
  if (h < 24)  return `Hace ${h}h`
  return `Hace ${Math.floor(h / 24)}d`
}

/* ── Notification bell ─────────────────────────────────────────────────────── */
function NotificationBell() {
  const { t } = useTranslation()
  const [open, setOpen]     = useState(false)
  const [alerts, setAlerts] = useState([])
  const [unread, setUnread] = useState(0)
  const [loading, setLoading] = useState(false)
  const ref = useRef(null)

  const loadAlerts = useCallback(async () => {
    setLoading(true)
    try {
      const [listRes, countRes] = await Promise.all([
        api.get('/alerts?limit=5'),
        api.get('/alerts/unread-count'),
      ])
      setAlerts(listRes.data ?? [])
      setUnread(countRes.data?.count ?? 0)
    } catch {
      // silently fail — bell is non-critical
    } finally {
      setLoading(false)
    }
  }, [])

  // Load on mount and every 60s
  useEffect(() => {
    loadAlerts()
    const id = setInterval(loadAlerts, 60_000)
    return () => clearInterval(id)
  }, [loadAlerts])

  // Close on outside click
  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  async function handleMarkAllRead() {
    try {
      await api.patch('/alerts/read-all')
      setUnread(0)
      setAlerts(prev => prev.map(a => ({ ...a, isRead: true })))
    } catch { /* ignore */ }
  }

  async function handleOpen() {
    setOpen(v => !v)
    if (!open) loadAlerts()
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={handleOpen}
        aria-label={t('app.topbar.notifications')}
        className="relative w-9 h-9 rounded-lg flex items-center justify-center bg-[var(--surface-raised)] border border-[var(--border)] text-[var(--fg-muted)] hover:text-[var(--fg)] hover:border-[var(--border-strong)] transition-colors duration-200"
      >
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 01-3.46 0"/>
        </svg>
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-[var(--color-error)] border-2 border-[var(--surface)] flex items-center justify-center text-[9px] font-bold text-white px-1">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-11 z-50 w-80 bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-[var(--shadow-lg)] overflow-hidden">
            <div className="px-4 py-3 border-b border-[var(--border)] flex items-center justify-between">
              <span className="text-sm font-semibold text-[var(--fg)]">{t('app.topbar.notifications')}</span>
              {unread > 0 && (
                <button onClick={handleMarkAllRead}
                  className="text-xs font-medium text-[var(--accent)] hover:underline">
                  Marcar leídas
                </button>
              )}
            </div>

            <div className="divide-y divide-[var(--border)] max-h-72 overflow-y-auto">
              {loading && alerts.length === 0 ? (
                <div className="px-4 py-6 text-center text-xs text-[var(--fg-muted)]">Cargando...</div>
              ) : alerts.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <p className="text-2xl mb-2">🎉</p>
                  <p className="text-xs text-[var(--fg-muted)]">Sin alertas pendientes</p>
                </div>
              ) : alerts.map(alert => (
                <div key={alert.id}
                  className={`flex items-start gap-3 px-4 py-3 hover:bg-[var(--surface-raised)] transition-colors cursor-pointer ${!alert.isRead ? '' : 'opacity-60'}`}>
                  <span className="text-lg mt-0.5 shrink-0">{ALERT_ICONS[alert.type] ?? '🔔'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-[var(--fg)] leading-snug line-clamp-2">{alert.title}</p>
                    <p className="text-[10px] text-[var(--fg-subtle)] mt-0.5">{timeAgo(alert.triggeredAt)}</p>
                  </div>
                  {!alert.isRead && <span className="w-2 h-2 rounded-full bg-[var(--accent)] shrink-0 mt-1.5" />}
                </div>
              ))}
            </div>

            <div className="px-4 py-2.5 border-t border-[var(--border)]">
              <Link to="/app/alerts" onClick={() => setOpen(false)}
                className="text-xs font-medium text-[var(--accent)] hover:underline">
                Ver todas las alertas →
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

/* ── Search bar ────────────────────────────────────────────────────────────── */
function SearchBar() {
  const { t } = useTranslation()
  return (
    <div className="hidden sm:flex items-center gap-2 h-9 px-3 rounded-xl bg-[var(--surface-raised)] border border-[var(--border)] text-[var(--fg-subtle)] hover:border-[var(--border-strong)] transition-colors duration-150 w-52 cursor-text">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
      <span className="text-xs">{t('app.topbar.search')}</span>
      <span className="ml-auto text-[10px] border border-[var(--border)] rounded px-1 py-0.5 font-mono">⌘K</span>
    </div>
  )
}

/* ── User dropdown ─────────────────────────────────────────────────────────── */
function UserMenu() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const initials = user
    ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase()
    : '?'

  const fullName = user ? `${user.firstName} ${user.lastName}` : 'Usuario'

  async function handleLogout() {
    setOpen(false)
    await logout()
    navigate('/auth/login', { replace: true })
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2.5 pl-1 pr-2.5 py-1 rounded-xl hover:bg-[var(--surface-raised)] transition-colors duration-150"
      >
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--color-brand-700)] to-[var(--color-brand-400)] flex items-center justify-center text-white text-xs font-bold shadow-sm shrink-0">
          {initials}
        </div>
        <div className="hidden md:block text-left">
          <p className="text-xs font-semibold text-[var(--fg)] leading-none">{user?.firstName ?? 'Usuario'}</p>
          <p className="text-[10px] text-[var(--fg-subtle)] mt-0.5 leading-none">{user?.email ?? ''}</p>
        </div>
        <ChevronDown
          size={14}
          className={`hidden md:block text-[var(--fg-subtle)] transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-64 bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-[var(--shadow-lg)] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-4 py-3.5 border-b border-[var(--border)]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-brand-700)] to-[var(--color-brand-400)] flex items-center justify-center text-white text-sm font-bold shadow-sm shrink-0">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[var(--fg)] truncate">{fullName}</p>
                <p className="text-xs text-[var(--fg-muted)] truncate">{user?.email ?? ''}</p>
              </div>
            </div>
          </div>

          <div className="py-1.5">
            <MenuItem icon={<User size={15} />} label="Mi perfil"
              onClick={() => { navigate('/app/settings'); setOpen(false) }} />
            <MenuItem icon={<Settings size={15} />} label="Configuración"
              onClick={() => { navigate('/app/settings'); setOpen(false) }} />
          </div>

          <div className="border-t border-[var(--border)] py-1.5">
            <MenuItem icon={<LogOut size={15} />} label="Cerrar sesión" onClick={handleLogout} danger />
          </div>
        </div>
      )}
    </div>
  )
}

function MenuItem({ icon, label, onClick, danger = false }) {
  return (
    <button onClick={onClick}
      className={[
        'w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors duration-150 text-left',
        danger
          ? 'text-[var(--color-error)] hover:bg-[var(--color-error-light)]'
          : 'text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--surface-raised)]',
      ].join(' ')}
    >
      <span className="shrink-0">{icon}</span>
      {label}
    </button>
  )
}

/* ── Topbar ────────────────────────────────────────────────────────────────── */
export default function AppTopbar({ onMenuClick }) {
  return (
    <header className="h-14 shrink-0 bg-transparent flex items-center gap-3 px-4 lg:px-6 sticky top-0 z-30">
      <button
        onClick={onMenuClick}
        className="lg:hidden w-9 h-9 rounded-lg flex items-center justify-center text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--surface-raised)] transition-colors"
        aria-label="Open menu"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
      </button>

      <SearchBar />

      <div className="ml-auto flex items-center gap-2">
        <LangToggle />
        <ThemeToggle />
        <NotificationBell />
        <div className="w-px h-6 bg-[var(--border)] mx-1" />
        <UserMenu />
      </div>
    </header>
  )
}
