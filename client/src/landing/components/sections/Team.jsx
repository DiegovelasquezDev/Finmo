import { useTranslation } from 'react-i18next'
import { useReveal } from '../../../shared/hooks/useReveal'
import { SectionLabel } from '../ui/SectionLabel'

const TEAM = [
  { name: 'Jhony Andres Mira Gaviria',         role: 'student', initials: 'JM' },
  { name: 'Estefania Valencia Zapata',          role: 'student', initials: 'EV' },
  { name: 'Diego Alejandro Velasquez Araque',   role: 'student', initials: 'DV' },
  { name: 'Jaime Andres Gutierrez Monsalve',    role: 'advisor', initials: 'JG' },
]

export default function Team() {
  const { t }    = useTranslation()
  const titleRef = useReveal()

  return (
    <section id="team" className="bg-[var(--bg-base)] py-24">
      <div className="mx-auto max-w-[1200px] px-6">
        <div ref={titleRef} className="reveal text-center mb-6">
          <SectionLabel>{t('team.label')}</SectionLabel>
          <h2 className="mt-4 font-heading text-3xl md:text-4xl font-bold text-[var(--fg)] tracking-tight">
            {t('team.headline')}
          </h2>
          <p className="mt-4 text-[var(--fg-muted)] max-w-2xl mx-auto">
            {t('team.sub')}
          </p>
        </div>

        {/* Project title */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[var(--accent-subtle)] border border-[var(--accent-border)]/40 text-sm font-medium text-[var(--accent)]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/>
            </svg>
            {t('team.projectTitle')}
          </div>
        </div>

        {/* Members */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {TEAM.map((m, i) => (
            <MemberCard
              key={i}
              name={m.name}
              initials={m.initials}
              role={m.role === 'advisor' ? t('team.advisor') : t('team.student')}
              isAdvisor={m.role === 'advisor'}
              delay={i + 1}
            />
          ))}
        </div>

        {/* Institution */}
        <div className="mt-12 flex flex-col items-center gap-3">
          <div className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-[var(--surface)] border border-[var(--border)]">
            <div className="w-10 h-10 rounded-xl bg-[#5d4573] flex items-center justify-center shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 1.1 2.7 2 6 2s6-.9 6-2v-5"/>
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--fg)]">{t('team.institution')}</p>
              <p className="text-xs text-[var(--fg-muted)]">{t('team.program')} — 2026</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function MemberCard({ name, initials, role, isAdvisor, delay }) {
  const ref = useReveal()
  return (
    <div
      ref={ref}
      className={`reveal reveal-delay-${delay} group flex flex-col items-center text-center p-7 rounded-2xl border transition-all duration-300 cursor-default hover:-translate-y-1 ${
        isAdvisor
          ? 'bg-[var(--accent-subtle)] border-[var(--accent-border)]/40 hover:shadow-[var(--shadow-brand)]'
          : 'bg-[var(--surface)] border-[var(--border)] hover:shadow-md hover:border-[var(--accent-border)]'
      }`}
    >
      <div
        className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 text-lg font-bold transition-transform duration-300 group-hover:scale-110 ${
          isAdvisor
            ? 'bg-[var(--accent)] text-white shadow-sm'
            : 'bg-[var(--surface-raised)] border border-[var(--border)] text-[var(--fg)]'
        }`}
      >
        {initials}
      </div>
      <h3 className="font-semibold text-[var(--fg)] text-sm leading-snug mb-1">{name}</h3>
      <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
        isAdvisor
          ? 'bg-[var(--accent)] text-white'
          : 'bg-[var(--accent-subtle)] text-[var(--accent)]'
      }`}>
        {role}
      </span>
    </div>
  )
}
