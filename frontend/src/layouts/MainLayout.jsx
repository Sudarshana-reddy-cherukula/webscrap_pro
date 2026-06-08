import { Outlet } from 'react-router-dom'
import GlowMenu from '@/components/ui/GlowMenu'
import Footer from '@/components/ui/Footer'
import ParticleBackground from '@/components/ui/ParticleBackground'

function MainLayout() {
  return (
    <div className="relative min-h-screen bg-app-bg text-app-fg">
      <ParticleBackground particleCount={40} />
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(200,90,72,0.04),transparent_50%)]" />
        <div className="absolute inset-0 bg-grid" />
      </div>
      <GlowMenu />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default MainLayout
