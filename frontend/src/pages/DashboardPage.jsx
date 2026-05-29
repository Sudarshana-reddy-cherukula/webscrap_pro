import { useEffect, useMemo, useState } from 'react'
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
  Activity,
} from 'lucide-react'

const liveLogs = [
  { time: '12:34:22', msg: '[INFO] Scraping job #1283 — 456/500 pages', level: 'info' },
  { time: '12:34:18', msg: '[OK] PDF extraction completed — 124 pages', level: 'success' },
  { time: '12:34:15', msg: '[WARN] Rate limit approaching — throttling', level: 'warn' },
  { time: '12:34:10', msg: '[INFO] Proxy rotation —切换到JP node', level: 'info' },
  { time: '12:34:05', msg: '[OK] Export CSV ready — download', level: 'success' },
]

function DashboardPage() {
  const navigate = useNavigate()
  const [timeframe, setTimeframe] = useState('7d')
  const [logs] = useState(liveLogs)

  const stats = [
    {
      label: 'API Key Calls',
      value: '45.2K',
      change: '+12.3%',
      trend: 'up',
      icon: Activity,
      color: 'from-cyan-500 to-blue-600',
      onClick: () => navigate('/scraper'),
    },
    {
      label: 'Proxy Uptime',
      value: '99.97%',
      change: '+0.02%',
      trend: 'up',
      icon: Globe,
      color: 'from-purple-500 to-pink-600',
      onClick: () => navigate('/pdf-tools'),
    },
    {
      label: 'Data Output',
      value: '2.4 GB',
      change: '+18%',
      trend: 'up',
      icon: Download,
      color: 'from-green-500 to-emerald-600',
      onClick: () => navigate('/analytics'),
    },
    {
      label: 'Active Jobs',
      value: '12',
      change: '+3',
      trend: 'up',
      icon: TrendingUp,
      color: 'from-amber-500 to-orange-600',
      onClick: () => navigate('/export'),
    },
  ]

  const recentActivity = [
    { id: 1, type: 'scrape', title: 'Product listing scrape', status: 'completed', time: '2 min ago', urls: 450 },
    { id: 2, type: 'pdf', title: 'Annual report extraction', status: 'completed', time: '15 min ago', pages: 124 },
    { id: 3, type: 'scrape', title: 'News article crawl', status: 'running', time: '1 hour ago', urls: 1200 },
    { id: 4, type: 'export', title: 'CSV export - scraping results', status: 'completed', time: '2 hours ago', rows: 3400 },
    { id: 5, type: 'pdf', title: 'Contract batch processing', status: 'failed', time: '3 hours ago', pages: 8 },
  ]

  const usageData = useMemo(() => {
    const days = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90
    return Array.from({ length: days }, (_, i) => ({
      date: `Day ${i + 1}`,
      scraped: Math.floor(Math.random() * 500 + 100),
      pdfs: Math.floor(Math.random() * 50 + 10),
    }))
  }, [timeframe])

  const maxVal = Math.max(...usageData.flatMap((d) => [d.scraped, d.pdfs]))

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-app-fg">Dashboard</h1>
          <p className="mt-1 text-sm text-app-muted">Live overview of your data operations</p>
        </div>
        <div className="flex gap-1 rounded-xl border border-white/10 bg-white/[0.03] p-1 backdrop-blur-xl">
          {['7d', '30d', '90d'].map((t) => (
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

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, i) => (
          <motion.button
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            onClick={stat.onClick}
            className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-left backdrop-blur-xl transition hover:border-cyan-500/20 hover:bg-white/[0.05] hover:shadow-lg hover:shadow-cyan-500/5"
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
              <span className="text-xs font-medium text-emerald-400">{stat.change}</span>
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
          className="xl:col-span-2 rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl"
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
          className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl"
        >
          <div className="flex items-center gap-2 mb-3">
            <Terminal size={14} className="text-cyan-400" />
            <h2 className="text-sm font-medium text-app-fg">Live Logs</h2>
          </div>
          <div className="space-y-1.5 font-mono text-[10px] leading-relaxed">
            {logs.map((log, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`flex gap-2 ${
                  log.level === 'success' ? 'text-emerald-400/80' :
                  log.level === 'warn' ? 'text-amber-400/80' :
                  'text-zinc-400/80'
                }`}
              >
                <span className="shrink-0 text-zinc-600">[{log.time}]</span>
                <span>{log.msg}</span>
              </motion.div>
            ))}
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
        className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl"
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
          {recentActivity.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3 transition hover:bg-white/[0.04] hover:border-white/10"
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
                  {item.status === 'completed' ? (
                    <CheckCircle2 size={14} />
                  ) : item.status === 'running' ? (
                    <Clock size={14} />
                  ) : (
                    <AlertCircle size={14} />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-app-fg">{item.title}</p>
                  <p className="text-xs text-app-muted">
                    {item.urls ? `${item.urls} URLs` : item.pages ? `${item.pages} pages` : item.rows ? `${item.rows} rows` : ''}
                    {' · '}{item.time}
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
          ))}
        </div>
      </motion.div>
    </div>
  )
}

export default DashboardPage