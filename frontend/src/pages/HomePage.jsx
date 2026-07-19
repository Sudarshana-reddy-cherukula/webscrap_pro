import { useNavigate } from 'react-router-dom'
import { FloatingIconsHero } from '@/components/ui/FloatingIconsHero'
import FeaturesSection from '@/components/landing/FeaturesSection'
import DashboardPreview from '@/components/landing/DashboardPreview'
import PdfToolsSection from '@/components/landing/PdfToolsSection'
import ScrapingWorkflow from '@/components/landing/ScrapingWorkflow'
import AnalyticsSection from '@/components/landing/AnalyticsSection'
import PricingSection from '@/components/landing/PricingSection'
import FaqSection from '@/components/landing/FaqSection'
import CTASection from '@/components/landing/CTASection'
import Footer from '@/components/ui/Footer'
import HeroGlow from '@/components/background/HeroGlow'
import SectionGlow from '@/components/background/SectionGlow'

function HomePage() {
  const navigate = useNavigate()

  return (
    <div className="bg-app-bg">
      <div className="relative">
        <HeroGlow />
        <FloatingIconsHero
          title=""
          subtitle=""
          ctaText=""
          ctaHref=""
          onCtaClick={() => navigate('/register')}
        />
      </div>
      <div className="relative"><SectionGlow color="amber" position="center" /><FeaturesSection /></div>
      <div className="relative"><SectionGlow color="cyan" position="left" /><DashboardPreview /></div>
      <div className="relative"><SectionGlow color="violet" position="right" /><PdfToolsSection /></div>
      <div className="relative"><SectionGlow color="indigo" position="center" /><ScrapingWorkflow /></div>
      <div className="relative"><SectionGlow color="amber" position="top-left" /><AnalyticsSection /></div>
      <div className="relative"><SectionGlow color="rose" position="center" /><PricingSection /></div>
      <div className="relative"><SectionGlow color="cyan" position="bottom-center" /><FaqSection /></div>
      <div className="relative"><SectionGlow color="violet" position="center" /><CTASection onNavigate={navigate} /></div>
      <Footer />
    </div>
  )
}

export default HomePage
