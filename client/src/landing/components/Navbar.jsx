import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { ButtonPrimary } from './ui/Button'
import ThemeToggle from '../../shared/components/ThemeToggle'
import LangToggle  from '../../shared/components/LangToggle'

export default function Navbar() {
  const { t } = useTranslation()
  const [scrolled,  setScrolled]  = useState(false)
  const [menuOpen,  setMenuOpen]  = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const NAV_LINKS = [
    { label: t('nav.features'),   href: '#features'    },
    { label: t('nav.howItWorks'), href: '#how-it-works' },
    { label: t('nav.metrics'),    href: '#metrics'     },
    { label: t('nav.team'),       href: '#team'        },
  ]

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[var(--nav-bg)] backdrop-blur-md shadow-[0_1px_20px_-4px_rgb(0_0_0_/_0.12)] border-b border-[var(--nav-border)]'
          : 'bg-transparent'
      }`}
    >
      <div className="mx-auto max-w-[1200px] px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-[#5d4573] flex items-center justify-center shadow-[0_2px_8px_rgb(93_69_115_/_0.35)]">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 2L13 5.5V10.5L8 14L3 10.5V5.5L8 2Z" fill="white" fillOpacity="0.9"/>
              <path d="M8 5L10.5 6.5V9.5L8 11L5.5 9.5V6.5L8 5Z" fill="white"/>
            </svg>
          </div>
          <span className="font-semibold text-lg text-[var(--fg)] tracking-tight">Finmo</span>
        </a>

        {/* Desktop nav links */}
        <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
          {NAV_LINKS.map(link => (
            <a
              key={link.href}
              href={link.href}
              className="px-4 py-2 rounded-lg text-sm text-[var(--fg-muted)] hover:text-[var(--accent)] hover:bg-[var(--accent-subtle)] transition-all duration-150 font-medium"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Desktop right actions */}
        <div className="hidden md:flex items-center gap-2 shrink-0">
          <LangToggle />
          <ThemeToggle />
          <a
            href="/app"
            className="text-sm font-medium text-[var(--fg-muted)] hover:text-[var(--accent)] transition-colors duration-150 px-2"
          >
            {t('nav.signIn')}
          </a>
          <ButtonPrimary href="/app" className="!py-2.5 !px-5 !text-sm">
            {t('nav.getStarted')}
          </ButtonPrimary>
        </div>

        {/* Mobile right — toggles + burger */}
        <div className="md:hidden flex items-center gap-2">
          <LangToggle />
          <ThemeToggle />
          <button
            onClick={() => setMenuOpen(v => !v)}
            className="w-9 h-9 flex flex-col items-center justify-center gap-1.5 rounded-lg hover:bg-[var(--surface-raised)] transition-colors"
            aria-label="Toggle menu"
          >
            <span className={`block w-5 h-0.5 bg-[var(--fg)] rounded transition-all duration-200 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block w-5 h-0.5 bg-[var(--fg)] rounded transition-all duration-200 ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-5 h-0.5 bg-[var(--fg)] rounded transition-all duration-200 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-[var(--surface)] border-b border-[var(--border)] px-6 pb-6 pt-2 flex flex-col gap-1">
          {NAV_LINKS.map(link => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="px-3 py-2.5 rounded-lg text-sm font-medium text-[var(--fg-muted)] hover:text-[var(--accent)] hover:bg-[var(--accent-subtle)] transition-all"
            >
              {link.label}
            </a>
          ))}
          <div className="mt-4 pt-4 border-t border-[var(--border)] flex flex-col gap-2">
            <a
              href="/app"
              className="text-sm font-medium text-center text-[var(--fg-muted)] py-2"
            >
              {t('nav.signIn')}
            </a>
            <ButtonPrimary href="/app">{t('nav.getStarted')}</ButtonPrimary>
          </div>
        </div>
      )}
    </header>
  )
}
