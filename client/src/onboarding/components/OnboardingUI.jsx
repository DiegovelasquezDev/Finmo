// Componentes UI reutilizables para el wizard de onboarding

export function StepButton({ children, loading, ...props }) {
  return (
    <button
      type="submit"
      disabled={loading}
      {...props}
      className="w-full mt-2 rounded-xl py-3 px-4 text-sm font-semibold text-white transition-all duration-200 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
      style={{ background: 'var(--color-brand-500)' }}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          Guardando…
        </span>
      ) : children}
    </button>
  )
}

export function FormRow({ label, sub, error, children }) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label className="text-sm font-medium" style={{ color: 'var(--fg)' }}>
          {label}
          {sub && <span className="ml-1.5 text-xs font-normal" style={{ color: 'var(--fg-subtle)' }}>— {sub}</span>}
        </label>
      )}
      {children}
      {error && <p className="text-xs" style={{ color: 'var(--color-error)' }}>{error}</p>}
    </div>
  )
}

export function Select({ value, onChange, children, placeholder }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full px-3 py-2 rounded-xl text-sm outline-none transition-colors border"
      style={{
        background: 'var(--surface-raised)',
        borderColor: 'var(--border)',
        color: value ? 'var(--fg)' : 'var(--fg-subtle)',
      }}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {children}
    </select>
  )
}

export function MoneyInput({ value, onChange, placeholder = '0', error, symbol = '$' }) {
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium pointer-events-none"
            style={{ color: 'var(--fg-subtle)' }}>{symbol}</span>
      <input
        type="number"
        min={0}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-7 pr-3 py-2 rounded-xl text-sm outline-none transition-colors border"
        style={{
          background: 'var(--surface-raised)',
          borderColor: error ? 'var(--color-error)' : 'var(--border)',
          color: 'var(--fg)',
        }}
      />
    </div>
  )
}

export function RadioGroup({ value, onChange, options, cols = 1 }) {
  return (
    <div className={`grid gap-2 ${cols === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
      {options.map(opt => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={[
            'rounded-xl px-4 py-3 text-left text-sm transition-all duration-150 border',
            value === opt.value
              ? 'border-[var(--color-brand-500)] bg-[var(--color-brand-50)]'
              : 'border-[var(--border)] hover:border-[var(--color-brand-300)] bg-[var(--surface-raised)]',
          ].join(' ')}
        >
          <span className="font-medium block" style={{ color: value === opt.value ? 'var(--color-brand-600)' : 'var(--fg)' }}>
            {opt.label}
          </span>
          {opt.sub && (
            <span className="text-xs mt-0.5 block" style={{ color: 'var(--fg-subtle)' }}>{opt.sub}</span>
          )}
        </button>
      ))}
    </div>
  )
}

export function SliderInput({ value, onChange, min = 0, max = 100, step = 1 }) {
  return (
    <div className="flex flex-col gap-2 pt-1">
      <input
        type="range"
        min={min} max={max} step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full accent-[var(--color-brand-500)] h-2 rounded-full cursor-pointer"
      />
      <div className="flex justify-between text-xs" style={{ color: 'var(--fg-subtle)' }}>
        <span>{min}{min === 0 && max === 100 ? '%' : ''}</span>
        <span>{max}{min === 0 && max === 100 ? '%' : ''}</span>
      </div>
    </div>
  )
}
