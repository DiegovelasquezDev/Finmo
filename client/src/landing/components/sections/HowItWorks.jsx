import { useTranslation } from 'react-i18next'
import { useReveal } from '../../../shared/hooks/useReveal'
import { SectionLabel } from '../ui/SectionLabel'

const ICONS = [
  <svg key="1" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>
  </svg>,
  <svg key="2" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a10 10 0 110 20A10 10 0 0112 2z"/><path d="M12 6v6l4 2"/>
  </svg>,
  <svg key="3" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>
  </svg>,
  <svg key="4" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>
  </svg>,
]

export default function HowItWorks() {
  const { t }    = useTranslation()
  const titleRef = useReveal()

  const STEPS = [
    { number: '01', title: t('howItWorks.step1Title'), desc: t('howItWorks.step1Desc'), icon: ICONS[0] },
    { number: '02', title: t('howItWorks.step2Title'), desc: t('howItWorks.step2Desc'), icon: ICONS[1] },
    { number: '03', title: t('howItWorks.step3Title'), desc: t('howItWorks.step3Desc'), icon: ICONS[2] },
    { number: '04', title: t('howItWorks.step4Title'), desc: t('howItWorks.step4Desc'), icon: ICONS[3] },
  ]

  return (
    <section id="how-it-works" className="bg-[var(--bg-base)] py-24">
      <div className="mx-auto max-w-[1200px] px-6">
        <div ref={titleRef} className="reveal text-center mb-16">
          <SectionLabel>{t('howItWorks.label')}</SectionLabel>
          <h2 className="mt-4 font-heading text-3xl md:text-4xl font-bold text-[var(--fg)] tracking-tight">
            {t('howItWorks.headline')}
          </h2>
          <p className="mt-4 text-[var(--fg-muted)] max-w-xl mx-auto">
            {t('howItWorks.sub')}
          </p>
        </div>
        <div className="relative">
          <div className="hidden md:block absolute top-10 left-[calc(12.5%-8px)] right-[calc(12.5%-8px)] h-px bg-gradient-to-r from-transparent via-[var(--accent-border)] to-transparent" />
          <div className="grid md:grid-cols-4 gap-8">
            {STEPS.map((step, i) => <StepCard key={i} {...step} delay={i} />)}
          </div>
        </div>
      </div>
    </section>
  )
}

function StepCard({ number, title, desc, icon, delay }) {
  const ref = useReveal()
  return (
    <div ref={ref} className={`reveal reveal-delay-${delay + 1} flex flex-col items-center text-center`}>
      <div className="relative mb-6">
        <div className="w-16 h-16 rounded-2xl bg-[var(--accent-subtle)] border border-[var(--accent-border)]/40 flex items-center justify-center text-[var(--accent)] shadow-sm transition-shadow">
          {icon}
        </div>
        <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[var(--accent)] text-white text-[10px] font-bold flex items-center justify-center shadow">
          {number.slice(1)}
        </span>
      </div>
      <h3 className="font-semibold text-[var(--fg)] text-base mb-2 leading-snug">{title}</h3>
      <p className="text-sm text-[var(--fg-muted)] leading-relaxed">{desc}</p>
    </div>
  )
}
