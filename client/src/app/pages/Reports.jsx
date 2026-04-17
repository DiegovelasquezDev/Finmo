import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../shared/context/AuthContext'
import { fmtCurrency, fmtAmount } from '../../shared/lib/format'

/* ── Data ────────────────────────────────────────────────────────────────────── */
const MONTHLY_DATA = {
  'Apr 2026': {
    income: 3858.40, expenses: 1612.48, savingsRate: 58.2,
    incomeBreakdown: [
      { label: 'Salary',    value: 3200,  color: '#5d4573' },
      { label: 'Freelance', value: 650,   color: '#3b82f6' },
      { label: 'Interest',  value: 8.40,  color: '#10b981' },
    ],
    expenseBreakdown: [
      { label: 'Housing',       value: 995,   pct: 61.7, color: '#5d4573', change: +0 },
      { label: 'Food',          value: 165.5, pct: 10.3, color: '#22c55e', change: +34 },
      { label: 'Entertainment', value: 113.97,pct: 7.1,  color: '#f59e0b', change: +8  },
      { label: 'Transport',     value: 82.5,  pct: 5.1,  color: '#3b82f6', change: -12 },
      { label: 'Health',        value: 73.5,  pct: 4.6,  color: '#ec4899', change: +0  },
      { label: 'Other',         value: 182.01,pct: 11.3, color: '#6b7280', change: +21 },
    ],
    trend: [2980, 3200, 3450, 3100, 3858],
    trendLabels: ['Dec', 'Jan', 'Feb', 'Mar', 'Apr'],
  },
  'Mar 2026': {
    income: 3100, expenses: 1890, savingsRate: 39.0,
    incomeBreakdown: [
      { label: 'Salary',    value: 3100, color: '#5d4573' },
    ],
    expenseBreakdown: [
      { label: 'Housing',       value: 900,  pct: 47.6, color: '#5d4573', change: +0  },
      { label: 'Food',          value: 310,  pct: 16.4, color: '#22c55e', change: +12 },
      { label: 'Entertainment', value: 220,  pct: 11.6, color: '#f59e0b', change: +5  },
      { label: 'Transport',     value: 200,  pct: 10.6, color: '#3b82f6', change: +8  },
      { label: 'Health',        value: 100,  pct: 5.3,  color: '#ec4899', change: +0  },
      { label: 'Other',         value: 160,  pct: 8.5,  color: '#6b7280', change: -3  },
    ],
    trend: [2600, 2800, 2980, 3200, 3100],
    trendLabels: ['Nov', 'Dec', 'Jan', 'Feb', 'Mar'],
  },
  'Feb 2026': {
    income: 3200, expenses: 1520, savingsRate: 52.5,
    incomeBreakdown: [
      { label: 'Salary',    value: 3200, color: '#5d4573' },
    ],
    expenseBreakdown: [
      { label: 'Housing',       value: 900, pct: 59.2, color: '#5d4573', change: +0  },
      { label: 'Food',          value: 280, pct: 18.4, color: '#22c55e', change: -5  },
      { label: 'Entertainment', value: 180, pct: 11.8, color: '#f59e0b', change: -8  },
      { label: 'Transport',     value: 90,  pct: 5.9,  color: '#3b82f6', change: +2  },
      { label: 'Health',        value: 70,  pct: 4.6,  color: '#ec4899', change: +0  },
    ],
    trend: [2400, 2600, 2700, 2980, 3200],
    trendLabels: ['Oct', 'Nov', 'Dec', 'Jan', 'Feb'],
  },
}

const MONTHS = Object.keys(MONTHLY_DATA)

/* ── Line chart ──────────────────────────────────────────────────────────────── */
function TrendLine({ data, labels }) {
  const W = 600, H = 120, PAD = { t: 10, r: 20, b: 30, l: 40 }
  const min = Math.min(...data) * 0.9
  const max = Math.max(...data) * 1.05
  const xs = data.map((_, i) => PAD.l + (i / (data.length - 1)) * (W - PAD.l - PAD.r))
  const ys = data.map(v => PAD.t + ((max - v) / (max - min)) * (H - PAD.t - PAD.b))
  const polyline = xs.map((x, i) => `${x},${ys[i]}`).join(' ')
  const areaPath = `M ${xs[0]},${H - PAD.b} ${xs.map((x, i) => `L ${x},${ys[i]}`).join(' ')} L ${xs[xs.length-1]},${H - PAD.b} Z`

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="none" style={{ height: 120 }}>
      <defs>
        <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5d4573" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#5d4573" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#trendGrad)" />
      <polyline points={polyline} fill="none" stroke="#5d4573" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {xs.map((x, i) => (
        <g key={i}>
          <circle cx={x} cy={ys[i]} r="4" fill="#5d4573" />
          <text x={x} y={H - 6} textAnchor="middle" fontSize="9" fill="var(--fg-muted)" fontFamily="system-ui">{labels[i]}</text>
          <text x={x} y={ys[i] - 8} textAnchor="middle" fontSize="9" fill="var(--fg)" fontFamily="system-ui" fontWeight="600">{(data[i]/1000).toFixed(1)}k</text>
        </g>
      ))}
    </svg>
  )
}

