import { useEffect, useMemo, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  Globe,
  FileText,
  CheckCircle2,
  Download,
  TrendingUp,
  Clock,
  AlertCircle,
  ArrowUpRight,
  Terminal,
  Loader2,
} from 'lucide-react'
import { dashboardService } from '@/services/dashboardService'

const TIMEFRAMES = ['7d', '30d', '90d']

const statCards = [
  { label: 'Scraping Jobs', key: 'scraping', icon: Globe, color: 'from-cyan-500 to-blue-600', link: '/scraper' },
  { label: 'PDFs Processed', key: 'pdf', icon: FileText, color: 'from-purple-500 to-pink-600', link: '/pdf-tools' },
  { label: 'Total Exports', key: 'exports', icon: Download, color: 'from-green-500 to-emerald-600', link: '/export' },
  { label: 'Active Jobs', key: 'active', icon: TrendingUp, color: 'from-indigo-500 to-violet-600', link: '/analytics' },
]

const statusIcon = {
  completed: CheckCircle2,
  running: Clock,
  failed: AlertCircle,
}

function DashboardPage() {
  const navigate = useNavigate()
  const [timeframe, setTimeframe] = useState('7d')
  const [dashboard, setDashboard] = useState(null)
  const [usageStats, setUsageStats] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [dashRes, statsRes] = await Promise.all([
        dashboardService.getStatistics(),
        dashboardService.getUsageStats(timeframe),
      ])
      setDashboard(dashRes.data?.data || dashRes.data)
      setUsageStats(statsRes.data?.data || statsRes.data)
    } catch {
      setDashboard(null)
      setUsageStats(null)
    } finally {
      setLoading(false)
    }
  }, [timeframe])

  /* eslint-disable-next-line react-hooks/set-state-in-effect */
  useEffect(() => { loadData() }, [loadData])

  const stats = useMemo(() => {
    if (!dashboard?.statistics) return []
    const s = dashboard.statistics
    const scraping = s.scraping?.total || 0
    const pdf = s.pdf?.total || 0
    const exports = s.exports?.total || 0
    const active = (s.scraping?.total || 0) + (s.pdf?.total || 0)

    return [
      { ...statCards[0], value: String(scraping), change: s.scraping?.successRate != null ? `${s.scraping.successRate}% success` : null },
      { ...statCards[1], value: String(pdf), change: s.pdf?.successRate != null ? `${s.pdf.successRate}% success` : null },
      { ...statCards[2], value: String(exports), change: null },
      { ...statCards[3], value: String(active), change: null },
    ]
  }, [dashboard])

  const usageData = useMemo(() => {
    if (!usageStats) return []
    const labels = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90
    return Array.from({ length: Math.min(labels, 30) }, (_, i) => ({
      date: `Day ${i + 1}`,
      scraped: Math.max(0, Math.round((usageStats.scraping?.total || 0) / Math.min(labels, 30))),
      pdfs: Math.max(0, Math.round((usageStats.pdf?.total || 0) / Math.min(labels, 30))),
    }))
  }, [usageStats, timeframe])

  const maxVal = Math.max(...usageData.flatMap((d) => [d.scraped, d.pdfs]), 1)

  const recentActivity = dashboard?.recentActivity || []
  const user = dashboard?.user

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-app-fg">Dashboard</h1>
          <p className="mt-1 text-sm text-app-muted">
            {user ? `${user.name || 'User'} — ` : ''}Live overview of your data operations
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <button
            type="button"
            onClick={() => {
              if (!dashboard) return
              const stats = [
                `Total Scrapes: ${dashboard.totalScrapes || 0}`,
                `Total PDFs: ${dashboard.totalPdfs || 0}`,
                `Total Exports: ${dashboard.totalExports || 0}`,
                `Success Rate: ${dashboard.successRate || 0}%`,
                `Active Jobs: ${dashboard.activeJobs || 0}`,
                `Queue Length: ${dashboard.queueLength || 0}`,
              ].join('\n')
              const blob = new Blob([`Dashboard Stats (${timeframe})\n\n${stats}`], { type: 'text/plain' })
              const url = window.URL.createObjectURL(blob)
              const a = document.createElement('a'); a.href = url; a.download = `dashboard-${timeframe.toLowerCase()}.txt`; a.click()
              window.URL.revokeObjectURL(url)
            }}
            className="flex items-center gap-1.5 rounded-lg border border-app-line px-3 py-1.5 text-xs text-app-muted hover:bg-app-elevated/15 hover:text-app-soft transition"
          >
            <Download size={12} /> Export
          </button>
          <div className="flex gap-1 rounded-xl border border-app-line bg-app-elevated/10 p-1 backdrop-blur-xl">
            {TIMEFRAMES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTimeframe(t)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  timeframe === t
                    ? 'bg-cyan-500/20 text-cyan-300 shadow-sm'
                    : 'text-app-muted hover:text-app-soft'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading && !dashboard ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 size={24} className="animate-spin text-cyan-400" />
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat, i) => (
              <motion.button
                key={stat.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                onClick={() => navigate(stat.link)}
                className="group relative overflow-hidden rounded-2xl border border-app-line bg-app-elevated/10 p-5 text-left backdrop-blur-xl transition hover:border-cyan-500/20 hover:bg-app-elevated/20 hover:shadow-lg hover:shadow-cyan-500/5"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute right-3 top-3 opacity-0 transition group-hover:opacity-100">
                  <ArrowUpRight size={14} className="text-app-muted" />
                </div>
                <div className={`mb-3 inline-flex rounded-xl bg-gradient-to-br ${stat.color} p-2.5 shadow-lg`}>
                  <stat.icon size={16} className="text-app-fg" />
                </div>
                <p className="text-xs font-medium uppercase tracking-wider text-app-muted">{stat.label}</p>
                <div className="mt-1 flex items-baseline gap-2">
                  <p className="text-2xl font-bold text-app-fg">{stat.value}</p>
                  {stat.change && (
                    <span className="text-xs font-medium text-emerald-400">{stat.change}</span>
                  )}
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
              </motion.button>
            ))}
          </div>

          <div className="grid gap-6 xl:grid-cols-3">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="xl:col-span-2 rounded-2xl border border-app-line bg-app-elevated/10 p-6 backdrop-blur-xl"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-medium text-app-fg">Usage Overview</h2>
                  <p className="text-xs text-app-muted">Pages scraped vs PDFs processed</p>
                </div>
                <div className="flex gap-3">
                  <span className="flex items-center gap-1.5 text-xs text-app-muted">
                    <span className="h-2 w-2 rounded-full bg-cyan-500" />
                    Scraped
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-app-muted">
                    <span className="h-2 w-2 rounded-full bg-purple-500" />
                    PDFs
                  </span>
                </div>
              </div>
              <div className="mt-6 flex items-end gap-[3px] h-48">
                {usageData.slice(-30).map((d, i) => (
                  <motion.div
                    key={i}
                    className="group relative flex flex-1 flex-col items-end justify-end"
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    transition={{ delay: i * 0.01, duration: 0.3 }}
                  >
                    <div
                      className="w-full rounded-t-sm bg-gradient-to-t from-cyan-500/40 to-cyan-500/20 transition-all hover:from-cyan-500/60 hover:to-cyan-500/30"
                      style={{ height: `${(d.scraped / maxVal) * 120}px` }}
                    />
                    <div
                      className="w-full rounded-t-sm bg-gradient-to-t from-purple-500/40 to-purple-500/20 transition-all hover:from-purple-500/60 hover:to-purple-500/30"
                      style={{ height: `${(d.pdfs / maxVal) * 70}px` }}
                    />
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="rounded-2xl border border-app-line bg-app-elevated/10 p-6 backdrop-blur-xl"
            >
              <div className="flex items-center gap-2 mb-3">
                <Terminal size={14} className="text-cyan-400" />
                <h2 className="text-sm font-medium text-app-fg">Live Logs</h2>
              </div>
              <div className="space-y-1.5 font-mono text-[10px] leading-relaxed">
                {recentActivity.length > 0 ? (
                  recentActivity.slice(0, 5).map((item, i) => (
                    <motion.div
                      key={item.id || i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={`flex gap-2 ${
                        item.status === 'completed' ? 'text-emerald-400/80' :
                        item.status === 'failed' ? 'text-red-400/80' :
                        'text-cyan-400/80'
                      }`}
                    >
                       <span className="shrink-0 text-app-muted">
                        [{item.createdAt ? new Date(item.createdAt).toLocaleTimeString() : '--:--:--'}]
                      </span>
                      <span>
                        {item.type === 'scraping' ? `[SCRAPE] ${item.target || 'Job #'+item.id} — ${item.status}` :
                         item.type === 'pdf' ? `[PDF] ${item.target || 'Job #'+item.id} — ${item.status}` :
                         `[JOB] ${item.status}`}
                      </span>
                    </motion.div>
                  ))
                ) : (
                   <div className="text-app-muted text-xs py-4 text-center">No recent activity</div>
                )}
                <motion.div
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="text-cyan-400/60"
                >
                  $ _
                </motion.div>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-2xl border border-app-line bg-app-elevated/10 p-6 backdrop-blur-xl"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-app-fg">Recent Activity</h2>
              <button
                type="button"
                onClick={() => navigate('/analytics')}
                className="text-xs text-cyan-400 transition hover:text-cyan-300"
              >
                View all
              </button>
            </div>
            <div className="mt-4 space-y-2">
              {recentActivity.length > 0 ? (
                recentActivity.slice(0, 5).map((item) => {
                  const Icon = statusIcon[item.status] || AlertCircle
                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-xl border border-app-line/50 bg-app-surface px-4 py-3 transition hover:bg-app-elevated/15 hover:border-app-line"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                            item.status === 'completed'
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : item.status === 'running'
                                ? 'bg-blue-500/10 text-blue-400'
                                : 'bg-red-500/10 text-red-400'
                          }`}
                        >
                          <Icon size={14} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-app-fg">
                            {item.type === 'scraping' ? `Scrape: ${item.target || 'Job #'+item.id}` :
                             item.type === 'pdf' ? `PDF: ${item.target || 'Job #'+item.id}` :
                             `Job #${item.id}`}
                          </p>
                          <p className="text-xs text-app-muted">
                            {item.createdAt ? new Date(item.createdAt).toLocaleString() : ''}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium ${
                          item.status === 'completed'
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : item.status === 'running'
                              ? 'bg-blue-500/10 text-blue-400'
                              : 'bg-red-500/10 text-red-400'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                  )
                })
              ) : (
                <div className="py-8 text-center text-sm text-app-muted">
                  No recent activity yet. Start scraping or processing PDFs to see activity here.
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </div>
  )
}

export default DashboardPage
