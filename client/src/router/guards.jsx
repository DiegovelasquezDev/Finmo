import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../shared/context/AuthContext'

/** Rutas privadas — redirige a login si no hay sesión */
export function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()

  if (loading) return <FullScreenSpinner />
  if (!isAuthenticated) return <Navigate to="/auth/login" state={{ from: location.pathname }} replace />
  return children
}

/** Rutas de invitado — redirige al app si ya hay sesión */
export function GuestRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) return <FullScreenSpinner />
  if (isAuthenticated) return <Navigate to="/app" replace />
  return children
}

function FullScreenSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-base)' }}>
      <svg className="animate-spin h-8 w-8" viewBox="0 0 24 24" fill="none"
           style={{ color: 'var(--color-brand-500)' }}>
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
      </svg>
    </div>
  )
}
