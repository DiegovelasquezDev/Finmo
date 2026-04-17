import { useTranslation } from 'react-i18next'
import { useAuth } from '../../shared/context/AuthContext'
import { fmtCurrency } from '../../shared/lib/format'

/* ── Risk gauge ──────────────────────────────────────────────────────────────── */
function RiskGauge({ score }) {
  const W = 200, H = 110
  const cx = W / 2, cy = H - 10
  const r = 80
  const toRad = deg => (deg * Math.PI) / 180
  const startAngle = 180, endAngle = 0
  const scoreAngle = startAngle - (score / 100) * 180

  const arcPath = (from, to, inner) => {
    const ri = inner ? r - 18 : r
    const x1 = cx + ri * Math.cos(toRad(from))
    const y1 = cy + ri * Math.sin(toRad(from))
    const x2 = cx + ri * Math.cos(toRad(to))
    const y2 = cy + ri * Math.sin(toRad(to))
    return `M ${x1} ${y1} A ${ri} ${ri} 0 0 1 ${x2} ${y2}`
  }

  const needleX = cx + (r - 9) * Math.cos(toRad(scoreAngle))
  const needleY = cy + (r - 9) * Math.sin(toRad(scoreAngle))

  const color = score < 35 ? '#10b981' : score < 65 ? '#f59e0b' : '#ef4444'
  const segments = [
    { from: 180, to: 120, color: '#10b981' },
    { from: 120, to: 60,  color: '#f59e0b' },
    { from: 60,  to: 0,   color: '#ef4444' },
  ]

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      {/* Track */}
      {segments.map((s, i) => {
        const x1 = cx + r * Math.cos(toRad(s.from))
        const y1 = cy + r * Math.sin(toRad(s.from))
        const x2 = cx + r * Math.cos(toRad(s.to))
        const y2 = cy + r * Math.sin(toRad(s.to))
        return (
          <path key={i} d={`M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}`}
            fill="none" stroke={s.color} strokeWidth="14" strokeOpacity="0.2" />
        )
      })}
      {/* Filled arc to score */}
      {(() => {
        const x1 = cx + r * Math.cos(toRad(180))
        const y1 = cy + r * Math.sin(toRad(180))
        const x2 = cx + r * Math.cos(toRad(scoreAngle))
        const y2 = cy + r * Math.sin(toRad(scoreAngle))
        const large = (180 - scoreAngle) > 180 ? 1 : 0
        return (
          <path d={`M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`}
            fill="none" stroke={color} strokeWidth="14" strokeLinecap="round" />
        )
      })()}
      {/* Needle dot */}
      <circle cx={needleX} cy={needleY} r="5" fill={color} />
      {/* Score text */}
      <text x={cx} y={cy - 12} textAnchor="middle" fontSize="28" fontWeight="700" fill={color}>{score}</text>
      <text x={cx} y={cy + 2}  textAnchor="middle" fontSize="9"  fill="var(--fg-muted)" fontFamily="system-ui">/100</text>
    </svg>
  )
}

/* ── Bar chart ───────────────────────────────────────────────────────────────── */
function BarChart({ data, height = 120 }) {
  const max = Math.max(...data.map(d => d.value))
  return (
    <div className="flex items-end gap-1.5 w-full" style={{ height }}>
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div className="w-full rounded-t-md transition-all duration-500" style={{ height: `${(d.value / max) * (height - 24)}px`, background: d.color || 'var(--accent)', opacity: d.highlight ? 1 : 0.45 }} />
          <span className="text-[9px] text-[var(--fg-subtle)] whitespace-nowrap">{d.label}</span>
        </div>
      ))}
    </div>
  )
}

