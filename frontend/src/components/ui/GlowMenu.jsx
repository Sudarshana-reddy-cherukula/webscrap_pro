import { useState, useRef, useEffect, useCallback } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { Menu, X, LogOut } from 'lucide-react'

const menuItems = [
  { to: '/', label: 'Home', icon: null, end: true },
  { to: '/pricing', label: 'Pricing', icon: null },
  { to: '/faq', label: 'FAQ', icon: null },
]

const itemVariants = {
  initial: { rotateX: 0, opacity: 1 },
  hover: { rotateX: -90, opacity: 0 },
}

const backVariants = {
  initial: { rotateX: 90, opacity: 0 },
  hover: { rotateX: 0, opacity: 1 },
}

const sharedTransition = {
  type: 'spring',
  stiffness: 100,
  damping: 20,
  duration: 0.5,
}

const DOT_COUNT = 6
const DOT_COLORS = ['99,102,241', '139,92,246', '6,182,212', '79,70,229', '59,130,246', '168,85,247']

function GlowMenu() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const navRef = useRef(null)
  const dotsRef = useRef([])
  const mouseRef = useRef({ x: 0, y: 0 })
  const animRef = useRef(null)
  const [headerHover, setHeaderHover] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  useEffect(() => {
    dotsRef.current = Array.from({ length: DOT_COUNT }, () => ({
      x: 0, y: 0, vx: 0, vy: 0,
      size: Math.random() * 3 + 2,
      color: DOT_COLORS[Math.floor(Math.random() * DOT_COLORS.length)],
      alpha: Math.random() * 0.5 + 0.2,
      targetX: 0, targetY: 0,
    }))
  }, [])

  const handleMouseMove = useCallback((e) => {
    if (!navRef.current) return
    const rect = navRef.current.getBoundingClientRect()
    mouseRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    }
  }, [])

  const handleMouseEnter = useCallback(() => setHeaderHover(true), [])
  const handleMouseLeave = useCallback(() => {
    setHeaderHover(false)
    mouseRef.current = { x: -200, y: -200 }
  }, [])

  useEffect(() => {
    if (!headerHover) {
      if (animRef.current) cancelAnimationFrame(animRef.current)
      return
    }

    const canvas = navRef.current?.querySelector('canvas')
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const resize = () => {
      const parent = navRef.current
      if (parent) {
        canvas.width = parent.offsetWidth
        canvas.height = parent.offsetHeight
      }
    }
    resize()

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      for (const dot of dotsRef.current) {
        const dx = mouseRef.current.x - dot.x
        const dy = mouseRef.current.y - dot.y
        const dist = Math.sqrt(dx * dx + dy * dy)

        if (dist < 200 && dist > 1) {
          const force = (200 - dist) / 200
          dot.vx += (dx / dist) * force * 0.8
          dot.vy += (dy / dist) * force * 0.8
        }

        dot.vx *= 0.92
        dot.vy *= 0.92
        dot.x += dot.vx
        dot.y += dot.vy

        if (dot.x < 0) dot.vx = Math.abs(dot.vx) * 0.5
        if (dot.x > canvas.width) dot.vx = -Math.abs(dot.vx) * 0.5
        if (dot.y < 0) dot.vy = Math.abs(dot.vy) * 0.5
        if (dot.y > canvas.height) dot.vy = -Math.abs(dot.vy) * 0.5

        const pulse = Math.sin(Date.now() * 0.003 + dot.x * 0.01) * 0.15 + 0.85
        ctx.beginPath()
        ctx.arc(dot.x, dot.y, dot.size * pulse, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${dot.color},${dot.alpha * pulse})`
        ctx.fill()

        ctx.beginPath()
        ctx.arc(dot.x, dot.y, dot.size * 2.5 * pulse, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${dot.color},${dot.alpha * 0.15 * pulse})`
        ctx.fill()
      }

      for (let i = 0; i < dotsRef.current.length; i++) {
        for (let j = i + 1; j < dotsRef.current.length; j++) {
          const a = dotsRef.current[i]
          const b = dotsRef.current[j]
          const dx = a.x - b.x
          const dy = a.y - b.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 80) {
            const alpha = (1 - dist / 80) * 0.2
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.strokeStyle = `rgba(99,102,241,${alpha})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      }

      const mdx = mouseRef.current.x
      const mdy = mouseRef.current.y
      if (mdx > 0 && mdy > 0) {
        const gradient = ctx.createRadialGradient(mdx, mdy, 0, mdx, mdy, 60)
        gradient.addColorStop(0, 'rgba(99,102,241,0.12)')
        gradient.addColorStop(0.5, 'rgba(139,92,246,0.06)')
        gradient.addColorStop(1, 'rgba(139,92,246,0)')
        ctx.beginPath()
        ctx.arc(mdx, mdy, 60, 0, Math.PI * 2)
        ctx.fillStyle = gradient
        ctx.fill()
      }

      animRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current)
    }
  }, [headerHover])

  return (
    <header className="sticky top-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-4">
        <motion.nav
          ref={navRef}
          className="p-2 rounded-2xl bg-app-elevated/80 backdrop-blur-2xl border border-app-line shadow-lg relative overflow-hidden"
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          initial="initial"
          whileHover="hover"
        >
          <canvas className="absolute inset-0 w-full h-full pointer-events-none z-0" />

          <motion.div
            className="absolute -inset-2 bg-gradient-radial from-transparent via-indigo-400/10 via-30% via-violet-400/10 via-60% via-cyan-400/10 via-90% to-transparent rounded-3xl z-0 pointer-events-none"
            variants={{
              initial: { opacity: 0 },
              hover: {
                opacity: 1,
                transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
              },
            }}
          />

          <div className="flex items-center justify-between relative z-10">
            <Link to="/" className="group flex items-center gap-2.5 px-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-[9px] font-bold text-white shadow-lg shadow-indigo-500/20 tracking-tight leading-none">
                WP
              </div>
              <span className="text-lg font-bold tracking-tight text-app-fg">
                WebScrap <span className="bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">Pro</span>
              </span>
            </Link>

            <button
              type="button"
              className="inline-flex items-center justify-center rounded-xl border border-app-line bg-app-surface p-2 text-app-muted transition hover:bg-app-surface hover:text-app-fg lg:hidden"
              aria-label="Toggle navigation menu"
              onClick={() => setMobileOpen((prev) => !prev)}
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>

            <ul className="hidden lg:flex items-center gap-1">
              {menuItems.map((item) => (
                <motion.li key={item.to} className="relative">
                  <motion.div
                    className="block rounded-xl overflow-visible group relative"
                    style={{ perspective: '600px' }}
                    whileHover="hover"
                    initial="initial"
                  >
                    <motion.div
                      className="absolute inset-0 z-0 pointer-events-none rounded-xl"
                      variants={{
                        initial: { opacity: 0, scale: 0.8 },
                        hover: {
                          opacity: 1,
                          scale: 2,
                          transition: {
                            opacity: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
                            scale: { duration: 0.5, type: 'spring', stiffness: 300, damping: 25 },
                          },
                        },
                      }}
                      style={{
                        background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, rgba(139,92,246,0.03) 50%, rgba(139,92,246,0) 100%)',
                      }}
                    />
                    <motion.div
                      variants={itemVariants}
                      transition={sharedTransition}
                      style={{ transformStyle: 'preserve-3d', transformOrigin: 'center bottom' }}
                    >
                      <NavLink
                        to={item.to}
                        end={item.end}
                        className={({ isActive }) =>
                          `flex items-center gap-2 px-4 py-2 relative z-10 bg-transparent text-muted-foreground transition-colors rounded-xl text-sm font-medium ${
                            isActive ? 'text-app-fg' : 'text-app-muted hover:text-app-fg'
                          }`
                        }
                      >
                        {item.label}
                      </NavLink>
                    </motion.div>
                    <motion.div
                      variants={backVariants}
                      transition={sharedTransition}
                      style={{ transformStyle: 'preserve-3d', transformOrigin: 'center top', rotateX: 90 }}
                      className="absolute inset-0 z-10"
                    >
                      <NavLink
                        to={item.to}
                        end={item.end}
                        className={({ isActive }) =>
                          `flex items-center gap-2 px-4 py-2 bg-transparent rounded-xl text-sm font-medium ${
                            isActive ? 'text-app-fg' : 'text-app-muted'
                          }`
                        }
                      >
                        {item.label}
                      </NavLink>
                    </motion.div>
                  </motion.div>
                </motion.li>
              ))}
            </ul>

            <div className="hidden lg:flex items-center gap-2">
              {isAuthenticated ? (
                <div className="flex items-center gap-2">
                  <Link
                    to="/dashboard"
                    className="rounded-xl border border-app-line px-4 py-2 text-sm font-medium text-app-soft transition hover:bg-app-surface hover:text-app-fg"
                  >
                    Dashboard
                  </Link>
                  <motion.button
                    type="button"
                    className="rounded-xl border border-app-line bg-app-surface p-2 text-app-muted transition hover:bg-app-surface hover:text-red-500"
                    onClick={handleLogout}
                    aria-label="Logout"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <LogOut size={16} />
                  </motion.button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="rounded-xl border border-app-line px-4 py-2 text-sm font-medium text-app-soft transition hover:bg-app-surface hover:text-app-fg"
                  >
                    Log in
                  </Link>
                  <Link
                    to="/register"
                    className="rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:shadow-indigo-500/30"
                  >
                    Sign up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </motion.nav>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
          >
            <div className="mt-1 p-2 rounded-2xl bg-app-elevated/95 backdrop-blur-2xl border border-app-line shadow-lg">
              <nav className="flex flex-col gap-1 px-2 pb-2 pt-1">
                {menuItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
                        isActive ? 'bg-indigo-500/10 text-indigo-700' : 'text-app-muted hover:bg-app-surface hover:text-app-nav'
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
                <div className="mt-2 flex gap-2 border-t border-app-line pt-3">
                  {isAuthenticated ? (
                    <button
                      type="button"
                      className="flex-1 rounded-xl border border-app-line bg-app-surface px-4 py-2 text-sm text-red-500 transition hover:bg-app-surface"
                      onClick={handleLogout}
                    >
                      Log out
                    </button>
                  ) : (
                    <Link
                      to="/register"
                      onClick={() => setMobileOpen(false)}
                      className="flex-1 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-4 py-2 text-center text-sm font-semibold text-white"
                    >
                      Sign up
                    </Link>
                  )}
                </div>
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

export default GlowMenu
