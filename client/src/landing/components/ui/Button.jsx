export function ButtonPrimary({ children, href = '#', className = '' }) {
  return (
    <a
      href={href}
      className={`inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-sm font-semibold text-white
        bg-[var(--accent)] hover:bg-[var(--accent-hover)]
        active:scale-[0.98] transition-all duration-200
        shadow-[0_8px_32px_-4px_rgb(93_69_115_/_0.35)] hover:shadow-[0_12px_40px_-4px_rgb(93_69_115_/_0.45)]
        ${className}`}
    >
      {children}
    </a>
  )
}

export function ButtonSecondary({ children, href = '#', className = '' }) {
  return (
    <a
      href={href}
      className={`inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-sm font-semibold
        text-[var(--accent)] border border-[var(--accent-border)]
        hover:border-[var(--accent)] hover:bg-[var(--accent-subtle)]
        active:scale-[0.98] transition-all duration-200
        ${className}`}
    >
      {children}
    </a>
  )
}
