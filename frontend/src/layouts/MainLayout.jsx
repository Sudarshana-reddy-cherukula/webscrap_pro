import { Outlet } from 'react-router-dom'
import GlowMenu from '@/components/ui/GlowMenu'
import Footer from '@/components/ui/Footer'
import { useTheme } from '@/hooks/useTheme'
import ParticleBackground from '@/components/ui/ParticleBackground'
import { Sun, Moon } from 'lucide-react'

function MainLayout() {
  const { theme, toggleTheme } = useTheme()
  return (
    <div className="relative min-h-screen bg-app-bg text-app-fg">
      <ParticleBackground particleCount={40} />
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(6,182,212,0.06),transparent_50%)]" />
        <div className="absolute inset-0 bg-grid" />
      </div>
      <GlowMenu />
      <button
        type="button"
        onClick={toggleTheme}
        className="fixed bottom-6 left-6 z-50 flex h-10 w-10 items-center justify-center rounded-xl border border-app-line bg-app-elevated/80 text-app-muted backdrop-blur-xl transition hover:border-app-line-strong hover:text-app-nav"
        title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
      </button>
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default MainLayout
