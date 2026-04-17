import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

export default function PrivacyPage() {
  const { t } = useTranslation()
  const sections = t('legal.privacy.sections', { returnObjects: true })

  return (
    <div className="min-h-[60vh] py-24">
      <div className="mx-auto max-w-3xl px-6">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-[var(--accent)] hover:underline mb-8">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          {t('legal.backHome')}
        </Link>

        <h1 className="font-heading text-3xl md:text-4xl font-bold text-[var(--fg)] tracking-tight mb-2">
          {t('legal.privacy.title')}
        </h1>
        <p className="text-sm text-[var(--fg-muted)] mb-10">
          {t('legal.privacy.lastUpdated')}
        </p>

        <div className="prose-custom flex flex-col gap-8">
          {sections.map((s, i) => (
            <div key={i}>
              <h2 className="text-lg font-semibold text-[var(--fg)] mb-2">{s.heading}</h2>
              <p className="text-sm text-[var(--fg-muted)] leading-relaxed whitespace-pre-line">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