/* ── Donut chart ─────────────────────────────────────────────────────────────── */
function Donut({ segments, size = 120 }) {
  const cx = size / 2, cy = size / 2, r = size / 2 - 14
  const circ = 2 * Math.PI * r
  let offset = 0
  const total = segments.reduce((s, d) => s + d.value, 0)

  return (
    <svg width={size} height={size} className="rotate-[-90deg]">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--surface-overlay)" strokeWidth="22" />
      {segments.map((s, i) => {
        const dash = (s.value / total) * circ
        const el = (
          <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={s.color} strokeWidth="22"
            strokeDasharray={`${dash} ${circ}`} strokeDashoffset={-offset} strokeLinecap="butt" />
        )
        offset += dash
        return el
      })}
    </svg>
  )
}

/* ── Main page ───────────────────────────────────────────────────────────────── */
export default function Analysis() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const currency = user?.currency ?? 'COP'

  const riskScore = 58

  const weekDays = [
    { label: t('app.analysis.monday'),    value: 32,  color: '#5d4573', highlight: false },
    { label: t('app.analysis.tuesday'),   value: 45,  color: '#5d4573', highlight: false },
    { label: t('app.analysis.wednesday'), value: 78,  color: '#f59e0b', highlight: true  },
    { label: t('app.analysis.thursday'),  value: 55,  color: '#5d4573', highlight: false },
    { label: t('app.analysis.friday'),    value: 120, color: '#ef4444', highlight: true  },
    { label: t('app.analysis.saturday'),  value: 95,  color: '#f59e0b', highlight: true  },
    { label: t('app.analysis.sunday'),    value: 30,  color: '#5d4573', highlight: false },
  ]

  const emotions = [
    { label: t('app.analysis.stress'),       value: 32, color: '#ef4444' },
    { label: t('app.analysis.boredom'),      value: 24, color: '#f59e0b' },
    { label: t('app.analysis.celebration'),  value: 18, color: '#10b981' },
    { label: t('app.analysis.habit'),        value: 15, color: '#3b82f6' },
    { label: t('app.analysis.social'),       value: 11, color: '#8b5cf6' },
  ]

  const categories = [
    { name: 'Food',          impulse: 68, total: 320, color: '#22c55e'  },
    { name: 'Entertainment', impulse: 82, total: 180, color: '#f59e0b'  },
    { name: 'Shopping',      impulse: 71, total: 240, color: '#3b82f6'  },
    { name: 'Transport',     impulse: 34, total: 140, color: '#8b5cf6'  },
    { name: 'Health',        impulse: 12, total: 90,  color: '#ec4899'  },
  ]

  const triggers = [
    { icon: '😰', label: 'Stress shopping',        pct: 34, color: '#ef4444' },
    { icon: '🌙', label: 'Late-night spending',     pct: 28, color: '#f59e0b' },
    { icon: '📱', label: 'Social media influence',  pct: 19, color: '#3b82f6' },
    { icon: '🎉', label: 'Celebratory purchases',   pct: 12, color: '#10b981' },
    { icon: '😴', label: 'Boredom purchases',       pct: 7,  color: '#8b5cf6' },
  ]

  const tips = [
    { icon: '⏱️', text: t('app.analysis.tip1') },
    { icon: '🌙', text: t('app.analysis.tip2') },
    { icon: '😤', text: t('app.analysis.tip3') },
    { icon: '💰', text: t('app.analysis.tip4') },
  ]

  const riskLabel = riskScore < 35 ? t('app.analysis.riskLow') : riskScore < 65 ? t('app.analysis.riskMedium') : t('app.analysis.riskHigh')
  const riskColor = riskScore < 35 ? '#10b981' : riskScore < 65 ? '#f59e0b' : '#ef4444'

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-[var(--fg)]">{t('app.analysis.title')}</h1>
        <p className="text-sm text-[var(--fg-muted)] mt-0.5">{t('app.analysis.subtitle')}</p>
      </div>

      {/* Top row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Risk score */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 flex flex-col items-center">
          <p className="text-sm font-semibold text-[var(--fg)] mb-4 self-start">{t('app.analysis.riskScore')}</p>
          <RiskGauge score={riskScore} />
          <p className="text-sm font-bold mt-3" style={{ color: riskColor }}>{riskLabel}</p>
          <p className="text-xs text-[var(--fg-muted)] mt-1 text-center">{t('app.analysis.period')}</p>
        </div>

        {/* Impulse vs planned */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5">
          <p className="text-sm font-semibold text-[var(--fg)] mb-4">{t('app.analysis.emotionsTitle')}</p>
          <div className="flex items-center gap-5">
            <div className="relative shrink-0">
              <Donut segments={emotions} size={120} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-bold text-[var(--fg)]">32%</span>
                <span className="text-[9px] text-[var(--fg-subtle)]">stress</span>
              </div>
            </div>
            <div className="flex-1 flex flex-col gap-2">
              {emotions.map(e => (
                <div key={e.label} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ background: e.color }} />
                  <span className="text-xs text-[var(--fg-muted)] flex-1">{e.label}</span>
                  <span className="text-xs font-semibold text-[var(--fg)]">{e.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Triggers */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5">
          <p className="text-sm font-semibold text-[var(--fg)] mb-4">{t('app.analysis.triggersTitle')}</p>
          <div className="flex flex-col gap-3">
            {triggers.map(tr => (
              <div key={tr.label} className="flex items-center gap-3">
                <span className="text-base shrink-0">{tr.icon}</span>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-[var(--fg-muted)]">{tr.label}</span>
                    <span className="text-xs font-semibold" style={{ color: tr.color }}>{tr.pct}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-[var(--surface-overlay)] overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${tr.pct}%`, background: tr.color }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Weekly pattern */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5">
        <div className="flex items-center justify-between mb-5">
          <p className="text-sm font-semibold text-[var(--fg)]">{t('app.analysis.patternsTitle')}</p>
          <div className="flex items-center gap-4 text-xs text-[var(--fg-muted)]">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#ef4444]" />Peak day</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#f59e0b]" />Elevated</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#5d4573]" />Normal</span>
          </div>
        </div>
        <BarChart data={weekDays} height={130} />
        <p className="text-xs text-[var(--fg-muted)] mt-3 text-center">
          Friday & Saturday show the highest impulse spending — 2–4× your weekday average.
        </p>
      </div>

      {/* Category impulse */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5">
        <p className="text-sm font-semibold text-[var(--fg)] mb-5">{t('app.analysis.categoryTitle')}</p>
        <div className="flex flex-col gap-4">
          {categories.map(cat => (
            <div key={cat.name} className="flex items-center gap-4">
              <span className="text-xs font-medium text-[var(--fg-muted)] w-24 shrink-0">{cat.name}</span>
              <div className="flex-1 relative h-6 rounded-lg bg-[var(--surface-raised)] overflow-hidden">
                <div className="absolute inset-y-0 left-0 rounded-lg transition-all duration-700" style={{ width: `${cat.impulse}%`, background: cat.color + '40' }} />
                <div className="absolute inset-y-0 left-0 rounded-lg transition-all duration-700" style={{ width: `${cat.impulse * 0.6}%`, background: cat.color + '80' }} />
              </div>
              <span className="text-xs font-bold w-10 text-right shrink-0" style={{ color: cat.impulse > 60 ? '#ef4444' : cat.impulse > 40 ? '#f59e0b' : '#10b981' }}>
                {cat.impulse}%
              </span>
              <span className="text-xs text-[var(--fg-subtle)] w-14 text-right shrink-0">{fmtCurrency(cat.total, currency)}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-[var(--fg-subtle)] mt-3">% = share of category spending that was impulse (unplanned)</p>
      </div>

      {/* Tips */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5">
        <p className="text-sm font-semibold text-[var(--fg)] mb-4">{t('app.analysis.tipsTitle')}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {tips.map((tip, i) => (
            <div key={i} className="flex items-start gap-3 p-3.5 rounded-xl bg-[var(--surface-raised)] border border-[var(--border)]">
              <span className="text-xl shrink-0">{tip.icon}</span>
              <p className="text-xs text-[var(--fg-muted)] leading-relaxed">{tip.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
