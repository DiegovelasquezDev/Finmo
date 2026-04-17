import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useReveal } from '../../../shared/hooks/useReveal'

export default function CTA() {
  const { t } = useTranslation()
  const [email,     setEmail]     = useState('')
  const [password,  setPassword]  = useState('')
  const [submitted, setSubmitted] = useState(false)
  const titleRef = useReveal()
  const formRef  = useReveal()

  const handleSubmit = e => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <section id="cta" className="relative py-28 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#5d4573] via-[#4a3659] to-[#392944]" />
      <div className="absolute inset-0 opacity-[0.03]"
        style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")'}}
      />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#a97ecb]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-[#5d4573]/30 rounded-full blur-3xl pointer-events-none" />

      <div className="relative mx-auto max-w-[1200px] px-6 flex flex-col items-center text-center">
        <div ref={titleRef} className="reveal">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-white/10 text-white border border-white/20 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            {t('cta.badge')}
          </span>
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-white tracking-tight max-w-2xl mx-auto leading-tight">
            {t('cta.headline')}
          </h2>
          <p className="mt-5 text-white/70 text-lg max-w-lg mx-auto">
            {t('cta.sub')}
          </p>
        </div>

        <div ref={formRef} className="reveal reveal-delay-2 mt-12 w-full max-w-sm">
          {submitted ? (
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 text-center">
              <div className="w-12 h-12 rounded-full bg-[#10b981] flex items-center justify-center mx-auto mb-4">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">{t('cta.successTitle')}</h3>
              <p className="text-white/60 text-sm">{t('cta.successSub')}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-7 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5 text-left">
                <label className="text-xs font-medium text-white/70">{t('cta.labelEmail')}</label>
                <input
                  type="email" required
                  placeholder={t('cta.placeholderEmail')}
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/30 text-sm focus:outline-none focus:border-white/60 focus:bg-white/15 transition-all"
                />
              </div>
              <div className="flex flex-col gap-1.5 text-left">
                <label className="text-xs font-medium text-white/70">{t('cta.labelPass')}</label>
                <input
                  type="password" required minLength={8}
                  placeholder={t('cta.placeholderPass')}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/30 text-sm focus:outline-none focus:border-white/60 focus:bg-white/15 transition-all"
                />
              </div>
              <button type="submit" className="w-full mt-1 py-3.5 rounded-xl bg-white text-[#5d4573] font-semibold text-sm hover:bg-white/90 active:scale-[0.98] transition-all duration-200 shadow-lg">
                {t('cta.submit')}
              </button>
              <p className="text-center text-xs text-white/40">{t('cta.fine')}</p>
            </form>
          )}
        </div>

        <div className="reveal reveal-delay-3 mt-10 flex flex-wrap items-center justify-center gap-8 text-white/40 text-xs">
          {[
            { icon: '🔒', key: 'trustEncryption' },
            { icon: '👥', key: 'trustUsers'      },
            { icon: '⭐', key: 'trustRating'     },
          ].map(b => (
            <span key={b.key} className="flex items-center gap-1.5">{b.icon} {t(`cta.${b.key}`)}</span>
          ))}
        </div>
      </div>
    </section>
  )
}
