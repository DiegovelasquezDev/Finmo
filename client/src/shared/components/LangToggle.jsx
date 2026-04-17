import { useTranslation } from 'react-i18next'

const LANGS = [
  { code: 'en', label: 'EN', flag: '🇺🇸' },
  { code: 'es', label: 'ES', flag: '🇪🇸' },
]

export default function LangToggle({ className = '' }) {
  const { i18n } = useTranslation()
  const current = i18n.resolvedLanguage ?? i18n.language ?? 'en'

  const toggle = () => {
    const next = current.startsWith('es') ? 'en' : 'es'
    i18n.changeLanguage(next)
  }

  const nextLang = LANGS.find(l => !current.startsWith(l.code)) ?? LANGS[0]

  return (
    <button
      onClick={toggle}
      aria-label={`Switch to ${nextLang.label}`}
      className={`relative h-9 px-2.5 rounded-lg flex items-center gap-1.5 transition-colors duration-200
        bg-[var(--surface-raised)] border border-[var(--border)] text-[var(--fg-muted)]
        hover:text-[var(--fg)] hover:border-[var(--border-strong)] text-xs font-semibold tracking-wide ${className}`}
    >
      <span>{current.startsWith('es') ? '🇪🇸' : '🇺🇸'}</span>
      <span>{current.startsWith('es') ? 'ES' : 'EN'}</span>
    </button>
  )
}
