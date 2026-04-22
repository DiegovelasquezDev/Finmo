import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../shared/context/AuthContext'
import { api } from '../../shared/lib/api'
import { fmtCurrency } from '../../shared/lib/format'

function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded-xl bg-[var(--bg-muted)] ${className}`} />
}

/* ─────────────────────────────────────────────────────────────────────────────
   SCORE RING — número central con anillo SVG
───────────────────────────────────────────────────────────────────────────── */
function ScoreRing({ score, label, size = 120 }) {
  const r   = (size - 16) / 2
  const circ = 2 * Math.PI * r
  const fill  = (score / 100) * circ
  const color = score >= 80 ? '#10b981' : score >= 65 ? '#3b82f6' : score >= 45 ? '#f59e0b' : score >= 25 ? '#f97316' : '#ef4444'

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="rotate-[-90deg] absolute">
        <circle cx={size/2} cy={size/2} r={r} fill="none"
          stroke="var(--surface-overlay)" strokeWidth="10" />
        <circle cx={size/2} cy={size/2} r={r} fill="none"
          stroke={color} strokeWidth="10" strokeLinecap="round"
          strokeDasharray={`${fill} ${circ}`}
          style={{ transition: 'stroke-dasharray 1s ease' }} />
      </svg>
      <div className="flex flex-col items-center z-10">
        <span className="text-3xl font-black leading-none" style={{ color }}>{score}</span>
        <span className="text-[10px] font-semibold text-[var(--fg-subtle)] mt-0.5">{label}</span>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   SCORE SPARKLINE — mini evolución temporal del score
───────────────────────────────────────────────────────────────────────────── */
function ScoreSparkline({ history }) {
  if (!history || history.length < 2) return null

  const W = 140, H = 48, PX = 4, PY = 4
  const scores = history.map(h => h.score)
  const min = Math.min(...scores), max = Math.max(...scores)
  const range = max - min || 1

  const points = scores.map((s, i) => {
    const x = PX + (i / (scores.length - 1)) * (W - PX * 2)
    const y = PY + (1 - (s - min) / range) * (H - PY * 2)
    return `${x},${y}`
  })

  const last = scores[scores.length - 1]
  const prev = scores[scores.length - 2]
  const diff = last - prev
  const trendColor = diff > 0 ? '#10b981' : diff < 0 ? '#ef4444' : '#6b7280'
  const trendArrow = diff > 0 ? '↑' : diff < 0 ? '↓' : '→'

  const firstDate = new Date(history[0].createdAt).toLocaleDateString('es', { day: 'numeric', month: 'short' })
  const lastDate = new Date(history[history.length - 1].createdAt).toLocaleDateString('es', { day: 'numeric', month: 'short' })

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={W} height={H} className="overflow-visible">
        <polyline fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinejoin="round"
          strokeLinecap="round" points={points.join(' ')} opacity="0.6" />
        {/* Gradient area */}
        <polygon fill="var(--accent)" opacity="0.08"
          points={`${PX},${H - PY} ${points.join(' ')} ${W - PX},${H - PY}`} />
        {/* Current point */}
        <circle cx={PX + ((scores.length - 1) / (scores.length - 1)) * (W - PX * 2)}
          cy={PY + (1 - (last - min) / range) * (H - PY * 2)}
          r="3" fill="var(--accent)" />
      </svg>
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] font-bold" style={{ color: trendColor }}>
          {trendArrow} {diff > 0 ? '+' : ''}{diff}
        </span>
        <span className="text-[9px] text-[var(--fg-subtle)]">{firstDate} – {lastDate}</span>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   SCORE BREAKDOWN BAR
───────────────────────────────────────────────────────────────────────────── */
function ScoreBar({ label, value, max, color }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-[var(--fg-muted)]">{label}</span>
        <span className="font-semibold text-[var(--fg)]">{value}/{max}</span>
      </div>
      <div className="h-1.5 rounded-full bg-[var(--surface-overlay)] overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700"
          style={{ width: `${(value / max) * 100}%`, background: color }} />
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   SECCIÓN 1 — PERFIL DE COMPORTAMIENTO + SCORE
───────────────────────────────────────────────────────────────────────────── */
const ARCHETYPE_GOAL = {
  PLANIFICADOR: { name: 'Aumentar mi fondo de emergencia', icon: '🛡️', description: 'Meta sugerida por tu perfil planificador: refuerza tu colchón financiero.' },
  CONSERVADOR:  { name: 'Invertir para crecer',             icon: '📈', description: 'Meta sugerida por tu perfil conservador: diversifica tus ahorros.' },
  IMPULSIVO:    { name: 'Reducir gastos hormiga',           icon: '🐜', description: 'Meta sugerida por tu perfil impulsivo: controla los gastos pequeños.' },
  VOLATIL:      { name: 'Estabilizar mis finanzas',         icon: '📊', description: 'Meta sugerida por tu perfil volátil: logra consistencia mensual.' },
  ENDEUDADO:    { name: 'Plan de pago de deudas',           icon: '💳', description: 'Meta sugerida por tu perfil: prioriza eliminar tus deudas.' },
}

function BehavioralProfile({ data, loading, scoreHistory, onCreateGoal }) {
  const [showBreakdown, setShowBreakdown] = useState(false)

  if (loading) return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 flex flex-col gap-4">
      <Skeleton className="h-5 w-40" />
      <div className="flex gap-6">
        <Skeleton className="h-28 w-28 rounded-full shrink-0" />
        <div className="flex-1 flex flex-col gap-3">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
    </div>
  )

  if (!data) return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 flex flex-col items-center gap-4 min-h-[200px] justify-center text-center">
      <span className="text-5xl">📊</span>
      <div>
        <p className="text-sm font-semibold text-[var(--fg)]">Sin historial suficiente</p>
        <p className="text-xs text-[var(--fg-muted)] max-w-xs mt-1">
          Registra al menos un mes de transacciones para ver tu perfil financiero.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-2 mt-1">
        <button onClick={() => onCreateGoal?.({ name: 'Mi primera meta', icon: '🎯', description: 'Empezar a ahorrar' })}
          className="px-4 py-2 rounded-xl border border-[var(--accent-border)] text-[var(--accent)] text-xs font-semibold hover:bg-[var(--accent-subtle)] transition-colors">
          🎯 Crear una meta
        </button>
      </div>
    </div>
  )

  const scoreColor = data.score >= 80 ? '#10b981' : data.score >= 65 ? '#3b82f6'
    : data.score >= 45 ? '#f59e0b' : data.score >= 25 ? '#f97316' : '#ef4444'

  const ARCHETYPE_BG = {
    PLANIFICADOR: 'rgba(16,185,129,0.06)',
    CONSERVADOR:  'rgba(59,130,246,0.06)',
    IMPULSIVO:    'rgba(245,158,11,0.06)',
    VOLATIL:      'rgba(139,92,246,0.06)',
    ENDEUDADO:    'rgba(239,68,68,0.06)',
  }

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden">
      {/* Header band */}
      <div className="px-6 py-5 flex flex-col sm:flex-row sm:items-center gap-5"
        style={{ background: ARCHETYPE_BG[data.archetype_key] ?? 'transparent' }}>

        {/* Score ring + sparkline */}
        <div className="shrink-0 flex flex-col items-center gap-1.5">
          <ScoreRing score={data.score} label={data.score_label} size={112} />
          <span className="text-[10px] text-[var(--fg-subtle)]">Score financiero</span>
          <ScoreSparkline history={scoreHistory} />
        </div>

        {/* Archetype */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-3xl">{data.archetype_emoji}</span>
            <p className="text-lg font-black text-[var(--fg)]">{data.archetype_name}</p>
          </div>
          <p className="text-sm text-[var(--fg-muted)] leading-relaxed">
            {data.archetype_description}
          </p>
          <p className="text-xs text-[var(--fg-subtle)] mt-2">
            Basado en {data.months_analyzed} {data.months_analyzed === 1 ? 'mes' : 'meses'} de historial
          </p>
        </div>
      </div>

      {/* Strengths / Risk */}
      <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-[var(--border)] border-t border-[var(--border)]">
        <div className="px-5 py-4">
          <p className="text-xs font-semibold text-[#10b981] mb-1">✓ Tu fortaleza</p>
          <p className="text-xs text-[var(--fg-muted)] leading-relaxed">{data.archetype_strengths}</p>
        </div>
        <div className="px-5 py-4">
          <p className="text-xs font-semibold text-[#f59e0b] mb-1">⚠ Tu riesgo</p>
          <p className="text-xs text-[var(--fg-muted)] leading-relaxed">{data.archetype_risk}</p>
        </div>
      </div>

      {/* Tip + CTA */}
      <div className="px-5 py-4 bg-[var(--surface-raised)] border-t border-[var(--border)] flex flex-col gap-3">
        <div className="flex items-start gap-2.5">
          <span className="text-lg shrink-0">💡</span>
          <p className="text-xs text-[var(--fg-muted)] leading-relaxed">
            <span className="font-semibold text-[var(--fg)]">Acción recomendada: </span>
            {data.archetype_tip}
          </p>
        </div>
        {ARCHETYPE_GOAL[data.archetype_key] && (
          <button onClick={() => onCreateGoal?.(ARCHETYPE_GOAL[data.archetype_key])}
            className="self-start flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--accent)] text-white text-xs font-semibold hover:opacity-90 transition-opacity">
            <span>{ARCHETYPE_GOAL[data.archetype_key].icon}</span>
            Crear meta: {ARCHETYPE_GOAL[data.archetype_key].name}
          </button>
        )}
      </div>

      {/* Score breakdown (collapsible) */}
      <div className="border-t border-[var(--border)]">
        <button onClick={() => setShowBreakdown(v => !v)}
          className="w-full flex items-center justify-between px-5 py-3 text-xs font-semibold text-[var(--fg-muted)] hover:bg-[var(--surface-raised)] transition-colors">
          <span>Ver desglose del score</span>
          <span className={`transition-transform duration-200 ${showBreakdown ? 'rotate-180' : ''}`}>▾</span>
        </button>

        {showBreakdown && (
          <div className="px-5 pb-5 flex flex-col gap-3">
            <ScoreBar label="Control del gasto"     value={data.score_breakdown.spending_control}    max={30} color={scoreColor} />
            <ScoreBar label="Hábito de ahorro"       value={data.score_breakdown.savings_habit}       max={25} color={scoreColor} />
            <ScoreBar label="Estabilidad mensual"    value={data.score_breakdown.behavioral_stability} max={20} color={scoreColor} />
            <ScoreBar label="Sin gastos anómalos"    value={data.score_breakdown.no_spikes}           max={15} color={scoreColor} />
            <ScoreBar label="Progreso de metas"      value={data.score_breakdown.goal_progress}       max={10} color={scoreColor} />
            <p className="text-[10px] text-[var(--fg-subtle)] text-center mt-1">
              Score = suma ponderada de 5 dimensiones · Máximo 100 puntos
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   SECCIÓN — METAS Y SU IMPACTO EN EL SCORE
───────────────────────────────────────────────────────────────────────────── */
function GoalsImpact({ goalsSummary, loading, onNavigate }) {
  if (loading) return <Skeleton className="h-28 w-full rounded-2xl" />
  if (!goalsSummary) return null

  const { total, completed, completion_rate, score_points, score_max } = goalsSummary
  const pct = score_max > 0 ? (score_points / score_max) * 100 : 0
  const barColor = pct >= 70 ? '#10b981' : pct >= 40 ? '#f59e0b' : '#ef4444'

  const hasGoals = total > 0

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden">
      <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-4">
        {/* Left — score contribution */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">🎯</span>
            <p className="text-sm font-semibold text-[var(--fg)]">Impacto de tus metas en el score</p>
          </div>

          {hasGoals ? (
            <>
              <div className="flex items-center gap-3 mb-2">
                <div className="flex-1 h-2 rounded-full bg-[var(--surface-overlay)] overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${pct}%`, background: barColor }} />
                </div>
                <span className="text-xs font-bold text-[var(--fg)]">{score_points}/{score_max}</span>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--fg-muted)]">
                <span>{total} {total === 1 ? 'meta' : 'metas'} activas</span>
                <span>{completed} completadas</span>
                <span>Avance promedio: <strong className="text-[var(--fg)]">{completion_rate}%</strong></span>
              </div>
              {pct < 50 && (
                <p className="text-[11px] text-[#f59e0b] mt-2">
                  💡 Completar tus metas puede sumar hasta {score_max - score_points} puntos a tu score.
                </p>
              )}
            </>
          ) : (
            <p className="text-xs text-[var(--fg-muted)]">
              No tienes metas activas. Crear metas financieras aporta hasta {score_max} puntos a tu score.
            </p>
          )}
        </div>

        {/* Right — CTA */}
        <button onClick={onNavigate}
          className="shrink-0 px-4 py-2.5 rounded-xl bg-[var(--accent)] text-white text-xs font-semibold hover:opacity-90 transition-opacity self-start sm:self-center">
          {hasGoals ? 'Ver mis metas' : 'Crear mi primera meta'}
        </button>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   SECCIÓN 2 — INSIGHTS PROACTIVOS (detectados por el modelo)
