import { useRef } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import MovingDots from '@/components/ui/MovingDots'
import HeroGlow from '@/components/background/HeroGlow'
import { Globe, FileText, Download, BarChart3, Zap, Shield, Cloud, Search, Cog, Layers, Activity, Brain, Cpu, Database, GitBranch } from 'lucide-react'

const iconComponents = {
  Globe, FileText, Download, BarChart3, Zap, Shield, Cloud, Search, Cog, Layers, Activity, Brain, Cpu, Database, GitBranch,
}

function FloatingIcon({ IconComponent, className, index }) {
  const ref = useRef(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 300, damping: 20 })
  const springY = useSpring(y, { stiffness: 300, damping: 20 })

  return (
    <motion.div
      ref={ref}
      style={{ x: springX, y: springY }}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        delay: index * 0.08,
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={cn('absolute', className)}
    >
      <motion.div
        className="flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-2xl shadow-xl bg-app-elevated/80 backdrop-blur-md border border-app-line"
        animate={{
          y: [0, -8, 0, 8, 0],
          x: [0, 6, 0, -6, 0],
          rotate: [0, 5, 0, -5, 0],
        }}
        transition={{
          duration: 5 + (index % 5),
          repeat: Infinity,
          repeatType: 'mirror',
          ease: 'easeInOut',
        }}
      >
        <IconComponent className="w-6 h-6 md:w-7 md:h-7 text-indigo-600" />
      </motion.div>
    </motion.div>
  )
}

const demoIcons = [
  { id: 1, icon: 'Globe', className: 'top-[10%] left-[6%]' },
  { id: 2, icon: 'Brain', className: 'top-[15%] right-[8%]' },
  { id: 3, icon: 'Database', className: 'top-[75%] left-[5%]' },
  { id: 4, icon: 'BarChart3', className: 'bottom-[10%] right-[6%]' },
  { id: 5, icon: 'Activity', className: 'top-[5%] left-[30%]' },
  { id: 6, icon: 'Shield', className: 'top-[5%] right-[28%]' },
  { id: 7, icon: 'Cloud', className: 'bottom-[8%] left-[26%]' },
  { id: 8, icon: 'Cpu', className: 'top-[38%] left-[3%]' },
  { id: 9, icon: 'GitBranch', className: 'top-[68%] right-[25%]' },
  { id: 10, icon: 'Layers', className: 'top-[45%] right-[2%]' },
  { id: 11, icon: 'Zap', className: 'top-[22%] left-[22%]' },
  { id: 12, icon: 'FileText', className: 'bottom-[28%] right-[22%]' },
]

function FloatingIconsHero({ ctaHref, onCtaClick }) {
  return (
    <section
      className="relative w-full min-h-[85vh] flex items-center justify-center overflow-hidden"
    >
      <video autoPlay muted loop playsInline preload="auto"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-20"
      >
        <source src="/hero-bg.mp4" type="video/mp4" />
      </video>
      <MovingDots count={100} connectionDistance={150} />
      <HeroGlow />
      <div className="absolute inset-0 w-full h-full">
        {demoIcons.map((iconData) => (
              <FloatingIcon
                key={iconData.id}
                IconComponent={iconComponents[iconData.icon]}
            className={iconData.className}
            index={iconData.id}
          />
        ))}
      </div>

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.05),transparent_60%)]" />

      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-50 px-4 py-1.5 text-xs font-medium text-indigo-700"
        >
          <Zap size={12} />
          Now in public beta — try it free
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight text-balance"
        >
          <span className="bg-gradient-to-b from-app-fg to-app-fg/60 bg-clip-text text-transparent">
            Scrape smarter.
          </span>
          <br />
          <span className="bg-gradient-to-r from-indigo-600 via-violet-500 to-cyan-500 bg-clip-text text-transparent">
            Extract everything.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 max-w-2xl mx-auto text-lg md:text-xl text-app-muted leading-relaxed"
        >
          WebScrap Pro combines enterprise-grade web scraping with powerful PDF processing.
          Extract, transform, and export your data with a platform built for reliability and speed.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
        >
          <Button
            onClick={onCtaClick || (() => {})}
            className="bg-gradient-to-r from-indigo-500 to-violet-600 px-8 py-6 text-base font-semibold text-white shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 hover:scale-105 transition-all duration-300"
          >
            Start scraping free
          </Button>
          <Button
            variant="outline"
            onClick={() => window.location.href = ctaHref || '#features'}
            className="border-app-line px-8 py-6 text-base text-app-soft hover:bg-app-surface hover:scale-105 transition-all duration-300"
          >
            Watch demo
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-px overflow-hidden rounded-2xl border border-app-line bg-app-elevated max-w-3xl mx-auto"
        >
          {[
            { value: '10M+', label: 'Pages scraped' },
            { value: '99.9%', label: 'Uptime SLA' },
            { value: '50K+', label: 'Active users' },
            { value: '150+', label: 'Countries' },
          ].map((stat) => (
            <div key={stat.label} className="bg-app-elevated px-4 py-5 text-center">
              <p className="text-2xl md:text-3xl font-bold text-app-fg">{stat.value}</p>
              <p className="mt-1 text-xs text-app-muted">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export { FloatingIconsHero, FloatingIcon }
