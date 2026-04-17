import { createBrowserRouter, RouterProvider } from 'react-router-dom'

// ─── Landing ──────────────────────────────────────────────────────────────────
import LandingLayout    from '../landing/LandingLayout'
import HomePage         from '../landing/pages/HomePage'
import PrivacyPage      from '../landing/pages/PrivacyPage'
import TermsPage        from '../landing/pages/TermsPage'

// ─── Onboarding ───────────────────────────────────────────────────────────────
import OnboardingPage  from '../onboarding/OnboardingPage'

// ─── Auth ─────────────────────────────────────────────────────────────────────
import AuthLayout       from '../auth/AuthLayout'
import LoginPage        from '../auth/pages/LoginPage'
import RegisterPage     from '../auth/pages/RegisterPage'
import ForgotPasswordPage from '../auth/pages/ForgotPasswordPage'
import ResetPasswordPage  from '../auth/pages/ResetPasswordPage'
import VerifyEmailPage    from '../auth/pages/VerifyEmailPage'
import CheckEmailPage     from '../auth/pages/CheckEmailPage'

// ─── App (zona autenticada) ───────────────────────────────────────────────────
import AppLayout        from '../app/AppLayout'
import Dashboard        from '../app/pages/Dashboard'
import Transactions     from '../app/pages/Transactions'
import Goals            from '../app/pages/Goals'
import Alerts           from '../app/pages/Alerts'
import Analysis         from '../app/pages/Analysis'
import Reports          from '../app/pages/Reports'
import Settings         from '../app/pages/Settings'
import Help             from '../app/pages/Help'

// ─── Guards ───────────────────────────────────────────────────────────────────
import { ProtectedRoute, GuestRoute } from './guards'

const router = createBrowserRouter([

  // ── Landing pública ─────────────────────────────────────────────────────────
  {
    path: '/',
    element: <LandingLayout />,
    children: [
      { index: true,      element: <HomePage /> },
      { path: 'privacy',  element: <PrivacyPage /> },
      { path: 'terms',    element: <TermsPage /> },
    ],
  },

  // ── Auth (solo para invitados, redirige si ya está logueado) ─────────────────
  {
    path: '/auth',
    element: <GuestRoute><AuthLayout /></GuestRoute>,
    children: [
      { index: true,              element: <LoginPage />          },
      { path: 'login',            element: <LoginPage />          },
      { path: 'register',         element: <RegisterPage />       },
      { path: 'forgot-password',  element: <ForgotPasswordPage /> },
      { path: 'reset-password',   element: <ResetPasswordPage />  },
      { path: 'verify-email',     element: <VerifyEmailPage />    },
      { path: 'check-email',      element: <CheckEmailPage />     },
    ],
  },

  // ── Onboarding (requiere auth, antes de entrar al app) ───────────────────────
  {
    path: '/onboarding',
    element: <ProtectedRoute><OnboardingPage /></ProtectedRoute>,
  },

  // ── App privada (requiere autenticación) ─────────────────────────────────────
  {
    path: '/app',
    element: <ProtectedRoute><AppLayout /></ProtectedRoute>,
    children: [
      { index: true,           element: <Dashboard />    },
      { path: 'transactions',  element: <Transactions /> },
      { path: 'goals',         element: <Goals />        },
      { path: 'alerts',        element: <Alerts />       },
      { path: 'analysis',      element: <Analysis />     },
      { path: 'reports',       element: <Reports />      },
      { path: 'settings',      element: <Settings />     },
      { path: 'help',          element: <Help />         },
    ],
  },

])

export default function AppRouter() {
  return <RouterProvider router={router} />
}