───────────────────────────────────────────────────────────────────────────── */
function ProactiveInsights({ profile, patterns, loading }) {
  if (loading) return (
    <div className="flex flex-col gap-3">
      {[1,2,3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
    </div>
  )

  const insights = [
    ...(profile?.insights ?? []),
    ...(patterns?.negative_patterns ?? []),
  ]

  // Spike days as insights
  if (profile?.spike_days?.length > 0) {
    const top = profile.spike_days[0]
    insights.unshift(
      `Los ${top.day}s gastas en promedio ${top.multiplier}x más que el resto de la semana. Es tu día de mayor riesgo financiero.`
    )
  }

  if (insights.length === 0) return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 flex flex-col items-center gap-3 text-center">
      <span className="text-4xl">🎉</span>
      <p className="text-sm font-semibold text-[var(--fg)]">Sin alertas de comportamiento</p>
      <p className="text-xs text-[var(--fg-muted)]">Tu historial no muestra patrones negativos por el momento.</p>
    </div>
  )

  const ICONS = ['🔍', '⚠️', '💡', '📊', '🐜', '📅']

  return (
    <div className="flex flex-col gap-3">
      {insights.slice(0, 5).map((insight, i) => (
        <div key={i}
          className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl px-4 py-4 flex items-start gap-3 hover:border-[var(--border-strong)] transition-colors">
          <span className="text-xl shrink-0 mt-0.5">{ICONS[i % ICONS.length]}</span>
          <p className="text-sm text-[var(--fg-muted)] leading-relaxed">{insight}</p>
        </div>
      ))}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   SECCIÓN 3 — DÍA DE MAYOR GASTO (heatmap semanal)
───────────────────────────────────────────────────────────────────────────── */
const DAY_SHORT = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do']

function WeeklyHeatmap({ spikeDays, loading }) {
  if (loading) return <Skeleton className="h-20 w-full" />
  if (!spikeDays || spikeDays.length === 0) return null

  const spikeMap = Object.fromEntries(spikeDays.map(s => [s.day, s.multiplier]))
  const DAY_FULL = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo']

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5">
      <p className="text-sm font-semibold text-[var(--fg)] mb-4">¿Cuándo gastas más?</p>
      <div className="grid grid-cols-7 gap-1.5">
        {DAY_FULL.map((day, i) => {
          const mult   = spikeMap[day] ?? 1
          const isHigh = mult >= 1.5
          const isMed  = mult >= 1.2 && mult < 1.5
          const bg     = isHigh ? 'rgba(239,68,68,0.15)' : isMed ? 'rgba(245,158,11,0.12)' : 'var(--surface-raised)'
          const border = isHigh ? 'rgba(239,68,68,0.4)'  : isMed ? 'rgba(245,158,11,0.3)'  : 'var(--border)'
          const color  = isHigh ? '#ef4444' : isMed ? '#f59e0b' : 'var(--fg-subtle)'

          return (
            <div key={day} className="flex flex-col items-center gap-1.5 rounded-xl py-2.5 border"
              style={{ background: bg, borderColor: border }}>
              <span className="text-[11px] font-semibold" style={{ color }}>{DAY_SHORT[i]}</span>
              {isHigh && <span className="text-base">🔥</span>}
              {isMed  && <span className="text-base">📈</span>}
              {!isHigh && !isMed && <span className="text-base opacity-30">·</span>}
              {mult > 1 && (
                <span className="text-[9px] font-bold" style={{ color }}>{mult}x</span>
              )}
            </div>
          )
        })}
      </div>
      <p className="text-[10px] text-[var(--fg-subtle)] mt-3 text-center">
        Comparado con tu promedio diario · 🔥 = gasto 1.5× o más
      </p>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   SECCIÓN 4 — ¿CÓMO ME SIENTO HOY?
───────────────────────────────────────────────────────────────────────────── */
const MOOD_OPTIONS = [
  { emoji: '😰', label: 'Estresado/a',  value: 'Estoy muy estresado por mis deudas y gastos, siento que no alcanzo el dinero' },
  { emoji: '😟', label: 'Preocupado/a', value: 'Me preocupa no poder ahorrar nada este mes, los gastos superan lo esperado' },
  { emoji: '😐', label: 'Normal',       value: 'Mis finanzas están más o menos bien, nada que me quite el sueño por ahora' },
  { emoji: '😊', label: 'Tranquilo/a',  value: 'Me siento bien con mis finanzas, estoy ahorrando y cumpliendo mis metas' },
]

function HowAreYouFeeling() {
  const [text, setText]         = useState('')
  const [result, setResult]     = useState(null)
  const [loading, setLoading]   = useState(false)
  const [selected, setSelected] = useState(null)

  function pickMood(mood) {
    setSelected(mood.emoji); setText(mood.value); setResult(null)
  }

  async function handleAnalyze() {
    if (text.trim().length < 3) return
    setLoading(true)
    try {
      const res = await api.post('/analysis/sentiment', { text })
      setResult(res.data)
    } catch { /* ignore */ } finally { setLoading(false) }
  }

  const isStressed = result?.label === 'ESTRES_CRONICO' || result?.label === 'CHRONIC_STRESS'
  const sentColor  = isStressed ? '#ef4444' : '#10b981'

  const RC = {
    true: {
      emoji: '😰',
      title: 'Parece que estás bajo estrés financiero',
      body: 'Cuando nos sentimos así, tomamos peores decisiones con el dinero. Evita compras importantes hoy.',
      tip: 'Respira. Revisa solo tus alertas pendientes — pequeños ajustes hacen gran diferencia.',
    },
    false: {
      emoji: '😊',
      title: '¡Tienes una buena actitud financiera!',
      body: 'Este es un buen momento para revisar tus metas y planear el próximo mes.',
      tip: 'Aprovecha este estado para analizar si puedes aumentar tu ahorro este mes.',
    },
  }
  const rc = result ? RC[String(isStressed)] : null

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 flex flex-col gap-4">
      <div>
        <p className="text-sm font-semibold text-[var(--fg)]">¿Cómo te sientes con tu dinero hoy?</p>
        <p className="text-xs text-[var(--fg-muted)] mt-0.5">
          Tus emociones afectan tus decisiones financieras. Identificarlas es el primer paso.
        </p>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {MOOD_OPTIONS.map(m => (
          <button key={m.emoji} onClick={() => pickMood(m)}
            className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border transition-all ${
              selected === m.emoji
                ? 'border-[var(--accent)] bg-[var(--accent-subtle)]'
                : 'border-[var(--border)] bg-[var(--surface-raised)] hover:border-[var(--accent-border)]'
            }`}>
            <span className="text-2xl">{m.emoji}</span>
            <span className="text-[10px] font-medium text-[var(--fg-muted)]">{m.label}</span>
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-xs text-[var(--fg-subtle)]">O cuéntanos con tus palabras:</p>
        <textarea value={text} onChange={e => { setText(e.target.value); setSelected(null); setResult(null) }}
          placeholder="Ej: Me preocupa no poder pagar la tarjeta este mes..."
          rows={2}
          className="w-full px-3 py-2.5 rounded-xl bg-[var(--surface-raised)] border border-[var(--border)] text-sm text-[var(--fg)] placeholder:text-[var(--fg-subtle)] outline-none focus:border-[var(--accent-border)] resize-none transition-colors" />
      </div>

      <button onClick={handleAnalyze} disabled={loading || text.trim().length < 3}
        className="w-full py-2.5 rounded-xl bg-[var(--accent)] text-white text-sm font-semibold disabled:opacity-50 hover:opacity-90 transition-opacity">
        {loading ? 'Analizando...' : 'Ver mi análisis emocional'}
      </button>

      {rc && (
        <div className="rounded-xl overflow-hidden border border-[var(--border)]">
          <div className="flex items-center gap-3 px-4 py-4" style={{ background: sentColor + '10' }}>
            <span className="text-4xl">{rc.emoji}</span>
            <div>
              <p className="text-sm font-bold" style={{ color: sentColor }}>{rc.title}</p>
              <p className="text-xs text-[var(--fg-muted)] mt-1 leading-relaxed">{rc.body}</p>
            </div>
          </div>
          <div className="px-4 py-3 bg-[var(--surface-raised)] flex items-start gap-2">
            <span className="text-base shrink-0">💡</span>
            <p className="text-xs text-[var(--fg-muted)] leading-relaxed">{rc.tip}</p>
          </div>
        </div>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   SECCIÓN 5 — ¿PUEDO COMPRAR ESTO?
───────────────────────────────────────────────────────────────────────────── */
function CanIBuyThis({ currency, monthlyIncome }) {
  const [product, setProduct]       = useState('')
  const [price,   setPrice]         = useState('')
  const [method,  setMethod]        = useState('cash')   // 'cash' | 'financed'
  const [months,  setMonths]        = useState('')
  const [rate,    setRate]          = useState('')
  const [result,  setResult]        = useState(null)
  const [loading, setLoading]       = useState(false)

  async function handleCheck() {
    const p = parseFloat(price)
    if (!product.trim() || isNaN(p) || p <= 0) return
    if (method === 'financed' && (!months || parseInt(months) <= 0)) return
    setLoading(true)
    try {
      const body = {
        product_name: product,
        price: p,
        monthly_income: monthlyIncome,
        payment_method: method,
      }
      if (method === 'financed') {
        body.installment_months = parseInt(months)
        if (rate) body.annual_interest_rate = parseFloat(rate)
      }
      const res = await api.post('/analysis/purchase-impact', body)
      setResult(res.data)
    } catch { /* ignore */ } finally { setLoading(false) }
  }

  function resetForm() {
    setResult(null); setProduct(''); setPrice('')
    setMethod('cash'); setMonths(''); setRate('')
  }

  const VERDICT = {
    IMPACTO_BAJO:    { emoji: '✅', color: '#10b981', verdict: '¡Sí puedes comprarlo!',       bg: 'rgba(16,185,129,0.08)' },
    LOW_IMPACT:      { emoji: '✅', color: '#10b981', verdict: '¡Sí puedes comprarlo!',       bg: 'rgba(16,185,129,0.08)' },
    IMPACTO_MEDIO:   { emoji: '🤔', color: '#f59e0b', verdict: 'Piénsalo bien',               bg: 'rgba(245,158,11,0.08)' },
    MEDIUM_IMPACT:   { emoji: '🤔', color: '#f59e0b', verdict: 'Piénsalo bien',               bg: 'rgba(245,158,11,0.08)' },
    IMPACTO_CRITICO: { emoji: '🛑', color: '#ef4444', verdict: 'No es el mejor momento',      bg: 'rgba(239,68,68,0.08)'  },
    CRITICAL_IMPACT: { emoji: '🛑', color: '#ef4444', verdict: 'No es el mejor momento',      bg: 'rgba(239,68,68,0.08)'  },
  }
  const v = result ? (VERDICT[result.level] ?? VERDICT.IMPACTO_MEDIO) : null

  const inputCls = 'w-full px-4 py-3 rounded-xl bg-[var(--surface-raised)] border border-[var(--border)] text-sm text-[var(--fg)] placeholder:text-[var(--fg-subtle)] outline-none focus:border-[var(--accent-border)] transition-colors'
  const isFinanced = method === 'financed'

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 flex flex-col gap-4">
      <div>
        <p className="text-sm font-semibold text-[var(--fg)]">¿Puedo comprar esto?</p>
        <p className="text-xs text-[var(--fg-muted)] mt-0.5">
          Simula el impacto antes de gastar.
        </p>
      </div>

      {!result ? (
        <>
          <div className="flex flex-col gap-2.5">
            <input type="text" value={product} onChange={e => setProduct(e.target.value)}
              placeholder="¿Qué quieres comprar? (ej: iPhone, viaje, moto...)"
              className={inputCls} />
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-[var(--fg-muted)]">$</span>
              <input type="number" value={price} onChange={e => setPrice(e.target.value)}
                placeholder="¿Cuánto cuesta?" min="0"
                className={`${inputCls} pl-8`} />
            </div>

            {/* Payment method toggle */}
            <div className="flex gap-2">
              {[['cash', 'De contado'], ['financed', 'Financiado']].map(([val, label]) => (
                <button key={val} type="button" onClick={() => setMethod(val)}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                    method === val
                      ? 'bg-[var(--accent)] text-white border-[var(--accent)]'
                      : 'bg-[var(--surface-raised)] text-[var(--fg-muted)] border-[var(--border)] hover:border-[var(--accent-border)]'
                  }`}>
                  {label}
                </button>
              ))}
            </div>

            {/* Financing fields */}
            {isFinanced && (
              <div className="flex gap-2">
                <input type="number" value={months} onChange={e => setMonths(e.target.value)}
                  placeholder="Meses (ej: 12, 24, 48)"
                  min="1" max="120"
                  className={inputCls} />
                <div className="relative w-full">
                  <input type="number" value={rate} onChange={e => setRate(e.target.value)}
                    placeholder="Tasa anual % (ej: 15)"
                    min="0" max="100" step="0.1"
                    className={`${inputCls} pr-8`} />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-[var(--fg-muted)]">%</span>
                </div>
              </div>
            )}
          </div>

          <button onClick={handleCheck}
            disabled={loading || !product.trim() || !price || monthlyIncome === 0 || (isFinanced && !months)}
            className="w-full py-2.5 rounded-xl bg-[var(--accent)] text-white text-sm font-semibold disabled:opacity-50 hover:opacity-90 transition-opacity">
            {loading ? 'Calculando...' : '¿Puedo comprarlo?'}
          </button>
          {monthlyIncome === 0 && (
            <p className="text-xs text-[#f59e0b] text-center">
              Configura tu ingreso en el perfil para un análisis preciso.
            </p>
          )}
        </>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="rounded-2xl p-5 flex flex-col items-center gap-2 text-center"
            style={{ background: v.bg }}>
            <span className="text-5xl">{v.emoji}</span>
            <p className="text-base font-black text-[var(--fg)]">{v.verdict}</p>
            <p className="text-sm text-[var(--fg-muted)] leading-relaxed">
              {result.payment_method === 'financed' ? (
                <>
                  <strong>{product}</strong> — cuota de{' '}
                  <span className="font-black" style={{ color: v.color }}>
                    {fmtCurrency(result.monthly_payment, currency)}
                  </span>/mes{' '}
                  representa el{' '}
                  <span className="font-black" style={{ color: v.color }}>
                    {result.impact_pct.toFixed(1)}%
                  </span>{' '}
                  de tu ingreso mensual.
                </>
              ) : (
                <>
                  <strong>{product}</strong> representa el{' '}
                  <span className="font-black" style={{ color: v.color }}>
                    {result.impact_pct.toFixed(1)}%
                  </span>{' '}
                  de tu ingreso mensual.
                </>
              )}
            </p>
          </div>

          {/* Financing breakdown */}
          {result.payment_method === 'financed' && result.monthly_payment && (
            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                ['Cuota mensual', fmtCurrency(result.monthly_payment, currency)],
                ['Costo total',   fmtCurrency(result.total_cost, currency)],
                ['Intereses',     fmtCurrency(result.total_interest, currency)],
              ].map(([label, val]) => (
                <div key={label} className="rounded-xl bg-[var(--surface-raised)] border border-[var(--border)] px-3 py-2.5">
                  <p className="text-[10px] text-[var(--fg-subtle)] uppercase tracking-wide">{label}</p>
                  <p className="text-sm font-bold text-[var(--fg)] mt-0.5">{val}</p>
                </div>
              ))}
            </div>
          )}

          <div className="rounded-xl bg-[var(--surface-raised)] border border-[var(--border)] px-4 py-3">
            <p className="text-xs text-[var(--fg-muted)] leading-relaxed">{result.recommendation}</p>
          </div>
          <button onClick={resetForm}
            className="text-sm font-semibold text-[var(--accent)] hover:underline self-center">
            Consultar otra compra
          </button>
        </div>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   SECCIÓN 6 — PRÓXIMO MES
───────────────────────────────────────────────────────────────────────────── */
function WhatComesNext({ data, loading, currency }) {
  if (loading) return <Skeleton className="h-40 w-full rounded-2xl" />
  if (!data?.predictions?.[0]) return null

  const pred = data.predictions[0]
  const diff = pred.predicted_expense - data.avg_monthly_expense
  const pct  = data.avg_monthly_expense > 0
    ? Math.abs(diff / data.avg_monthly_expense * 100).toFixed(0)
    : 0

  const TREND = {
    CRECIENTE:   { emoji: '📈', color: '#ef4444', msg: `Se estima que este mes gastarás un ${pct}% más de lo normal. Pon atención a tus gastos variables.` },
    INCREASING:  { emoji: '📈', color: '#ef4444', msg: `Se estima que este mes gastarás un ${pct}% más de lo normal. Pon atención a tus gastos variables.` },
    ESTABLE:     { emoji: '📊', color: '#10b981', msg: 'Se espera un mes muy similar al anterior. Buen momento para ahorrar la diferencia.' },
    STABLE:      { emoji: '📊', color: '#10b981', msg: 'Se espera un mes muy similar al anterior. Buen momento para ahorrar la diferencia.' },
    DECRECIENTE: { emoji: '📉', color: '#3b82f6', msg: `Podrías gastar un ${pct}% menos que el promedio. ¡Aprovecha para reforzar tu ahorro!` },
    DECREASING:  { emoji: '📉', color: '#3b82f6', msg: `Podrías gastar un ${pct}% menos que el promedio. ¡Aprovecha para reforzar tu ahorro!` },
  }
  const t = TREND[data.trend] ?? TREND.ESTABLE

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 bg-[var(--surface-raised)] border-b border-[var(--border)]">
        <div>
          <p className="text-xs text-[var(--fg-muted)]">Gasto estimado · {pred.month}</p>
          <p className="text-2xl font-black text-[var(--fg)] mt-0.5">
            {fmtCurrency(pred.predicted_expense, currency)}
          </p>
        </div>
        <span className="text-5xl">{t.emoji}</span>
      </div>
      <div className="px-5 py-4 flex flex-col gap-3">
        <p className="text-xs leading-relaxed" style={{ color: t.color }}>{t.msg}</p>
        <div className="flex items-center justify-between text-xs">
          <span className="text-[var(--fg-subtle)]">Tu promedio actual</span>
          <span className="font-semibold text-[var(--fg)]">{fmtCurrency(data.avg_monthly_expense, currency)}</span>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   BANNER — TRANSACCIONES SIN CATEGORIZAR
══════════════════════════════════════════════════════════════════════════════ */
function UncategorizedBanner({ uncategorized, loading, currency, onNavigate }) {
  if (loading || !uncategorized || uncategorized.count === 0) return null

  return (
    <div className="bg-[#f59e0b]/8 border border-[#f59e0b]/30 rounded-2xl px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3">
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <span className="text-2xl shrink-0">📂</span>
        <div>
          <p className="text-sm font-semibold text-[var(--fg)]">
            {uncategorized.count} {uncategorized.count === 1 ? 'transacción' : 'transacciones'} sin categoría específica
          </p>
          <p className="text-xs text-[var(--fg-muted)] mt-0.5 leading-relaxed">
            Tienes {fmtCurrency(uncategorized.total_amount, currency)} en transacciones con categoría genérica.
            Categorizarlas mejora la precisión de tu análisis financiero.
          </p>
        </div>
      </div>
      <button onClick={onNavigate}
        className="shrink-0 px-4 py-2.5 rounded-xl bg-[#f59e0b] text-white text-xs font-semibold hover:opacity-90 transition-opacity self-start sm:self-center">
        Categorizar ahora
      </button>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   PÁGINA PRINCIPAL
══════════════════════════════════════════════════════════════════════════════ */
export default function Analysis() {
  const { user }      = useAuth()
  const navigate      = useNavigate()
  const currency      = user?.currency ?? 'COP'
  const monthlyIncome = Number(user?.monthlyIncome ?? 0)

  const [profile,      setProfile]      = useState(null)
  const [patterns,     setPatterns]     = useState(null)
  const [predict,      setPredict]      = useState(null)
  const [scoreHistory, setScoreHistory] = useState([])
  const [loading,      setLoading]      = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [profRes, patRes, predRes, histRes] = await Promise.allSettled([
        api.get('/analysis/profile'),
        api.get('/analysis/spending-pattern'),
        api.get('/analysis/predict-expenses?months=1'),
        api.get('/analysis/score-history'),
      ])
      if (profRes.status === 'fulfilled') setProfile(profRes.value.data)
      if (patRes.status  === 'fulfilled') setPatterns(patRes.value.data)
      if (predRes.status === 'fulfilled') setPredict(predRes.value.data)
      if (histRes.status === 'fulfilled') setScoreHistory(histRes.value.data)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-[var(--fg)]">Mi perfil financiero</h1>
          <p className="text-sm text-[var(--fg-muted)] mt-0.5">
            Análisis de tu comportamiento real con el dinero
          </p>
        </div>
        <button onClick={load}
          className="text-xs font-medium text-[var(--accent)] hover:underline shrink-0 mt-1">
          Actualizar
        </button>
      </div>

      {/* 1 — Perfil + Score */}
      <BehavioralProfile data={profile} loading={loading} scoreHistory={scoreHistory}
        onCreateGoal={(goal) => {
          const params = new URLSearchParams({ create: '1', name: goal.name, icon: goal.icon, description: goal.description })
          navigate(`/app/goals?${params}`)
        }}
      />

      {/* 2 — Heatmap semanal */}
      <WeeklyHeatmap spikeDays={profile?.spike_days} loading={loading} />

      {/* 2.3 — Banner transacciones sin categorizar */}
      <UncategorizedBanner
        uncategorized={profile?.uncategorized}
        loading={loading}
        currency={currency}
        onNavigate={() => navigate('/app/transactions')}
      />

      {/* 2.5 — Metas y su impacto */}
      <GoalsImpact
        goalsSummary={profile?.goals_summary}
        loading={loading}
        onNavigate={() => navigate('/app/goals')}
      />

      {/* 3 — Insights proactivos */}
      <div>
        <p className="text-sm font-semibold text-[var(--fg)] mb-3">Lo que detectamos en tu comportamiento</p>
        <ProactiveInsights profile={profile} patterns={patterns} loading={loading} />
      </div>

      {/* 4 + 5 — Sentimiento + Próximo mes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <HowAreYouFeeling />
        <div className="flex flex-col gap-5">
          <WhatComesNext data={predict} loading={loading} currency={currency} />
          {/* Mini stats */}
          {profile && !loading && (
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Ahorro promedio',  value: `${profile.avg_savings_rate}%`,             color: profile.avg_savings_rate >= 10 ? '#10b981' : '#f59e0b' },
                { label: 'Ratio de gasto',   value: `${profile.expense_ratio}%`,                color: profile.expense_ratio <= 50 ? '#10b981' : profile.expense_ratio <= 75 ? '#f59e0b' : '#ef4444' },
                { label: 'Meses analizados', value: `${profile.months_analyzed}`,               color: 'var(--fg)' },
              ].map(s => (
                <div key={s.label} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl px-3 py-3 text-center">
                  <p className="text-xl font-black" style={{ color: s.color }}>{s.value}</p>
                  <p className="text-[10px] text-[var(--fg-muted)] mt-0.5 leading-tight">{s.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 6 — Simulador de compra */}
      <CanIBuyThis currency={currency} monthlyIncome={monthlyIncome} />

    </div>
  )
}
