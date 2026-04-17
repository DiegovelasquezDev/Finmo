export function AuthButton({ children, loading, ...props }) {
  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className={[
        'w-full rounded-xl py-2.5 px-4 text-sm font-semibold transition-all duration-200',
        'bg-brand-500 text-white hover:bg-brand-600 active:scale-[0.98]',
        'focus:outline-none focus:ring-2 focus:ring-brand-400/50',
        'disabled:opacity-60 disabled:cursor-not-allowed',
        props.className ?? '',
      ].join(' ')}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          Cargando…
        </span>
      ) : children}
    </button>
  )
}
