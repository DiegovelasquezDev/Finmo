import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

export default function Footer() {
  const { t } = useTranslation()

  return (
    <footer className="bg-[var(--bg-subtle)] border-t border-[var(--border)]">
      <div className="mx-auto max-w-[1200px] px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2">
            <a href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-[#5d4573] flex items-center justify-center shadow-sm">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 2L13 5.5V10.5L8 14L3 10.5V5.5L8 2Z" fill="white" fillOpacity="0.9"/>
                  <path d="M8 5L10.5 6.5V9.5L8 11L5.5 9.5V6.5L8 5Z" fill="white"/>
                </svg>
              </div>
              <span className="font-semibold text-[var(--fg)]">Finmo</span>
            </a>
            <p className="text-sm text-[var(--fg-muted)] leading-relaxed max-w-xs">
              {t('footer.tagline')}
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-xs font-semibold text-[var(--fg)] uppercase tracking-wider mb-4">{t('footer.product')}</h4>
            <ul className="flex flex-col gap-2.5">
              {[
                { label: t('footer.features'),   href: '#features' },
                { label: t('footer.howItWorks'),  href: '#how-it-works' },
                { label: t('footer.research'),    href: '#metrics' },
                { label: t('footer.register'),    href: '/auth' },
              ].map(link => (
                <li key={link.label}>
                  <a href={link.href} className="text-sm text-[var(--fg-muted)] hover:text-[var(--accent)] transition-colors duration-150">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Team */}
          <div>
            <h4 className="text-xs font-semibold text-[var(--fg)] uppercase tracking-wider mb-4">{t('footer.team')}</h4>
            <ul className="flex flex-col gap-2.5">
              <li className="text-sm text-[var(--fg-muted)]">{t('footer.student1')}</li>
              <li className="text-sm text-[var(--fg-muted)]">{t('footer.student2')}</li>
              <li className="text-sm text-[var(--fg-muted)]">{t('footer.student3')}</li>
              <li className="text-sm text-[var(--fg-muted)] mt-1 pt-1 border-t border-[var(--border)]">
                <span className="text-xs text-[var(--fg-subtle)] block mb-0.5">{t('team.advisor')}</span>
                {t('footer.advisor')}
              </li>
            </ul>
          </div>

          {/* Project */}
          <div>
            <h4 className="text-xs font-semibold text-[var(--fg)] uppercase tracking-wider mb-4">{t('footer.project')}</h4>
            <ul className="flex flex-col gap-2.5">
              <li className="text-sm text-[var(--fg-muted)]">{t('footer.institution')}</li>
              <li className="text-sm text-[var(--fg-muted)]">{t('footer.program')}</li>
              <li className="text-sm text-[var(--fg-muted)]">{t('footer.thesis')}</li>
            </ul>
          </div>
        </div>

        {/* Bottom strip */}
        <div className="pt-8 border-t border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--fg-subtle)]">
          <span>© {new Date().getFullYear()} {t('footer.copyright')}</span>
          <div className="flex gap-6">
            <Link to="/privacy" className="hover:text-[var(--accent)] transition-colors">{t('footer.privacyLink')}</Link>
            <Link to="/terms" className="hover:text-[var(--accent)] transition-colors">{t('footer.termsLink')}</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
