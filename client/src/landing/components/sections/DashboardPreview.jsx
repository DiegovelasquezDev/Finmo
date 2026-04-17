import { useTranslation } from 'react-i18next'
import { useReveal } from '../../../shared/hooks/useReveal'
import { SectionLabel } from '../ui/SectionLabel'

function FullDashboard() {
  const { t } = useTranslation()
  const categories = [
    { label: 'Housing',       pct: 32, color: '#5d4573' },
    { label: 'Food',          pct: 22, color: '#a97ecb' },
    { label: 'Transport',     pct: 14, color: '#cab3e1' },
    { label: 'Entertainment', pct: 11, color: 'var(--accent-border)' },
    { label: 'Other',         pct: 21, color: 'var(--border-strong)' },
  ]
  const monthlyData = [38, 52, 45, 61, 48, 70, 58, 75, 63, 80, 68, 72]
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const maxVal = Math.max(...monthlyData)

  return (
    <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] shadow-[0_24px_80px_-12px_rgb(93_69_115_/_0.12)] overflow-hidden">
      {/* Chrome bar */}
      <div className="bg-[var(--surface-raised)] border-b border-[var(--border)] px-5 py-3 flex items-center justify-between">
        <div className="flex gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#ffcdd2]"/>
          <span className="w-3 h-3 rounded-full bg-[#fff9c4]"/>
          <span className="w-3 h-3 rounded-full bg-[#c8e6c9]"/>
        </div>
        <div className="flex items-center gap-2 bg-[var(--bg-muted)] rounded-lg px-3 py-1.5 text-[11px] text-[var(--fg-subtle)]">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
          </svg>
          {t('dashboardPreview.mockupUrl')}
        </div>
        <div className="text-[11px] text-[var(--fg-subtle)]">April 2026</div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="hidden md:flex flex-col w-44 bg-[var(--surface-raised)] border-r border-[var(--border)] p-4 gap-1 shrink-0">
          <div className="mb-3 flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[#5d4573] flex items-center justify-center">
              <span className="text-white text-[9px] font-bold">F</span>
            </div>
            <span className="text-xs font-semibold text-[var(--fg)]">Finmo</span>
          </div>
          {[
            { icon: '⊞', label: 'Dashboard', active: true  },
            { icon: '↕', label: 'Transactions', active: false },
            { icon: '◎', label: 'Goals',     active: false },
            { icon: '⚡', label: 'Alerts',    active: false },
            { icon: '📊', label: 'Reports',   active: false },
            { icon: '⚙', label: 'Settings',  active: false },
          ].map(item => (
            <div
              key={item.label}
              className={`flex items-center gap-2 px-2.5 py-2 rounded-lg text-[11px] font-medium transition-colors ${
                item.active
                  ? 'bg-[var(--accent)] text-white'
                  : 'text-[var(--fg-subtle)] hover:bg-[var(--accent-subtle)] hover:text-[var(--accent)]'
              }`}
            >
              <span>{item.icon}</span>{item.label}
            </div>
          ))}
        </div>

        {/* Main content */}
        <div className="flex-1 p-5 flex flex-col gap-5 overflow-hidden">
          {/* KPIs */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: 'Net Balance',    value: '$4,280', tag: '↑ 2.4%', tagColor: '#10b981', tagBg: 'var(--color-success-light)' },
              { label: 'Monthly Spend',  value: '$1,892', tag: '↓ 8.1%', tagColor: '#10b981', tagBg: 'var(--color-success-light)' },
              { label: 'Saved',          value: '$940',   tag: '↑ 12%',  tagColor: '#10b981', tagBg: 'var(--color-success-light)' },
              { label: 'AI Score',       value: '82/100', tag: '↑ 4pts', tagColor: 'var(--accent)', tagBg: 'var(--accent-subtle)' },
            ].map(kpi => (
              <div key={kpi.label} className="bg-[var(--surface-raised)] rounded-xl p-3 border border-[var(--border)]">
                <p className="text-[9px] text-[var(--fg-subtle)] uppercase tracking-wider mb-1">{kpi.label}</p>
                <p className="text-base font-bold text-[var(--fg)]">{kpi.value}</p>
                <span className="inline-block mt-1 text-[9px] font-semibold px-1.5 py-0.5 rounded-full"
                  style={{ color: kpi.tagColor, background: kpi.tagBg }}
                >
                  {kpi.tag}
                </span>
              </div>
            ))}
          </div>

          {/* Charts row */}
          <div className="grid md:grid-cols-3 gap-4">
            {/* Bar chart */}
            <div className="md:col-span-2 bg-[var(--surface-raised)] rounded-xl p-4 border border-[var(--border)]">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-semibold text-[var(--fg-muted)]">Annual Spending</span>
                <span className="text-[9px] text-[var(--fg-subtle)] bg-[var(--bg-muted)] px-2 py-0.5 rounded-full">2026</span>
              </div>
              <div className="flex items-end gap-1 h-20">
                {monthlyData.map((v, i) => (
                  <div key={i} className="flex-1">
                    <div className="w-full rounded-t" style={{
                      height: `${(v / maxVal) * 100}%`,
                      background: i === 11
                        ? 'linear-gradient(to top, #5d4573, #a97ecb)'
                        : i >= 9 ? 'var(--accent-border)' : 'var(--bg-muted)',
                    }} />
                  </div>
                ))}
              </div>
              <div className="flex mt-1.5">
                {months.map(m => (
                  <span key={m} className="flex-1 text-center text-[8px] text-[var(--fg-subtle)]">{m}</span>
                ))}
              </div>
            </div>

            {/* Categories */}
            <div className="bg-[var(--surface-raised)] rounded-xl p-4 border border-[var(--border)]">
              <span className="text-[11px] font-semibold text-[var(--fg-muted)] block mb-3">Categories</span>
              <div className="flex flex-col gap-2">
                {categories.map(c => (
                  <div key={c.label}>
                    <div className="flex justify-between text-[9px] text-[var(--fg-subtle)] mb-1">
                      <span>{c.label}</span><span>{c.pct}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-[var(--bg-muted)]">
                      <div className="h-full rounded-full" style={{ width: `${c.pct}%`, background: c.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Alerts */}
          <div className="bg-[var(--surface-raised)] rounded-xl p-4 border border-[var(--border)]">
            <span className="text-[11px] font-semibold text-[var(--fg-muted)] block mb-3">Latest AI Insights</span>
            <div className="grid sm:grid-cols-3 gap-2">
              {[
                { emoji: '⚠️', text: 'Dining up 34% vs last week',           bg: '#fef9ec', border: '#f59e0b' },
                { emoji: '✅', text: 'Saved $120 vs previous month',          bg: '#edfaf4', border: '#10b981' },
                { emoji: '🔮', text: 'Cash shortfall projected in 12 days',   bg: 'var(--accent-subtle)', border: 'var(--accent)' },
              ].map((a, i) => (
                <div key={i} className="flex items-start gap-2 px-3 py-2 rounded-lg border text-[10px] text-[var(--fg-muted)] font-medium"
                  style={{ background: a.bg, borderColor: a.border + '50' }}
                >
                  <span className="text-sm">{a.emoji}</span>{a.text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function DashboardPreview() {
  const { t }    = useTranslation()
  const titleRef = useReveal()
  const mockRef  = useReveal()

  return (
    <section className="bg-[var(--bg-subtle)] py-24 border-y border-[var(--border)] overflow-hidden">
      <div className="mx-auto max-w-[1200px] px-6">
        <div ref={titleRef} className="reveal text-center mb-14">
          <SectionLabel>{t('dashboardPreview.label')}</SectionLabel>
          <h2 className="mt-4 font-heading text-3xl md:text-4xl font-bold text-[var(--fg)] tracking-tight">
            {t('dashboardPreview.headline')}
          </h2>
          <p className="mt-4 text-[var(--fg-muted)] max-w-xl mx-auto">
            {t('dashboardPreview.sub')}
          </p>
        </div>
        <div ref={mockRef} className="reveal reveal-delay-1">
          <FullDashboard />
        </div>
      </div>
    </section>
  )
}
