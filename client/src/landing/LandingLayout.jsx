import { Outlet } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'

export default function LandingLayout() {
  return (
    <div className="flex flex-col min-h-svh bg-[var(--bg)] text-[var(--fg)]">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
