import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '@/hooks/useTheme'
import { useAuth } from '@/hooks/useAuth'
import { Menu, X, Sun, Moon, LogOut, LayoutDashboard } from 'lucide-react'

const publicLinks = [
  { to: '/', label: 'Home', end: true },
  { to: '/pricing', label: 'Pricing' },
  { to: '/faq', label: 'FAQ' },
]

const privateLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/scraper', label: 'Scraper' },
  { to: '/pdf-tools', label: 'PDF Tools' },
  { to: '/export', label: 'Export' },
  { to: '/analytics', label: 'Analytics' },
  { to: '/settings', label: 'Settings' },
]

function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { theme, toggleTheme } = useTheme()
  const { isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-50 border-b border-app-line bg-app-bg/80 backdrop-blur-2xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="group flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 text-xs font-bold text-app-fg shadow-lg shadow-cyan-500/20">
            S
          </div>
          <span className="text-lg font-bold tracking-tight text-app-fg">
            Scrape<span className="text-cyan-400">Flow</span>
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

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary navigation">
          {(isAuthenticated ? privateLinks : publicLinks).map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `relative rounded-xl px-3.5 py-2 text-sm font-medium transition ${
                  isActive
                    ? 'text-app-fg'
                    : 'text-app-muted hover:bg-app-surface hover:text-app-nav'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {item.label}
                  {isActive && (
                    <motion.span
                      layoutId="nav-glow"
                      className="absolute inset-0 rounded-xl bg-gradient-to-b from-cyan-500/10 to-blue-600/5 shadow-lg shadow-cyan-500/5"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <button
            type="button"
            className="rounded-xl border border-app-line bg-app-surface p-2 text-app-muted transition hover:bg-app-surface hover:text-app-fg"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          {isAuthenticated ? (
            <button
              type="button"
              className="rounded-xl border border-app-line bg-app-surface p-2 text-app-muted transition hover:bg-app-surface hover:text-red-400"
              onClick={handleLogout}
              aria-label="Logout"
            >
              <LogOut size={16} />
            </button>
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

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-app-line"
          >
            <nav className="flex flex-col gap-1 px-4 pb-4 pt-2">
              {(isAuthenticated ? privateLinks : publicLinks).map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
                      isActive
                        ? 'bg-cyan-500/10 text-cyan-300'
                        : 'text-app-muted hover:bg-app-surface hover:text-app-nav'
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
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

export default Navbar
