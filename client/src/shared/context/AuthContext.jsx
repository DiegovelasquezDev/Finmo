import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { api } from '../lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)  // hidrata desde localStorage

  // Rehidratar sesión al montar, y refrescar perfil desde el servidor
  useEffect(() => {
    const stored = localStorage.getItem('finmo-user')
    if (stored) {
      try { setUser(JSON.parse(stored)) } catch { /* ignore */ }
    }

    const token = localStorage.getItem('finmo-access-token')
    if (token) {
      api.get('/users/me')
        .then(res => {
          const fresh = res.data?.user
          if (fresh) {
            localStorage.setItem('finmo-user', JSON.stringify(fresh))
            setUser(fresh)
          }
        })
        .catch(() => { /* token inválido — el interceptor maneja el redirect */ })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  // Escuchar expiración de sesión desde el api client
  useEffect(() => {
    const handler = () => {
      setUser(null)
      localStorage.removeItem('finmo-user')
    }
    window.addEventListener('finmo:session-expired', handler)
    return () => window.removeEventListener('finmo:session-expired', handler)
  }, [])

  const saveSession = useCallback(({ accessToken, refreshToken, user }) => {
    localStorage.setItem('finmo-access-token', accessToken)
    localStorage.setItem('finmo-refresh-token', refreshToken)
    localStorage.setItem('finmo-user', JSON.stringify(user))
    setUser(user)
  }, [])

  const login = useCallback(async ({ email, password }) => {
    const { data } = await api.post('/auth/login', { email, password })
    saveSession(data)
    return data.user
  }, [saveSession])

  const register = useCallback(async ({ firstName, lastName, email, password }) => {
    const { data } = await api.post('/auth/register', { firstName, lastName, email, password })
    return data.user
  }, [])

  const logout = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem('finmo-refresh-token')
      await api.post('/auth/logout', { refreshToken })
    } catch { /* si falla igual limpiamos */ }
    localStorage.removeItem('finmo-access-token')
    localStorage.removeItem('finmo-refresh-token')
    localStorage.removeItem('finmo-user')
    setUser(null)
  }, [])

  const updateUser = useCallback((partial) => {
    setUser(prev => {
      const updated = { ...prev, ...partial }
      localStorage.setItem('finmo-user', JSON.stringify(updated))
      return updated
    })
  }, [])

  const forgotPassword = useCallback(async (email) => {
    await api.post('/auth/forgot-password', { email })
  }, [])

  const resetPassword = useCallback(async ({ token, password }) => {
    await api.post('/auth/reset-password', { token, password })
  }, [])

  const verifyEmail = useCallback(async (token) => {
    await api.get(`/auth/verify-email?token=${token}`)
  }, [])

  // onboardingStep < 5 significa que el usuario NO ha completado el onboarding
  const needsOnboarding = !!user && (user.onboardingStep ?? 0) < 5

  const completeOnboardingStep = useCallback((stepData) => {
    // Actualiza el onboardingStep localmente tras guardar cada paso
    updateUser({ onboardingStep: stepData.onboardingStep ?? user?.onboardingStep })
  }, [updateUser, user])

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isAuthenticated: !!user,
      needsOnboarding,
      login,
      register,
      logout,
      updateUser,
      completeOnboardingStep,
      forgotPassword,
      resetPassword,
      verifyEmail,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