/* ── Main page ───────────────────────────────────────────────────────────────── */
export default function Reports() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const currency = user?.currency ?? 'COP'
  const [selectedMonth, setSelectedMonth] = useState(MONTHS[0])

  const data = MONTHLY_DATA[selectedMonth]
  const net = data.income - data.expenses

  const kpis = [
    { label: t('app.reports.totalIncome'),   value: fmtCurrency(data.income, currency), color: '#10b981', icon: '↓' },
    { label: t('app.reports.totalExpenses'), value: fmtCurrency(data.expenses, currency), color: '#ef4444', icon: '↑' },
    { label: t('app.reports.netBalance'),    value: fmtAmount(net, net >= 0 ? 'INCOME' : 'EXPENSE', currency), color: net >= 0 ? '#10b981' : '#ef4444', icon: '=' },
    { label: t('app.reports.savingsRate'),   value: `${data.savingsRate}%`, color: '#5d4573', icon: '%' },
  ]

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[var(--fg)]">{t('app.reports.title')}</h1>
          <p className="text-sm text-[var(--fg-muted)] mt-0.5">{t('app.reports.subtitle')}</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Month selector */}
          <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-sm text-[var(--fg)] outline-none focus:border-[var(--accent-border)]">
            {MONTHS.map(m => <option key={m}>{m}</option>)}
          </select>
          {/* Export button */}
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-sm font-medium text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--surface-raised)] transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            {t('app.reports.exportBtn')}
          </button>
        </div>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map(k => (
          <div key={k.label} className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl px-4 py-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold text-white" style={{ background: k.color }}>{k.icon}</div>
              <p className="text-xs text-[var(--fg-muted)]">{k.label}</p>
            </div>
            <p className="text-2xl font-bold" style={{ color: k.color }}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Trend chart */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5">
        <p className="text-sm font-semibold text-[var(--fg)] mb-4">{t('app.reports.monthlyTrend')} — Income</p>
        <TrendLine data={data.trend} labels={data.trendLabels} />
      </div>

      {/* Bottom grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Income breakdown */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5">
          <p className="text-sm font-semibold text-[var(--fg)] mb-4">{t('app.reports.incomeBreakdown')}</p>
          <div className="flex flex-col gap-3">
            {data.incomeBreakdown.map(src => (
              <div key={src.label} className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ background: src.color }} />
                <span className="text-sm text-[var(--fg-muted)] flex-1">{src.label}</span>
                <span className="text-sm font-semibold text-[var(--fg)]">{fmtCurrency(src.value, currency)}</span>
                <span className="text-xs text-[var(--fg-subtle)] w-10 text-right">{((src.value / data.income) * 100).toFixed(0)}%</span>
              </div>
            ))}
          </div>
          {/* Mini bar */}
          <div className="mt-4 h-2 rounded-full overflow-hidden flex">
            {data.incomeBreakdown.map((src, i) => (
              <div key={i} className="h-full" style={{ width: `${(src.value / data.income) * 100}%`, background: src.color }} />
            ))}
          </div>
        </div>

        {/* Expense breakdown */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5">
          <p className="text-sm font-semibold text-[var(--fg)] mb-4">{t('app.reports.topExpenses')}</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[300px]">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  {[t('app.reports.category'), t('app.reports.amount'), t('app.reports.percentage'), t('app.reports.change')].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-[var(--fg-muted)] pb-2 pr-4 last:pr-0">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.expenseBreakdown.map(cat => (
                  <tr key={cat.label} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2.5 pr-4">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: cat.color }} />
                        <span className="text-xs text-[var(--fg)]">{cat.label}</span>
                      </span>
                    </td>
                    <td className="py-2.5 pr-4 text-xs font-semibold text-[var(--fg)]">{fmtCurrency(cat.value, currency)}</td>
                    <td className="py-2.5 pr-4 text-xs text-[var(--fg-muted)]">{cat.pct}%</td>
                    <td className="py-2.5 text-xs font-semibold" style={{ color: cat.change > 0 ? '#ef4444' : cat.change < 0 ? '#10b981' : 'var(--fg-subtle)' }}>
                      {cat.change > 0 ? `+${cat.change}%` : cat.change < 0 ? `${cat.change}%` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
