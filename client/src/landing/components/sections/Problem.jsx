import { useTranslation } from 'react-i18next'
import { useReveal } from '../../../shared/hooks/useReveal'
import { SectionLabel } from '../ui/SectionLabel'

function getProblems(t) {
  return [
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
        </svg>
      ),
      title: t('problem.card1Title'),
      desc:  t('problem.card1Desc'),
      bg:    'var(--color-warning-light)',
      iconColor: '#f59e0b',
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 17h.01"/>
        </svg>
      ),
      title: t('problem.card2Title'),
      desc:  t('problem.card2Desc'),
      bg:    'var(--color-error-light)',
      iconColor: '#ef4444',
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
          <line x1="12" y1="9" x2="12" y2="13"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
      ),
      title: t('problem.card3Title'),
      desc:  t('problem.card3Desc'),
      bg:    'var(--accent-subtle)',
      iconColor: 'var(--accent)',
    },
  ]
}

export default function Problem() {
  const { t }    = useTranslation()
  const titleRef = useReveal()
  const problems = getProblems(t)

  return (
    <section className="bg-[var(--bg-subtle)] py-24 border-y border-[var(--border)]">
      <div className="mx-auto max-w-[1200px] px-6">
        <div ref={titleRef} className="reveal text-center mb-14">
          <SectionLabel>{t('problem.label')}</SectionLabel>
          <h2 className="mt-4 font-heading text-3xl md:text-4xl font-bold text-[var(--fg)] tracking-tight">
            {t('problem.headline')}
          </h2>
          <p className="mt-4 text-[var(--fg-muted)] max-w-xl mx-auto">
            {t('problem.sub')}
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {problems.map((p, i) => <ProblemCard key={i} {...p} delay={i} />)}
        </div>
      </div>
    </section>
  )
}

function ProblemCard({ icon, title, desc, bg, iconColor, delay }) {
  const ref = useReveal()
  return (
    <div
      ref={ref}
      className={`reveal reveal-delay-${delay + 1} group bg-[var(--surface)] rounded-2xl p-7 border border-[var(--border)] shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-default`}
    >
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110"
        style={{ background: bg, color: iconColor }}
      >
        {icon}
      </div>
      <h3 className="font-semibold text-[var(--fg)] text-lg leading-snug mb-3">{title}</h3>
      <p className="text-sm text-[var(--fg-muted)] leading-relaxed">{desc}</p>
    </div>
  )
}
