export function AuthInput({ label, error, icon: Icon, ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium" style={{ color: 'var(--fg-muted)' }}>
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: 'var(--fg-subtle)' }}>
            <Icon size={16} />
          </span>
        )}
        <input
          {...props}
          className={[
            'w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-all duration-200',
            'border placeholder:text-sm',
            Icon ? 'pl-9' : '',
            error
              ? 'border-error bg-error-light/20 focus:ring-2 focus:ring-error/30'
              : 'focus:ring-2 focus:ring-brand-400/40',
          ].join(' ')}
          style={{
            background: 'var(--surface)',
            borderColor: error ? 'var(--color-error)' : 'var(--border)',
            color: 'var(--fg)',
          }}
        />
      </div>
      {error && (
        <p className="text-xs" style={{ color: 'var(--color-error)' }}>{error}</p>
      )}
    </div>
  )
}
