import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '@/hooks/useTheme'
import { useAuth } from '@/hooks/useAuth'
import { Menu, X, Sun, Moon, LogOut, LayoutDashboard, Globe, FileText, Download, BarChart3, Settings, User } from 'lucide-react'

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

function GlowMenu() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { theme, toggleTheme } = useTheme()
  const { isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-4">
        <motion.nav
          className="p-2 rounded-2xl bg-gradient-to-b from-zinc-900/90 to-zinc-950/80 backdrop-blur-2xl border border-app-line shadow-lg relative overflow-hidden"
          initial="initial"
          whileHover="hover"
        >
          <motion.div
            className="absolute -inset-2 bg-gradient-radial from-transparent via-cyan-400/20 via-30% via-purple-400/20 via-60% via-blue-400/20 via-90% to-transparent rounded-3xl z-0 pointer-events-none"
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
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 text-[9px] font-bold text-app-fg shadow-lg shadow-cyan-500/20 tracking-tight leading-none">
                WP
              </div>
              <span className="text-lg font-bold tracking-tight text-app-fg">
                WebScrap <span className="text-cyan-400">Pro</span>
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
                        background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, rgba(37,99,235,0.06) 50%, rgba(29,78,216,0) 100%)',
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
              <motion.button
                type="button"
                className="rounded-xl border border-app-line bg-app-surface p-2 text-app-muted transition hover:bg-app-surface hover:text-app-fg"
                onClick={toggleTheme}
                aria-label="Toggle theme"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              </motion.button>
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
                    className="rounded-xl border border-app-line bg-app-surface p-2 text-app-muted transition hover:bg-app-surface hover:text-red-400"
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
                    className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-sm font-semibold text-app-fg shadow-lg shadow-cyan-500/20 transition hover:shadow-cyan-500/30"
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
                        isActive ? 'bg-cyan-500/10 text-cyan-300' : 'text-app-muted hover:bg-app-surface hover:text-app-nav'
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
                <div className="mt-2 flex gap-2 border-t border-app-line pt-3">
                  <button
                    type="button"
                    className="flex-1 rounded-xl border border-app-line bg-app-surface px-4 py-2 text-sm text-app-muted transition hover:bg-app-surface hover:text-app-fg"
                    onClick={toggleTheme}
                  >
                    {theme === 'dark' ? 'Light mode' : 'Dark mode'}
                  </button>
                  {isAuthenticated ? (
                    <button
                      type="button"
                      className="flex-1 rounded-xl border border-app-line bg-app-surface px-4 py-2 text-sm text-red-400 transition hover:bg-app-surface"
                      onClick={handleLogout}
                    >
                      Log out
                    </button>
                  ) : (
                    <Link
                      to="/register"
                      onClick={() => setMobileOpen(false)}
                      className="flex-1 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-center text-sm font-semibold text-app-fg"
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
