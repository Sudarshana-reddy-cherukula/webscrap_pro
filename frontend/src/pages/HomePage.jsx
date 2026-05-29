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

function HomePage() {
  const navigate = useNavigate()

  return (
    <div className="bg-app-bg">
      <FloatingIconsHero
        title=""
        subtitle=""
        ctaText=""
        ctaHref=""
        onCtaClick={() => navigate('/register')}
      />

      <FeaturesSection />
      <DashboardPreview />
      <PdfToolsSection />
      <ScrapingWorkflow />
      <AnalyticsSection />
      <PricingSection />
      <FaqSection />
      <CTASection onNavigate={navigate} />

      <Footer />
    </div>
  )
}

export default HomePage
