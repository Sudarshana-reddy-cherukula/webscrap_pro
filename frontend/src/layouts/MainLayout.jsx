import { Outlet } from 'react-router-dom'
import GlowMenu from '@/components/ui/GlowMenu'
import Footer from '@/components/ui/Footer'
import PremiumBackground from '@/components/background/PremiumBackground'

function MainLayout() {
  return (
    <div className="relative min-h-screen bg-app-bg text-app-fg overflow-x-hidden">
      <PremiumBackground variant="full" />
      <GlowMenu />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default MainLayout
