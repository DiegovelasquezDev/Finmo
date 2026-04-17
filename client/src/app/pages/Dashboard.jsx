import { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../shared/context/AuthContext'
import { useTheme } from '../../shared/context/ThemeContext'
import { api } from '../../shared/lib/api'
import { fmtCurrency, fmtAmount } from '../../shared/lib/format'
import Chart from 'react-apexcharts'

const fmtDate = (d) =>
  new Date(d).toLocaleDateString('es-CO', { month: 'short', day: 'numeric' })

/* ── Skeleton loader ─────────────────────────────────────────────────────────── */
function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded-lg bg-[var(--bg-muted)] ${className}`} />
}

/* ── Card shell ──────────────────────────────────────────────────────────────── */
function Card({ children, className = '' }) {
  return (
    <div className={`bg-[var(--surface)] rounded-2xl border border-[var(--border)] ${className}`}>
      {children}
    </div>
  )
}

/* ── Section header ──────────────────────────────────────────────────────────── */
function SectionHeader({ title, action }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-sm font-semibold text-[var(--fg)]">{title}</h2>
      {action}
    </div>
  )
}

/* ── KPI card ────────────────────────────────────────────────────────────────── */
function KpiCard({ label, value, sub, accent, icon, loading }) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: accent + '18', color: accent }}>
          {icon}
        </div>
      </div>
      {loading
        ? <Skeleton className="h-7 w-28 mb-2" />
        : <p className="text-2xl font-bold text-[var(--fg)] tracking-tight mb-1">{value}</p>
      }
      <p className="text-xs text-[var(--fg-subtle)]">{label}</p>
      {sub && <p className="text-xs font-semibold mt-1" style={{ color: accent }}>{sub}</p>}
    </Card>
  )
}

/* ── Monthly trend chart (ApexCharts) ─────────────────────────────────────── */
function TrendChart({ trend, loading, currency, isDark }) {
  const { t } = useTranslation()

  const options = useMemo(() => {
    const fg       = isDark ? '#c4c4cf' : '#6b7280'
    const grid     = isDark ? '#2a2a35' : '#f3f4f6'
    const tooltip  = isDark ? '#1e1e28' : '#ffffff'

    return {
      chart: {
        type: 'area',
        toolbar: { show: false },
        fontFamily: 'inherit',
        background: 'transparent',
        sparkline: { enabled: false },
      },
      colors: ['#10b981', '#ef4444'],
      stroke: { width: 2.5, curve: 'smooth' },
      fill: {
        type: 'gradient',
        gradient: { opacityFrom: 0.25, opacityTo: 0.02, stops: [0, 100] },
      },
      dataLabels: { enabled: false },
      xaxis: {
        categories: trend.map(m => {
          const [y, mo] = m.month.split('-')
          return new Date(+y, +mo - 1).toLocaleDateString('es-CO', { month: 'short' })
        }),
        labels: { style: { colors: fg, fontSize: '11px' } },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: {
        labels: {
          style: { colors: fg, fontSize: '11px' },
          formatter: v => fmtCurrency(v, currency),
        },
      },
      grid: {
        borderColor: grid,
        strokeDashArray: 3,
        xaxis: { lines: { show: false } },
      },
      legend: {
        position: 'top',
        horizontalAlign: 'right',
        fontSize: '12px',
        labels: { colors: fg },
        markers: { size: 4, offsetX: -2 },
      },
      tooltip: {
        theme: isDark ? 'dark' : 'light',
        style: { fontSize: '12px' },
        y: { formatter: v => fmtCurrency(v, currency) },
      },
    }
  }, [trend, currency, isDark, t])

  const series = useMemo(() => [
    { name: t('app.dashboard.trendIncome'),  data: trend.map(m => m.income) },
    { name: t('app.dashboard.trendExpense'), data: trend.map(m => m.expense) },
  ], [trend, t])

  if (loading) return (
    <Card className="p-5">
      <Skeleton className="h-5 w-40 mb-5" />
      <Skeleton className="w-full h-48" />
    </Card>
  )

  return (
    <Card className="p-5">
      <h2 className="text-sm font-semibold text-[var(--fg)] mb-2">{t('app.dashboard.spendingTitle')}</h2>
      {trend.length === 0 ? (
        <p className="text-center text-sm text-[var(--fg-subtle)] py-8">{t('app.dashboard.noDataTrend')}</p>
      ) : (
        <Chart options={options} series={series} type="area" height={220} />
      )}
    </Card>
  )
}

/* ── Top categories (donut chart) ─────────────────────────────────────────── */
function CategoriesCard({ cats, loading, currency, isDark }) {
  const { t } = useTranslation()
  const total = cats.reduce((s, c) => s + c.total, 0)

  if (loading) return (
    <Card className="p-5">
      <Skeleton className="h-4 w-32 mb-4" />
      <Skeleton className="h-40 w-40 rounded-full mx-auto mb-4" />
      {[1,2,3].map(i => <Skeleton key={i} className="h-4 w-full mb-3" />)}
    </Card>
  )

  const FALLBACK_COLORS = ['#5d4573','#a97ecb','#cab3e1','#f59e0b','#10b981','#9e9eaf']
  const colors = cats.map((c, i) => c.category?.color || FALLBACK_COLORS[i])
  const labels = cats.map(c => c.category?.icon ? `${c.category.icon} ${c.category.name}` : (c.category?.name || '—'))
  const values = cats.map(c => c.total)

  const fg = isDark ? '#c4c4cf' : '#6b7280'

  const donutOptions = {
    chart: { type: 'donut', background: 'transparent', fontFamily: 'inherit' },
    colors,
    labels,
    stroke: { width: 0 },
    plotOptions: {
      pie: {
        donut: {
          size: '65%',
          labels: {
            show: true,
            total: {
              show: true,
              label: 'Total',
              color: fg,
              formatter: () => fmtCurrency(total, currency),
            },
            value: {
              color: isDark ? '#e4e4ef' : '#1f2937',
              fontWeight: 700,
              fontSize: '14px',
              formatter: v => fmtCurrency(Number(v), currency),
            },
            name: { color: fg, fontSize: '11px' },
          },
        },
      },
    },
    dataLabels: { enabled: false },
    legend: { show: false },
    tooltip: {
      theme: isDark ? 'dark' : 'light',
      y: { formatter: v => fmtCurrency(v, currency) },
    },
  }

  return (
    <Card className="p-5">
      <p className="text-sm font-semibold text-[var(--fg)] mb-4">{t('app.dashboard.categoriesTitle')}</p>
      {cats.length === 0 ? (
        <p className="text-center text-sm text-[var(--fg-subtle)] py-4">{t('app.dashboard.noExpenses')}</p>
      ) : (
        <>
          <Chart options={donutOptions} series={values} type="donut" height={200} />
          <div className="flex flex-col gap-2.5 mt-3">
            {cats.map((c, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: colors[i] }}/>
                <span className="text-xs text-[var(--fg-muted)] flex-1">{c.category?.icon} {c.category?.name || '—'}</span>
                <span className="text-xs font-semibold text-[var(--fg)]">
                  {fmtCurrency(c.total, currency)}
                </span>
                <span className="text-[10px] text-[var(--fg-subtle)] w-8 text-right">
                  {total > 0 ? Math.round((c.total / total) * 100) : 0}%
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </Card>
  )
}

/* ── Goals progress ──────────────────────────────────────────────────────────── */
function GoalsCard({ goals, loading, currency }) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  if (loading) return (
    <Card className="p-5">
      <Skeleton className="h-4 w-32 mb-4" />
      {[1,2].map(i => <Skeleton key={i} className="h-12 w-full mb-3" />)}
    </Card>
  )

  const COLORS = ['#10b981','#5d4573','#f59e0b','#3b82f6']

  return (
    <Card className="p-5">
      <SectionHeader
        title={t('app.dashboard.goalsTitle')}
        action={
          <button onClick={() => navigate('/app/goals')}
            className="text-xs font-medium text-[var(--accent)] hover:underline">
            {t('app.dashboard.goalsViewAll')}
          </button>
        }
      />
      {goals.length === 0 ? (
        <div className="text-center py-4">
          <p className="text-sm text-[var(--fg-muted)]">{t('app.dashboard.noGoals')}</p>
          <button onClick={() => navigate('/app/goals')}
            className="mt-2 text-xs font-medium text-[var(--accent)] hover:underline">
            {t('app.dashboard.createGoal')}
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {goals.map((g, i) => (
            <div key={g.id}>
              <div className="flex items-center gap-2.5 mb-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-[var(--fg)] truncate">{g.name}</span>
                    <span className="text-xs font-bold text-[var(--fg)] shrink-0 ml-2">{g.progress}%</span>
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="text-[10px] text-[var(--fg-subtle)]">
                      {fmtCurrency(g.currentAmount, currency)} /
                      {' '}{fmtCurrency(g.targetAmount, currency)}
                    </span>
                    {g.deadline && (
                      <span className="text-[10px] text-[var(--fg-subtle)]">
                        {t('app.dashboard.goalDeadline')}: {fmtDate(g.deadline)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="h-1.5 rounded-full bg-[var(--bg-muted)] overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, g.progress)}%`, background: COLORS[i % COLORS.length] }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}

