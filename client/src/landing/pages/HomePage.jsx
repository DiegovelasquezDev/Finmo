import Hero            from '../components/sections/Hero'
import Problem         from '../components/sections/Problem'
import HowItWorks      from '../components/sections/HowItWorks'
import Features        from '../components/sections/Features'
import Metrics         from '../components/sections/Metrics'
import DashboardPreview from '../components/sections/DashboardPreview'
import Benefits        from '../components/sections/Benefits'
import Team            from '../components/sections/Team'
import CTA             from '../components/sections/CTA'

export default function HomePage() {
  return (
    <>
      <Hero />
      <Problem />
      <HowItWorks />
      <Features />
      <Metrics />
      <DashboardPreview />
      <Benefits />
      <Team />
      <CTA />
    </>
  )
}
