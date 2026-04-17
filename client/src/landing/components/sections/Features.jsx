import { useTranslation } from 'react-i18next'
import { useReveal } from '../../../shared/hooks/useReveal'
import { SectionLabel } from '../ui/SectionLabel'

const ICONS = [
  <svg key="1" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
    <rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>
  </svg>,
  <svg key="2" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>
    <circle cx="18" cy="5" r="3" fill="#ef4444" stroke="none"/>
  </svg>,
  <svg key="3" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
  </svg>,
  <svg key="4" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>,
  <svg key="5" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>
  </svg>,
  <svg key="6" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
  </svg>,
]

export default function Features() {
  const { t }    = useTranslation()
  const titleRef = useReveal()

  const FEATURES = [
    { icon: ICONS[0], titleKey: 'f1Title', descKey: 'f1Desc', highlight: false },
    { icon: ICONS[1], titleKey: 'f2Title', descKey: 'f2Desc', highlight: true  },
    { icon: ICONS[2], titleKey: 'f3Title', descKey: 'f3Desc', highlight: false },
    { icon: ICONS[3], titleKey: 'f4Title', descKey: 'f4Desc', highlight: false },
    { icon: ICONS[4], titleKey: 'f5Title', descKey: 'f5Desc', highlight: false },
    { icon: ICONS[5], titleKey: 'f6Title', descKey: 'f6Desc', highlight: false },
  ]

  return (
    <section id="features" className="bg-[var(--bg-subtle)] py-24 border-y border-[var(--border)]">
      <div className="mx-auto max-w-[1200px] px-6">
        <div ref={titleRef} className="reveal text-center mb-14">
          <SectionLabel>{t('features.label')}</SectionLabel>
          <h2 className="mt-4 font-heading text-3xl md:text-4xl font-bold text-[var(--fg)] tracking-tight">
            {t('features.headline')}
          </h2>
          <p className="mt-4 text-[var(--fg-muted)] max-w-xl mx-auto">
            {t('features.sub')}
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => (
            <FeatureCard
              key={i}
              icon={f.icon}
              title={t(`features.${f.titleKey}`)}
              desc={t(`features.${f.descKey}`)}
              highlight={f.highlight}
              delay={(i % 3) + 1}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

function FeatureCard({ icon, title, desc, highlight, delay }) {
  const ref = useReveal()
  return (
    <div
      ref={ref}
      className={`reveal reveal-delay-${delay} group relative rounded-2xl p-7 border transition-all duration-300 cursor-default hover:-translate-y-1 ${
        highlight
          ? 'bg-[var(--accent)] border-[var(--accent-hover)] text-white shadow-[var(--shadow-brand)]'
          : 'bg-[var(--surface)] border-[var(--border)] shadow-sm hover:shadow-md hover:border-[var(--accent-border)]'
      }`}
    >
      <div
        className={`w-11 h-11 rounded-xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110 ${
          highlight ? 'bg-white/15 text-white' : 'bg-[var(--accent-subtle)] text-[var(--accent)]'
        }`}
      >
        {icon}
      </div>
      <h3 className={`font-semibold text-base mb-2 ${highlight ? 'text-white' : 'text-[var(--fg)]'}`}>
        {title}
      </h3>
      <p className={`text-sm leading-relaxed ${highlight ? 'text-white/80' : 'text-[var(--fg-muted)]'}`}>
        {desc}
      </p>
      {highlight && (
        <span className="absolute top-4 right-4 text-[10px] font-semibold bg-white/20 text-white px-2 py-0.5 rounded-full">
          ✦ AI
        </span>
      )}
    </div>
  )
}