/* ── Recent transactions ─────────────────────────────────────────────────────── */
function RecentTxCard({ txs, loading, currency }) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  if (loading) return (
    <Card>
      <div className="px-5 pt-5 pb-1">
        <Skeleton className="h-4 w-40 mb-4" />
      </div>
      {[1,2,3].map(i => <Skeleton key={i} className="h-14 w-full mb-1 rounded-none" />)}
    </Card>
  )

  return (
    <Card>
      <div className="px-5 pt-5 pb-1">
        <SectionHeader
          title={t('app.dashboard.txTitle')}
          action={
            <button onClick={() => navigate('/app/transactions')}
              className="text-xs font-medium text-[var(--accent)] hover:underline">
              {t('app.dashboard.txViewAll')}
            </button>
          }
        />
      </div>
      {txs.length === 0 ? (
        <div className="px-5 pb-5 text-center">
          <p className="text-sm text-[var(--fg-muted)]">{t('app.dashboard.noTx')}</p>
          <button onClick={() => navigate('/app/transactions')}
            className="mt-2 text-xs font-medium text-[var(--accent)] hover:underline">
            {t('app.dashboard.addTx')}
          </button>
        </div>
      ) : (
        <div className="divide-y divide-[var(--border)]">
          {txs.map(tx => (
            <div key={tx.id} className="flex items-center gap-3.5 px-5 py-3.5 hover:bg-[var(--surface-raised)] transition-colors">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0"
                style={{ background: (tx.category?.color || '#6b7280') + '20', color: tx.category?.color || '#6b7280' }}>
                {tx.category?.icon || (tx.type === 'INCOME' ? '↓' : '↑')}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--fg)] truncate">{tx.description || t('app.dashboard.noDesc')}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] text-[var(--fg-subtle)]">{tx.category?.name}</span>
                  {tx.category && <span className="text-[10px] text-[var(--fg-subtle)]">·</span>}
                  <span className="text-[10px] text-[var(--fg-subtle)]">{fmtDate(tx.date)}</span>
                </div>
              </div>
              <span className={`text-sm font-bold shrink-0 ${tx.type === 'INCOME' ? 'text-[#10b981]' : 'text-[var(--fg)]'}`}>
                {fmtAmount(tx.amount, tx.type, currency)}
              </span>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}

/* ── Period helpers ───────────────────────────────────────────────────────── */
function getDateRange(period) {
  const now = new Date()
  switch (period) {
    case 'month': return {
      startDate: new Date(now.getFullYear(), now.getMonth(), 1).toISOString(),
      endDate:   new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString(),
    }
    case 'prev': return {
      startDate: new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString(),
      endDate:   new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59).toISOString(),
    }
    case '3m': return {
      startDate: new Date(now.getFullYear(), now.getMonth() - 2, 1).toISOString(),
      endDate:   new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString(),
    }
    case 'year': return {
      startDate: new Date(now.getFullYear(), 0, 1).toISOString(),
      endDate:   new Date(now.getFullYear(), 11, 31, 23, 59, 59).toISOString(),
    }
    default: return {}
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   DASHBOARD PAGE
══════════════════════════════════════════════════════════════════════════════ */
export default function Dashboard() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const { isDark } = useTheme()
  const [summary, setSummary] = useState(null)
  const [trend,   setTrend]   = useState([])
  const [loading, setLoading] = useState(true)
  const [period,  setPeriod]  = useState('month')
  const [customFrom, setCustomFrom] = useState('')
  const [customTo,   setCustomTo]   = useState('')

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      let range
      if (period === 'custom' && customFrom && customTo) {
        range = {
          startDate: new Date(customFrom + 'T00:00:00').toISOString(),
          endDate:   new Date(customTo   + 'T23:59:59').toISOString(),
        }
      } else if (period !== 'custom') {
        range = getDateRange(period)
      } else {
        range = getDateRange('month') // fallback while custom not filled
      }

      const sumParams = new URLSearchParams()
      if (range.startDate) sumParams.set('startDate', range.startDate)
      if (range.endDate)   sumParams.set('endDate',   range.endDate)

      const trendParams = new URLSearchParams()
      if (range.startDate) trendParams.set('startDate', range.startDate)
      if (range.endDate)   trendParams.set('endDate',   range.endDate)
      if (!range.startDate) trendParams.set('months', '6')

      const [sumRes, trendRes] = await Promise.all([
        api.get(`/dashboard/summary?${sumParams}`),
        api.get(`/dashboard/monthly-trend?${trendParams}`),
      ])
      setSummary(sumRes.data ?? null)
      setTrend(trendRes.data?.trend ?? [])
    } catch {
      // show empty state
    } finally {
      setLoading(false)
    }
  }, [period, customFrom, customTo])

  useEffect(() => {
    if (period === 'custom' && (!customFrom || !customTo)) return
    loadData()
  }, [loadData])

  const currency = user?.currency ?? 'COP'
  const totals   = summary?.totals ?? {}
  const savingsGoal = user?.profile?.savingsGoalPct ?? 20

  const PERIOD_OPTS = [
    { key: 'month',  label: t('app.dashboard.periodMonth') },
    { key: 'prev',   label: t('app.dashboard.periodPrev') },
    { key: '3m',     label: t('app.dashboard.period3m') },
    { key: 'year',   label: t('app.dashboard.periodYear') },
    { key: 'all',    label: t('app.dashboard.periodAll') },
    { key: 'custom', label: t('app.dashboard.periodCustom') },
  ]

  const KPI_CARDS = [
    {
      label:  t('app.dashboard.balance'),
      value:  fmtCurrency(totals.balance, currency),
      accent: '#5d4573',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
        </svg>
      ),
    },
    {
      label:  t('app.dashboard.totalIncome'),
      value:  fmtCurrency(totals.income, currency),
      accent: '#10b981',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
        </svg>
      ),
    },
    {
      label:  t('app.dashboard.totalExpenses'),
      value:  fmtCurrency(totals.expense, currency),
      accent: '#ef4444',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/>
        </svg>
      ),
    },
    {
      label:  t('app.dashboard.savingsRate'),
      value:  totals.savingsRate != null ? `${totals.savingsRate}%` : '—',
      sub:    totals.savingsRate != null
        ? (totals.savingsRate >= savingsGoal
            ? t('app.dashboard.savingsOnTrack')
            : `${t('app.dashboard.savingsGoal')}: ${savingsGoal}%`)
        : null,
      accent: totals.savingsRate >= savingsGoal ? '#10b981' : '#f59e0b',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16"/><path d="M3 21h18"/><path d="M9 7h6M9 11h6M9 15h4"/>
        </svg>
      ),
    },
  ]

  const greeting = user?.firstName ? `${t('app.dashboard.greeting')}, ${user.firstName} 👋` : `${t('app.dashboard.greeting')} 👋`

  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[var(--fg)] tracking-tight">{greeting}</h1>
          <p className="text-sm text-[var(--fg-muted)] mt-0.5">{t('app.dashboard.greetingSub')}</p>
        </div>
      </div>

      {/* Period filter */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex rounded-xl overflow-hidden border border-[var(--border)] text-sm font-medium">
          {PERIOD_OPTS.map(o => (
            <button key={o.key} onClick={() => setPeriod(o.key)}
              className={`px-3 py-2 transition-colors whitespace-nowrap ${period === o.key ? 'bg-[var(--accent)] text-white' : 'bg-[var(--surface)] text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--surface-raised)]'}`}>
              {o.label}
            </button>
          ))}
        </div>
        {period === 'custom' && (
          <div className="flex items-center gap-2">
            <label className="text-xs text-[var(--fg-muted)]">{t('app.dashboard.periodFrom')}</label>
            <input type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)}
              className="px-2 py-1.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-sm text-[var(--fg)] outline-none focus:border-[var(--accent-border)]" />
            <label className="text-xs text-[var(--fg-muted)]">{t('app.dashboard.periodTo')}</label>
            <input type="date" value={customTo} onChange={e => setCustomTo(e.target.value)}
              className="px-2 py-1.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-sm text-[var(--fg)] outline-none focus:border-[var(--accent-border)]" />
          </div>
        )}
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {KPI_CARDS.map((kpi, i) => <KpiCard key={i} {...kpi} loading={loading} />)}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2 flex flex-col gap-5">
          <TrendChart trend={trend} loading={loading} currency={currency} isDark={isDark} />
          <RecentTxCard txs={summary?.recentTransactions ?? []} loading={loading} currency={currency} />
        </div>
        <div className="flex flex-col gap-5">
          <CategoriesCard cats={summary?.topExpenseCategories ?? []} loading={loading} currency={currency} isDark={isDark} />
          <GoalsCard goals={summary?.goalsProgress ?? []} loading={loading} currency={currency} />
        </div>
      </div>
    </div>
  )
}
