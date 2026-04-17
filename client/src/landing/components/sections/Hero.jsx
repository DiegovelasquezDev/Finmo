import { useTranslation } from 'react-i18next'
import { useReveal } from '../../../shared/hooks/useReveal'
import { ButtonPrimary, ButtonSecondary } from '../ui/Button'

function DashboardMockup() {
  const { t } = useTranslation()
  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-[#5d4573]/10 to-[#a97ecb]/10 blur-2xl pointer-events-none" />
      <div className="relative bg-[var(--surface)] rounded-2xl border border-[var(--border)] shadow-[0_24px_60px_-12px_rgb(93_69_115_/_0.15)] overflow-hidden">
        {/* Browser bar */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--border)] bg-[var(--surface-raised)]">
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#ffcdd2]" />
            <span className="w-3 h-3 rounded-full bg-[#fff9c4]" />
            <span className="w-3 h-3 rounded-full bg-[#c8e6c9]" />
          </div>
          <div className="flex-1 mx-4 h-5 bg-[var(--bg-muted)] rounded-md flex items-center px-2">
            <span className="text-[10px] text-[var(--fg-subtle)]">{t('dashboardPreview.mockupUrl')}</span>
          </div>
        </div>

        <div className="p-5 grid grid-cols-1 sm:grid-cols-12 gap-4">
          {/* Sidebar */}
          <div className="hidden sm:flex sm:col-span-3 flex-col gap-3">
            <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-[var(--accent-subtle)]">
              <div className="w-3 h-3 rounded-sm bg-[var(--accent)]" />
              <span className="text-[10px] font-semibold text-[var(--accent)]">Dashboard</span>
            </div>
            {['Expenses', 'Goals', 'Alerts', 'Reports'].map(item => (
              <div key={item} className="flex items-center gap-2 px-2 py-1.5 rounded-lg">
                <div className="w-3 h-3 rounded-sm bg-[var(--border)]" />
                <span className="text-[10px] text-[var(--fg-subtle)]">{item}</span>
              </div>
            ))}
          </div>

          {/* Content */}
          <div className="sm:col-span-9 flex flex-col gap-4">
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {[
                { label: 'Balance',  value: '$4,280', change: '+2.4%', positive: true },
                { label: 'Expenses', value: '$1,340', change: '-8.1%', positive: true },
                { label: 'Savings',  value: '$890',   change: '+12%',  positive: true },
              ].map(stat => (
                <div key={stat.label} className="bg-[var(--surface-raised)] rounded-xl p-3 border border-[var(--border)]">
                  <p className="text-[9px] text-[var(--fg-subtle)] uppercase tracking-wider">{stat.label}</p>
                  <p className="text-sm font-bold text-[var(--fg)] mt-0.5">{stat.value}</p>
                  <span className={`text-[9px] font-medium ${stat.positive ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
                    {stat.change}
                  </span>
                </div>
              ))}
            </div>

            <div className="bg-[var(--surface-raised)] rounded-xl p-3 border border-[var(--border)]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-semibold text-[var(--fg-muted)]">Spending Overview</span>
                <span className="text-[9px] text-[var(--fg-subtle)]">Last 7 days</span>
              </div>
              <div className="flex items-end gap-1.5 h-16">
                {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                  <div key={i} className="flex-1">
                    <div className="w-full rounded-t-sm" style={{
                      height: `${h}%`,
                      background: i === 5 ? 'linear-gradient(to top, #5d4573, #a97ecb)' : 'var(--bg-muted)',
                    }} />
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-1.5">
                {['M','T','W','T','F','S','S'].map((d, i) => (
                  <span key={i} className="flex-1 text-center text-[8px] text-[var(--fg-subtle)]">{d}</span>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-semibold text-[var(--fg-muted)]">AI Alerts</span>
              {[
                { icon: '⚠️', text: 'Dining up 34% this week',       bg: '#fef3c7', border: '#f59e0b' },
                { icon: '✅', text: 'Saved $120 vs last month',       bg: '#d1fae5', border: '#10b981' },
                { icon: '🔮', text: 'Projected shortfall in 12 days', bg: 'var(--accent-subtle)', border: 'var(--accent)' },
              ].map((a, i) => (
                <div key={i} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-[9px] font-medium text-[var(--fg-muted)]"
                  style={{ background: a.bg, borderColor: a.border + '40' }}
                >
                  <span>{a.icon}</span>{a.text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="absolute -top-3 -right-3 bg-[#5d4573] text-white text-[10px] font-semibold px-3 py-1.5 rounded-full shadow-lg">
        AI Powered ✦
      </div>
    </div>
  )
}

export default function Hero() {
  const { t } = useTranslation()
  const headRef = useReveal()
  const subRef  = useReveal()
  const ctaRef  = useReveal()
  const mockRef = useReveal()

  return (
    <section className="relative overflow-hidden bg-[var(--bg-base)]">
      <div className="absolute inset-0 hero-grid opacity-60 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-[#5d4573]/6 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="relative mx-auto max-w-[1200px] px-6 pt-32 pb-24">
        <div className="flex flex-col items-center text-center">
          <div ref={headRef} className="reveal">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-[var(--accent-subtle)] text-[var(--accent)] border border-[var(--accent-border)]/50 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
              {t('hero.badge')}
            </span>
          </div>

          <h1 ref={subRef} className="reveal reveal-delay-1 font-heading text-5xl md:text-6xl lg:text-[68px] font-bold tracking-tight text-[var(--fg)] leading-[1.04] max-w-4xl">
            {t('hero.headline').split(t('hero.headlineAccent'))[0]}
            <span className="gradient-text">{t('hero.headlineAccent')}</span>
            {t('hero.headline').split(t('hero.headlineAccent'))[1]}
          </h1>

          <p ref={ctaRef} className="reveal reveal-delay-2 mt-6 text-lg md:text-xl text-[var(--fg-muted)] max-w-2xl leading-relaxed">
            {t('hero.sub')}
          </p>

          <div className="reveal reveal-delay-3 mt-10 flex flex-col sm:flex-row items-center gap-4">
            <ButtonPrimary href="/app">
              {t('hero.ctaPrimary')}
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </ButtonPrimary>
            <ButtonSecondary href="#how-it-works">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M6.5 6C6.5 5.17 7.17 4.5 8 4.5C8.83 4.5 9.5 5.17 9.5 6C9.5 6.83 8.83 7.5 8 7.5V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <circle cx="8" cy="11" r="0.75" fill="currentColor"/>
              </svg>
              {t('hero.ctaSecondary')}
            </ButtonSecondary>
          </div>

          <div className="reveal reveal-delay-4 mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-[var(--fg-subtle)]">
            {[
              { icon: '🔒', key: 'trustSecurity' },
              { icon: '⚡', key: 'trustSetup'    },
              { icon: '✨', key: 'trustCard'     },
            ].map(b => (
              <span key={b.key} className="flex items-center gap-1.5">
                {b.icon} {t(`hero.${b.key}`)}
              </span>
            ))}
          </div>
        </div>

        <div ref={mockRef} className="reveal reveal-delay-2 mt-16 md:mt-20">
          <DashboardMockup />
        </div>
      </div>
    </section>
  )
}
