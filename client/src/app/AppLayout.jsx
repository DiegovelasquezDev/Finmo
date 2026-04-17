import { useState, useEffect } from 'react'
import { Outlet, Navigate } from 'react-router-dom'
import AppSidebar, { SidebarContent } from './components/AppSidebar'
import AppTopbar from './components/AppTopbar'
import { useAuth } from '../shared/context/AuthContext'

/* ── Mobile sidebar drawer ──────────────────────────────────────────────────── */
function MobileDrawer({ open, onClose }) {
  // Lock body scroll while open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      {/* Drawer panel */}
      <div
        className={`fixed top-0 left-0 z-50 h-full w-72 bg-[var(--surface)] border-r border-[var(--border)] shadow-[var(--shadow-xl)] transition-transform duration-300 ease-in-out lg:hidden ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <SidebarContent onClose={onClose} />
      </div>
    </>
  )
}

/* ── App shell ──────────────────────────────────────────────────────────────── */
export default function AppLayout() {
  const { needsOnboarding } = useAuth()
  const [drawerOpen, setDrawerOpen] = useState(false)

  if (needsOnboarding) return <Navigate to="/onboarding" replace />

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg-subtle)] text-[var(--fg)]">
      {/* Desktop sidebar — sticky, full height */}
      <AppSidebar />

      {/* Mobile drawer */}
      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      {/* Main column */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Sticky topbar */}
        <AppTopbar onMenuClick={() => setDrawerOpen(true)} />

        {/* Scrollable content area */}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-[1100px] px-4 py-6 md:px-6 md:py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
