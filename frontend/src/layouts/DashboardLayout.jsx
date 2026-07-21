import { useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import PremiumBackground from '@/components/background/PremiumBackground'
import {
  LayoutDashboard,
  Globe,
  FileText,
  Download,
  BarChart3,
  Brain,
  Settings,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Workflow,
  Shield,
} from 'lucide-react'

const navigation = [
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { to: '/scraper', label: 'Web Scraper', icon: Globe },
  { to: '/pdf-tools', label: 'PDF Tools', icon: FileText },
  { to: '/export', label: 'Export Center', icon: Download },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/ai', label: 'AI Dashboard', icon: Brain },
  { to: '/workflows', label: 'Workflows', icon: Workflow },
  { to: '/admin', label: 'Admin', icon: Shield },
  { to: '/profile', label: 'Profile', icon: User },
  { to: '/settings', label: 'Settings', icon: Settings },
]

function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user, logout } = useAuth()
  const location = useLocation()

  return (
    <div className="flex min-h-screen bg-app-bg">
      <PremiumBackground variant="minimal" />
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex flex-col border-r border-app-line bg-app-elevated/90 backdrop-blur-2xl transition-all duration-300 lg:sticky lg:top-0 lg:h-screen ${
          collapsed ? 'w-16' : 'w-64'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="flex h-14 items-center justify-between border-b border-app-line px-4">
          <NavLink
            to="/"
            className={`flex items-center gap-2.5 ${collapsed ? 'justify-center' : ''}`}
          >
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-[7px] font-bold text-white tracking-tight leading-none">
              WP
            </div>
            {!collapsed && (
              <span className="text-sm font-bold tracking-tight text-app-fg">
                WebScrap <span className="bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">Pro</span>
              </span>
            )}
          </NavLink>
          <button
            type="button"
            className="hidden rounded-lg border border-app-line p-1.5 text-app-muted transition hover:bg-app-surface hover:text-app-soft lg:inline-flex"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
          <button
            type="button"
            className="rounded-lg border border-app-line p-1.5 text-app-muted transition hover:bg-app-surface hover:text-app-soft lg:hidden"
            onClick={() => setMobileOpen(false)}
          >
            <X size={14} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {navigation.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-500/10 to-violet-600/5 text-indigo-700'
                    : 'text-app-muted hover:bg-app-surface hover:text-app-nav'
                } ${collapsed ? 'justify-center' : ''}`
              }
            >
              <item.icon size={18} className="shrink-0" />
              {!collapsed && <span>{item.label}</span>}
              {collapsed && (
                <span className="absolute left-16 rounded-md bg-app-elevated px-2 py-1 text-xs text-app-soft opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                  {item.label}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-app-line p-3">
          <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500/20 to-violet-600/20 text-sm font-medium text-indigo-700 ring-1 ring-app-line">
              {user?.name?.charAt(0) || 'U'}
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-app-nav">{user?.name || 'User'}</p>
                <p className="truncate text-[10px] text-app-muted">{user?.email || ''}</p>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={logout}
            className={`mt-2 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-app-muted transition hover:bg-red-500/10 hover:text-red-500 ${
              collapsed ? 'justify-center' : ''
            }`}
          >
            <LogOut size={14} />
            {!collapsed && 'Sign out'}
          </button>
        </div>
      </aside>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <div className="flex-1">
        <div className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-app-line bg-app-elevated/80 px-4 backdrop-blur-2xl lg:hidden">
          <button
            type="button"
            className="rounded-lg border border-app-line p-1.5 text-app-muted transition hover:bg-app-surface hover:text-app-soft"
            onClick={() => setMobileOpen(true)}
          >
            <Menu size={16} />
          </button>
          <span className="text-sm font-bold text-app-fg">
            WebScrap <span className="bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">Pro</span>
          </span>
        </div>
        <div className="p-4 sm:p-6 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

export default DashboardLayout
