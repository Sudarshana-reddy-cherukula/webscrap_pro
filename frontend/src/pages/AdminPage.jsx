import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Users, BarChart3, Activity, Globe, FileText,
  Download, Loader2, Search, ChevronRight, UserCheck,
  UserX, Webhook, Workflow,
  Server, HardDrive, Cpu, Clock,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { useNotification } from '@/hooks/useNotification'
import { adminService } from '@/services/adminService'

const cardClass = "rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6"

function StatsOverview({ stats }) {
  const overview = stats?.overview || {}
  const planStats = stats?.planStats || {}

  const statItems = [
    { label: 'Total Users', value: overview.totalUsers || 0, icon: Users, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
    { label: 'Active (7d)', value: overview.activeUsers || 0, icon: UserCheck, color: 'text-green-400', bg: 'bg-green-500/10' },
    { label: 'New (30d)', value: overview.newUsers30d || 0, icon: Users, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { label: 'Scrape Jobs', value: overview.totalScrapeJobs || 0, icon: Globe, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    { label: 'PDF Jobs', value: overview.totalPdfJobs || 0, icon: FileText, color: 'text-rose-400', bg: 'bg-rose-500/10' },
    { label: 'Exports', value: overview.totalExports || 0, icon: Download, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Workflows', value: overview.totalWorkflows || 0, icon: Workflow, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
    { label: 'Webhooks', value: overview.totalWebhooks || 0, icon: Webhook, color: 'text-pink-400', bg: 'bg-pink-500/10' },
  ]

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {statItems.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className={`${cardClass} !p-4`}>
            <div className={`inline-flex rounded-lg p-2 ${stat.bg} mb-2`}>
              <stat.icon size={14} className={stat.color} />
            </div>
            <p className="text-xl font-bold text-app-fg">{stat.value}</p>
            <p className="text-[10px] text-app-muted">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className={cardClass}>
          <h3 className="text-sm font-medium text-app-fg mb-3">Users by Plan</h3>
          <div className="space-y-2">
            {['free', 'basic', 'pro', 'enterprise'].map(plan => {
              const count = planStats[plan] || 0
              const total = overview.totalUsers || 1
              const pct = Math.round((count / total) * 100)
              return (
                <div key={plan} className="flex items-center gap-3">
                  <span className="text-xs text-app-muted w-16 capitalize">{plan}</span>
                  <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs text-app-soft w-12 text-right">{count} ({pct}%)</span>
                </div>
              )
            })}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className={cardClass}>
          <h3 className="text-sm font-medium text-app-fg mb-3">Daily New Users (30d)</h3>
          <div className="flex items-end gap-1 h-32">
            {(stats?.dailyUsers || []).slice(-14).map((d, i) => {
              const maxCount = Math.max(...(stats?.dailyUsers || []).map(x => x.count), 1)
              const height = (d.count / maxCount) * 100
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full bg-gradient-to-t from-cyan-500/40 to-cyan-400/20 rounded-t" style={{ height: `${height}%` }} />
                  <span className="text-[8px] text-app-muted">{d._id?.slice(5)}</span>
                </div>
              )
            })}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

function UsersList({ onSelectUser }) {
  const [users, setUsers] = useState([])
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 0 })
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const { showNotification } = useNotification()

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const res = await adminService.getUsers({ page: 1, limit: 15, search: '' })
        if (active) {
          setUsers(res.data?.data?.users || [])
          setPagination(res.data?.data?.pagination || { page: 1, total: 0, pages: 0 })
        }
      } catch {
        if (active) showNotification('Failed to load users', 'error')
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => { active = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadPage = useCallback(async (page, searchQuery = '') => {
    setLoading(true)
    try {
      const res = await adminService.getUsers({ page, limit: 15, search: searchQuery })
      setUsers(res.data?.data?.users || [])
      setPagination(res.data?.data?.pagination || { page: 1, total: 0, pages: 0 })
    } catch {
      showNotification('Failed to load users', 'error')
    } finally {
      setLoading(false)
    }
  }, [showNotification])

  const handleSearch = () => { loadPage(1, search) }

  const toggleStatus = async (userId, currentStatus) => {
    try {
      await adminService.updateUserStatus(userId, !currentStatus)
      loadPage(pagination.page, search)
    } catch {
      showNotification('Failed to update user status', 'error')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} placeholder="Search users..." className="flex-1" />
        <Button onClick={handleSearch}><Search size={14} /></Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8"><Loader2 size={20} className="animate-spin text-cyan-400" /></div>
      ) : users.length === 0 ? (
        <div className="text-center py-8"><p className="text-sm text-app-muted">No users found</p></div>
      ) : (
        <div className="space-y-2">
          {users.map((user, i) => (
            <motion.div key={user._id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className={`${cardClass} !p-3`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-600/20 text-sm font-medium text-cyan-300">
                    {user.name?.charAt(0) || 'U'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-app-fg truncate">{user.name}</p>
                      <Badge className={user.role === 'admin' ? 'bg-indigo-500/15 text-indigo-300 text-[10px]' : 'bg-white/10 text-app-muted text-[10px]'}>{user.role}</Badge>
                      <Badge className={`text-[10px] ${user.subscription?.plan !== 'free' ? 'bg-purple-500/15 text-purple-300' : 'bg-white/10 text-app-muted'}`}>{user.subscription?.plan || 'free'}</Badge>
                    </div>
                    <p className="text-xs text-app-muted truncate">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button size="icon" variant="ghost" onClick={() => onSelectUser(user._id)} title="View details"><ChevronRight size={14} /></Button>
                  <Button size="icon" variant="ghost" onClick={() => toggleStatus(user._id, user.isActive)} title={user.isActive ? 'Deactivate' : 'Activate'}>
                    {user.isActive ? <UserCheck size={14} className="text-green-400" /> : <UserX size={14} className="text-red-400" />}
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button size="sm" variant="outline" disabled={pagination.page <= 1} onClick={() => loadPage(pagination.page - 1, search)}>Prev</Button>
          <span className="text-xs text-app-muted">{pagination.page}/{pagination.pages}</span>
          <Button size="sm" variant="outline" disabled={pagination.page >= pagination.pages} onClick={() => loadPage(pagination.page + 1, search)}>Next</Button>
        </div>
      )}
    </div>
  )
}

function SystemHealth() {
  const [health, setHealth] = useState(null)
  const [loading, setLoading] = useState(true)
  const { showNotification } = useNotification()

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const res = await adminService.getSystemHealth()
        if (active) setHealth(res.data?.data || null)
      } catch {
        if (active) showNotification('Failed to load health', 'error')
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => { active = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (loading) return <div className="flex items-center justify-center py-8"><Loader2 size={20} className="animate-spin text-cyan-400" /></div>
  if (!health) return <p className="text-sm text-app-muted text-center py-8">Failed to load system health</p>

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {[
        { label: 'Database', value: health.database?.status, icon: Server, color: health.database?.status === 'connected' ? 'text-green-400' : 'text-red-400' },
        { label: 'Heap Used', value: `${health.memory?.heapUsed}MB`, icon: HardDrive, color: 'text-cyan-400' },
        { label: 'RSS Memory', value: `${health.memory?.rss}MB`, icon: HardDrive, color: 'text-purple-400' },
        { label: 'Uptime', value: `${Math.round(health.uptime / 60)}min`, icon: Clock, color: 'text-indigo-400' },
        { label: 'Node.js', value: health.nodeVersion, icon: Cpu, color: 'text-blue-400' },
        { label: 'Platform', value: health.platform, icon: Activity, color: 'text-rose-400' },
      ].map((item, i) => (
        <div key={i} className={`${cardClass} !p-3 flex items-center gap-3`}>
          <item.icon size={16} className={item.color} />
          <div>
            <p className="text-xs text-app-muted">{item.label}</p>
            <p className="text-sm font-medium text-app-fg">{item.value}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const { showNotification } = useNotification()

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const res = await adminService.getDashboardStats()
        if (active) setStats(res.data?.data || null)
      } catch {
        if (active) showNotification('Failed to load admin stats', 'error')
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => { active = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'system', label: 'System', icon: Server },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-cyan-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-app-fg">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-app-muted">System management and user administration</p>
      </div>

      <div className="flex gap-1 rounded-xl border border-white/10 bg-white/[0.03] p-1 backdrop-blur-xl overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition whitespace-nowrap ${
                activeTab === tab.id ? 'bg-cyan-500/15 text-cyan-300' : 'text-app-muted hover:text-app-soft'
              }`}
            ><Icon size={14} /> {tab.label}</button>
          )
        })}
      </div>

      <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        {activeTab === 'overview' && <StatsOverview stats={stats} />}
        {activeTab === 'users' && <UsersList onSelectUser={() => {}} />}
        {activeTab === 'system' && <SystemHealth />}
      </motion.div>
    </div>
  )
}
