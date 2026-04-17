import { useTranslation } from 'react-i18next'
import { useReveal } from '../../../shared/hooks/useReveal'
import { SectionLabel } from '../ui/SectionLabel'

export default function Metrics() {
  const { t }    = useTranslation()
  const titleRef = useReveal()

  const STATS = [
    { valueKey: 's1Value', labelKey: 's1Label', descKey: 's1Desc' },
    { valueKey: 's2Value', labelKey: 's2Label', descKey: 's2Desc' },
    { valueKey: 's3Value', labelKey: 's3Label', descKey: 's3Desc' },
    { valueKey: 's4Value', labelKey: 's4Label', descKey: 's4Desc' },
  ]

  return (
    <section id="metrics" className="bg-[var(--bg-base)] py-24">
      <div className="mx-auto max-w-[1200px] px-6">
        <div ref={titleRef} className="reveal text-center mb-16">
          <SectionLabel>{t('metrics.label')}</SectionLabel>
          <h2 className="mt-4 font-heading text-3xl md:text-4xl font-bold text-[var(--fg)] tracking-tight">
            {t('metrics.headline')}
          </h2>
          <p className="mt-4 text-[var(--fg-muted)] max-w-xl mx-auto">
            {t('metrics.sub')}
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STATS.map((s, i) => (
            <StatCard
              key={i}
              value={t(`metrics.${s.valueKey}`)}
              label={t(`metrics.${s.labelKey}`)}
              desc={t(`metrics.${s.descKey}`)}
              delay={i + 1}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

function StatCard({ value, label, desc, delay }) {
  const ref = useReveal()
  return (
    <div
      ref={ref}
      className={`reveal reveal-delay-${delay} group text-center p-7 rounded-2xl border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent-border)] hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-default`}
    >
      <div className="font-heading text-5xl font-bold gradient-text mb-3 transition-transform duration-300 group-hover:scale-105">
        {value}
      </div>
      <div className="font-semibold text-[var(--fg)] text-sm mb-2">{label}</div>
      <p className="text-xs text-[var(--fg-subtle)] leading-relaxed">{desc}</p>
    </div>
  )
}
