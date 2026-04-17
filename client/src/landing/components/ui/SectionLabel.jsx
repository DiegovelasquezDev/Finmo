export function SectionLabel({ children }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-widest uppercase bg-[var(--accent-subtle)] text-[var(--accent)] border border-[var(--accent-border)]/40">
      {children}
    </span>
  )
}
