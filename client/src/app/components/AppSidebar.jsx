import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { NavLink } from 'react-router-dom'

/* ── Shared icon component ──────────────────────────────────────────────────── */
const Icon = ({ children, size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
)

const ICONS = {
  dashboard:    <Icon><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></Icon>,
  transactions: <Icon><path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4"/></Icon>,
  goals:        <Icon><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></Icon>,
  alerts:       <Icon><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></Icon>,
  analysis:     <Icon><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></Icon>,
  reports:      <Icon><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></Icon>,
  settings:     <Icon><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></Icon>,
  help:         <Icon><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></Icon>,
  logout:       <Icon><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></Icon>,
  collapse:     <Icon><polyline points="15 18 9 12 15 6"/></Icon>,
  expand:       <Icon><polyline points="9 18 15 12 9 6"/></Icon>,
  close:        <Icon><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></Icon>,
}

const PRIMARY_NAV = [
  { to: '/app',                  icon: 'dashboard',    key: 'dashboard'    },
  { to: '/app/transactions',     icon: 'transactions', key: 'transactions' },
  { to: '/app/goals',            icon: 'goals',        key: 'goals'        },
  { to: '/app/alerts',           icon: 'alerts',       key: 'alerts',       badge: 2 },
  { to: '/app/analysis',         icon: 'analysis',     key: 'analysis'     },
  // { to: '/app/reports',          icon: 'reports',      key: 'reports'      },
]

const BOTTOM_NAV = [
  { to: '/app/settings', icon: 'settings', key: 'settings' },
  { to: '/app/help',     icon: 'help',     key: 'help'     },
]

/* ── Nav item ───────────────────────────────────────────────────────────────── */
function NavItem({ to, iconKey, label, badge, collapsed, onClick }) {
  const base = `
    group relative flex items-center gap-3 rounded-xl text-sm font-medium
    transition-all duration-150 cursor-pointer
    ${collapsed ? 'justify-center px-0 py-2.5 w-10 mx-auto' : 'px-3 py-2.5'}
  `
  const activeClass  = 'bg-[var(--accent-subtle)] text-[var(--accent)]'
  const idleClass    = 'text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--surface-overlay)]'

  const content = (
    <>
      <span className="shrink-0 relative">
        {ICONS[iconKey]}
        {badge > 0 && (
          <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[var(--accent)] text-white text-[9px] font-bold flex items-center justify-center">
            {badge}
          </span>
        )}
      </span>
      {!collapsed && <span className="truncate">{label}</span>}

      {/* Tooltip when collapsed */}
      {collapsed && (
        <span className="pointer-events-none absolute left-full ml-3 px-2.5 py-1.5 rounded-lg bg-[var(--fg)] text-[var(--bg-base)] text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-50 shadow-lg">
          {label}
        </span>
      )}
    </>
  )

  if (to) {
    return (
      <NavLink
        to={to}
        end={to === '/app'}
        className={({ isActive }) => `${base} ${isActive ? activeClass : idleClass}`}
        onClick={onClick}
        title={collapsed ? label : undefined}
      >
        {content}
      </NavLink>
    )
  }

  return (
    <button onClick={onClick} className={`w-full ${base} ${idleClass}`} title={collapsed ? label : undefined}>
      {content}
    </button>
  )
}

/* ── Sidebar content ─────────────────────────────────────────────────────────── */
export function SidebarContent({ collapsed = false, onCollapse, onClose }) {
  const { t } = useTranslation()

  return (
    <div className={`flex flex-col h-full transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`}>

      {/* Logo row */}
      <div className={`flex items-center border-b border-[var(--border)] h-14 shrink-0 overflow-hidden ${collapsed ? 'justify-center px-0' : 'px-4 gap-2.5'}`}>
        {/* Logo mark — always visible */}
        <div className="w-8 h-8 rounded-lg bg-[#5d4573] flex items-center justify-center shadow-sm shrink-0">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 2L13 5.5V10.5L8 14L3 10.5V5.5L8 2Z" fill="white" fillOpacity="0.9"/>
            <path d="M8 5L10.5 6.5V9.5L8 11L5.5 9.5V6.5L8 5Z" fill="white"/>
          </svg>
        </div>

        {/* Wordmark — hidden when collapsed */}
        {!collapsed && (
          <span className="font-semibold text-base text-[var(--fg)] tracking-tight flex-1">Finmo</span>
        )}



        {/* Mobile close button */}
        {onClose && (
          <button
            onClick={onClose}
            className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--surface-overlay)] transition-colors"
          >
            {ICONS.close}
          </button>
        )}
      </div>

      {/* Primary nav */}
      <nav className={`flex-1 overflow-y-auto overflow-x-hidden py-3 flex flex-col gap-0.5 ${collapsed ? 'px-2' : 'px-3'}`}>
        {PRIMARY_NAV.map(item => (
          <NavItem
            key={item.key}
            to={item.to}
            iconKey={item.icon}
            label={t(`app.sidebar.${item.key}`)}
            badge={item.badge}
            collapsed={collapsed}
            onClick={onClose}
          />
        ))}
      </nav>

      {/* Divider */}
      <div className="mx-3 h-px bg-[var(--border)]" />

      {/* Bottom nav */}
      <div className={`py-3 flex flex-col gap-0.5 ${collapsed ? 'px-2' : 'px-3'}`}>
        {BOTTOM_NAV.map(item => (
          <NavItem
            key={item.key}
            to={item.to}
            iconKey={item.icon}
            label={t(`app.sidebar.${item.key}`)}
            collapsed={collapsed}
            onClick={onClose}
          />
        ))}
        <NavItem
          iconKey="logout"
          label={t('app.sidebar.logout')}
          collapsed={collapsed}
          onClick={() => { onClose?.(); window.location.href = '/' }}
        />
      </div>
    </div>
  )
}

/* ── Desktop sidebar (manages own collapse state) ────────────────────────────── */
export default function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className={`hidden lg:block shrink-0 relative h-screen sticky top-0 transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`}>
      <aside
        className="flex flex-col h-full border-r border-[var(--border)] bg-[var(--surface)] overflow-hidden"
      >
        <SidebarContent
          collapsed={collapsed}
        />
      </aside>

      {/* Floating collapse toggle on sidebar edge */}
      <button
        onClick={() => setCollapsed(v => !v)}
        className="absolute top-5 -right-3 z-50 w-6 h-6 rounded-full border border-[var(--border)] bg-[var(--surface)] flex items-center justify-center text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--surface-overlay)] shadow-sm transition-colors"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {collapsed ? <polyline points="9 18 15 12 9 6"/> : <polyline points="15 18 9 12 15 6"/>}
        </svg>
      </button>
    </div>
  )
}
