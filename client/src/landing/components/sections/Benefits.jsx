import { useTranslation } from 'react-i18next'
import { useReveal } from '../../../shared/hooks/useReveal'
import { SectionLabel } from '../ui/SectionLabel'

const ICON_DATA = [
  { icon: <svg key="1" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    bg: 'var(--color-success-light)', iconColor: '#10b981' },
  { icon: <svg key="2" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
    bg: 'var(--color-info-light)', iconColor: '#3b82f6' },
  { icon: <svg key="3" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12l2 2 4-4"/><path d="M21 12c0 4.97-4.03 9-9 9S3 16.97 3 12 7.03 3 12 3s9 4.03 9 9z"/></svg>,
    bg: 'var(--accent-subtle)', iconColor: 'var(--accent)' },
  { icon: <svg key="4" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>,
    bg: 'var(--color-warning-light)', iconColor: '#f59e0b' },
]

export default function Benefits() {
  const { t }    = useTranslation()
  const titleRef = useReveal()

  const BENEFITS = [
    { ...ICON_DATA[0], titleKey: 'b1Title', descKey: 'b1Desc' },
    { ...ICON_DATA[1], titleKey: 'b2Title', descKey: 'b2Desc' },
    { ...ICON_DATA[2], titleKey: 'b3Title', descKey: 'b3Desc' },
    { ...ICON_DATA[3], titleKey: 'b4Title', descKey: 'b4Desc' },
  ]

  return (
    <section className="bg-[var(--bg-base)] py-24">
      <div className="mx-auto max-w-[1200px] px-6">
        <div ref={titleRef} className="reveal text-center mb-16">
          <SectionLabel>{t('benefits.label')}</SectionLabel>
          <h2 className="mt-4 font-heading text-3xl md:text-4xl font-bold text-[var(--fg)] tracking-tight">
            {t('benefits.headline')}
          </h2>
          <p className="mt-4 text-[var(--fg-muted)] max-w-xl mx-auto">
            {t('benefits.sub')}
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {BENEFITS.map((b, i) => (
            <BenefitCard
              key={i}
              icon={b.icon}
              title={t(`benefits.${b.titleKey}`)}
              desc={t(`benefits.${b.descKey}`)}
              bg={b.bg}
              iconColor={b.iconColor}
              delay={i + 1}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

function BenefitCard({ icon, title, desc, bg, iconColor, delay }) {
  const ref = useReveal()
  return (
    <div
      ref={ref}
      className={`reveal reveal-delay-${delay} group flex flex-col items-center text-center p-8 rounded-2xl border border-[var(--border)] bg-[var(--surface)] hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-default`}
    >
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110"
        style={{ background: bg, color: iconColor }}
      >
        {icon}
      </div>
      <h3 className="font-semibold text-[var(--fg)] text-base mb-2">{title}</h3>
      <p className="text-sm text-[var(--fg-muted)] leading-relaxed">{desc}</p>
    </div>
  )
}
