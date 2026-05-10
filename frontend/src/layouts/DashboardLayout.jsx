import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const navigation = [
  { to: '/dashboard', label: 'Overview' },
  { to: '/scraper', label: 'Web Scraper' },
  { to: '/pdf-tools', label: 'PDF Tools' },
  { to: '/profile', label: 'Profile' },
  { to: '/settings', label: 'Settings' },
]

function DashboardLayout() {
  const { user } = useAuth()

  return (
    <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
      <aside className="glass-card border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-950/90 p-6 shadow-xl shadow-slate-200/20 dark:shadow-slate-950/20">
        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-indigo-500/15 text-2xl text-indigo-600 dark:text-indigo-300">
              {user?.name?.substring(0, 1) || 'U'}
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Account</p>
              <p className="mt-2 text-xl font-semibold text-slate-900 dark:text-white">{user?.name || 'Authenticated User'}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">{user?.email || 'member@datavault.app'}</p>
            </div>
          </div>

          <nav className="space-y-1">
            {navigation.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `block rounded-3xl px-4 py-3 text-sm font-medium transition ${
                    isActive ? 'bg-indigo-500/20 text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="rounded-3xl border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-900/80 p-4 text-sm text-slate-600 dark:text-slate-300">
            <p className="font-semibold text-slate-900 dark:text-white">Workspace benefits</p>
            <p className="mt-2 leading-6 text-slate-500 dark:text-slate-400">
              Fast scraping, PDF conversion, and secure data delivery powered by a clean production-ready frontend.
            </p>
          </div>
        </div>
      </aside>

      <section className="space-y-6">
        <Outlet />
      </section>
    </div>
  )
}

export default DashboardLayout
