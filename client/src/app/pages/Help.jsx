import { useState } from 'react'
import { useTranslation } from 'react-i18next'

const FAQ_KEYS = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8']

/* ── Accordion item ──────────────────────────────────────────────────────────── */
function Accordion({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-[var(--border)] last:border-0">
      <button onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-[var(--surface-raised)] transition-colors">
        <span className="text-sm font-medium text-[var(--fg)]">{q}</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
          className={`shrink-0 text-[var(--fg-muted)] transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>
      {open && (
        <div className="px-5 pb-4">
          <p className="text-sm text-[var(--fg-muted)] leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  )
}

/* ── Main page ───────────────────────────────────────────────────────────────── */
export default function Help() {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')

  const faqs = FAQ_KEYS.map(k => ({ q: t(`app.help.${k}`), a: t(`app.help.a${k.slice(1)}`) }))
  const filtered = faqs.filter(f =>
    f.q.toLowerCase().includes(search.toLowerCase()) ||
    f.a.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-[var(--fg)]">{t('app.help.title')}</h1>
        <p className="text-sm text-[var(--fg-muted)] mt-0.5">{t('app.help.subtitle')}</p>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 h-11 px-4 rounded-2xl bg-[var(--surface)] border border-[var(--border)] focus-within:border-[var(--accent-border)] transition-colors">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--fg-subtle)] shrink-0">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t('app.help.searchPlaceholder')}
          className="flex-1 bg-transparent text-sm text-[var(--fg)] outline-none placeholder:text-[var(--fg-subtle)]" />
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5">
          <div className="w-10 h-10 rounded-xl bg-[var(--accent-subtle)] flex items-center justify-center mb-3">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.7" strokeLinecap="round">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
          </div>
          <p className="text-sm font-semibold text-[var(--fg)] mb-1">{t('app.help.docsTitle')}</p>
          <p className="text-xs text-[var(--fg-muted)] mb-3">{t('app.help.docsDesc')}</p>
          <button className="text-xs font-semibold text-[var(--accent)] hover:underline">{t('app.help.docsBtn')} →</button>
        </div>
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5">
          <div className="w-10 h-10 rounded-xl bg-[var(--accent-subtle)] flex items-center justify-center mb-3">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.7" strokeLinecap="round">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
            </svg>
          </div>
          <p className="text-sm font-semibold text-[var(--fg)] mb-1">{t('app.help.contactTitle')}</p>
          <p className="text-xs text-[var(--fg-muted)] mb-3">{t('app.help.contactDesc')}</p>
          <button className="text-xs font-semibold text-[var(--accent)] hover:underline">{t('app.help.contactBtn')} →</button>
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[var(--border)]">
          <h2 className="text-sm font-semibold text-[var(--fg)]">{t('app.help.faqTitle')}</h2>
        </div>
        {filtered.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-[var(--fg-muted)]">No results found for "{search}"</div>
        ) : (
          filtered.map((f, i) => <Accordion key={i} q={f.q} a={f.a} />)
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-[var(--fg-subtle)]">
        <span>{t('app.help.versionLabel')}: 0.1.0-beta</span>
        <button className="text-[var(--accent)] font-medium hover:underline">{t('app.help.feedbackBtn')}</button>
      </div>
    </div>
  )
}
