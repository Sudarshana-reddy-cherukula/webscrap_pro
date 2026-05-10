import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useTheme } from '../../hooks/useTheme'
import { useAuth } from '../../hooks/useAuth'

const publicLinks = [{ to: '/', label: 'Home', end: true }]
const privateLinks = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/scraper', label: 'Scraping' },
  { to: '/pdf-tools', label: 'PDF Tools' },
  { to: '/profile', label: 'Profile' },
  { to: '/settings', label: 'Settings' },
]

function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { themeIcon, toggleTheme } = useTheme()
  const { isAuthenticated, logout } = useAuth()

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 dark:border-slate-700/70 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <NavLink to="/" className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
            DataVault
          </NavLink>
          <span className="hidden rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-600 dark:text-slate-400 sm:inline-flex">
            SaaS
          </span>
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-100/90 dark:bg-slate-800/90 p-2 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 sm:hidden"
          aria-label="Toggle navigation menu"
          onClick={() => setMobileOpen((prev) => !prev)}
        >
          ☰
        </button>

        <nav
          className={`${
            mobileOpen ? 'grid gap-2' : 'hidden'
          } sm:grid sm:auto-cols-auto sm:grid-flow-col sm:items-center sm:gap-4`}
          aria-label="Primary navigation"
        >
          {(isAuthenticated ? privateLinks : publicLinks).map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `rounded-full px-3 py-2 text-sm font-medium transition ${
                  isActive ? 'bg-indigo-500/20 text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
                }`
              }
              onClick={() => setMobileOpen(false)}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="rounded-2xl border border-slate-300 dark:border-slate-700/90 bg-slate-100 dark:bg-slate-900/80 px-3 py-2 text-slate-700 dark:text-slate-300 transition hover:bg-slate-200 dark:hover:bg-slate-800/90"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {themeIcon}
          </button>
          {isAuthenticated ? (
            <button
              type="button"
              className="rounded-2xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500"
              onClick={logout}
            >
              Logout
            </button>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <NavLink
                to="/login"
                className="rounded-2xl border border-slate-300 dark:border-slate-700 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 transition hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
              >
                Login
              </NavLink>
              <NavLink
                to="/register"
                className="rounded-2xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500"
              >
                Sign Up
              </NavLink>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Navbar
