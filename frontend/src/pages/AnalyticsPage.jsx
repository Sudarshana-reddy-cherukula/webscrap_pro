import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, TrendingUp, PieChart, Hash, Download, Trash2, Loader2, Globe, FileText, Calendar } from 'lucide-react'
import { BarChart, Bar, LineChart, Line, PieChart as RechartsPie, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area } from 'recharts'
import { Button } from '@/components/ui/Button'
import { useNotification } from '@/hooks/useNotification'
import { analyticsService } from '@/services/analyticsService'

const TABS = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'trends', label: 'Trends', icon: TrendingUp },
  { id: 'frequency', label: 'Frequency', icon: PieChart },
  { id: 'keywords', label: 'Keywords', icon: Hash },
]

const cardClass = "rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6"
const iconBox = "inline-flex rounded-xl bg-gradient-to-br p-2"

const CHART_COLORS = ['#06b6d4', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#3b82f6', '#14b8a6', '#f97316', '#6366f1']

function OverviewChart({ data }) {
  const chartData = [
    { name: 'Scrape Jobs', value: data?.scrapeJobs || data?.totalScrapes || 0 },
    { name: 'PDF Jobs', value: data?.pdfJobs || data?.totalPdfs || 0 },
    { name: 'Exports', value: data?.totalExports || 0 },
    { name: 'Today', value: data?.todayJobs || 0 },
  ]

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} />
        <YAxis stroke="rgba(255,255,255,0.5)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} />
        <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
          {chartData.map((_, index) => (
            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

function TrendsChart({ data }) {
  const scrapeData = data?.scrapeTrends || []
  const pdfData = data?.pdfTrends || []

  const combinedData = scrapeData.map(item => {
    const pdfItem = pdfData.find(p => p._id === item._id)
    return {
      date: item._id,
      scrapes: item.count,
      pdfs: pdfItem?.count || 0,
    }
  })

  if (combinedData.length === 0) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-sm text-app-muted">No trend data available for the selected period</p>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={combinedData}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }} />
        <YAxis stroke="rgba(255,255,255,0.5)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} />
        <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
        <Legend />
        <Area type="monotone" dataKey="scrapes" stackId="1" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.3} name="Scrape Jobs" />
        <Area type="monotone" dataKey="pdfs" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} name="PDF Jobs" />
      </AreaChart>
    </ResponsiveContainer>
  )
}

function FrequencyChart({ data }) {
  const urls = data?.topUrls || []

  if (urls.length === 0) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-sm text-app-muted">No frequency data available</p>
      </div>
    )
  }

  const chartData = urls.map(item => ({
    url: new URL(item._id).hostname,
    count: item.count,
  }))

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis type="number" stroke="rgba(255,255,255,0.5)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} />
        <YAxis type="category" dataKey="url" stroke="rgba(255,255,255,0.5)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }} width={120} />
        <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
        <Bar dataKey="count" fill="#06b6d4" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

function KeywordsChart({ data }) {
  const keywords = data?.keywords || []

  if (keywords.length === 0) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-sm text-app-muted">No keywords data available</p>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={keywords.slice(0, 10)}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey="keyword" stroke="rgba(255,255,255,0.5)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }} />
        <YAxis stroke="rgba(255,255,255,0.5)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} />
        <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
          {keywords.slice(0, 10).map((_, index) => (
            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

function TabContent({ activeTab, data }) {
  switch (activeTab) {
    case 'overview':
      return <OverviewChart data={data} />
    case 'trends':
      return <TrendsChart data={data} />
    case 'frequency':
      return <FrequencyChart data={data} />
    case 'keywords':
      return <KeywordsChart data={data} />
    default:
      return <OverviewChart data={data} />
  }
}


function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const { showNotification } = useNotification()

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      let res
      switch (activeTab) {
        case 'overview': res = await analyticsService.getOverview(); break
        case 'trends': res = await analyticsService.getTrends('30d'); break
        case 'frequency': res = await analyticsService.getFrequency('all', 10); break
        case 'keywords': res = await analyticsService.getKeywords(20); break
        default: res = await analyticsService.getOverview()
      }
      setData(res.data)
    } catch (err) {
      setData(null)
      showNotification(err?.message || 'Failed to load analytics', 'error')
    } finally {
      setLoading(false)
    }
  }, [activeTab, showNotification])

  /* eslint-disable-next-line react-hooks/set-state-in-effect */
  useEffect(() => { loadData() }, [loadData])

  const handleExport = async () => {
    try {
      const blob = await analyticsService.exportAnalytics('csv', activeTab)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a'); a.href = url; a.download = `analytics-${activeTab}.csv`; a.click()
      window.URL.revokeObjectURL(url)
      showNotification('Analytics exported')
    } catch { showNotification('Export failed', 'error') }
  }

  const handleClear = async () => {
    try { await analyticsService.clearAnalytics(); setData(null); showNotification('Analytics cleared') }
    catch { showNotification('Clear failed', 'error') }
  }

  const summaryCards = [
    { label: 'Total Scrapes', value: data?.totalScrapes || '—', icon: Globe, color: 'from-cyan-500 to-blue-600' },
    { label: 'PDFs Processed', value: data?.totalPdfs || '—', icon: FileText, color: 'from-purple-500 to-pink-600' },
    { label: 'Data Points', value: data?.totalDataPoints || '—', icon: BarChart3, color: 'from-green-500 to-emerald-600' },
    { label: 'This Month', value: data?.thisMonth || '—', icon: Calendar, color: 'from-amber-500 to-orange-600' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-app-fg">Analytics</h1>
          <p className="mt-1 text-sm text-app-muted">Track and analyze your data operations</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport} className="border-white/10 text-xs text-app-muted">
            <Download size={14} className="mr-1.5" /> Export
          </Button>
          <Button variant="outline" onClick={handleClear} className="border-white/10 text-xs text-app-muted">
            <Trash2 size={14} className="mr-1.5" /> Clear
          </Button>
        </div>
      </div>

      <div className="flex gap-1 rounded-xl border border-white/10 bg-white/[0.03] p-1 backdrop-blur-xl">
        {TABS.map((tab) => {
          const Icon = tab.icon
          return (
            <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
                activeTab === tab.id ? 'bg-cyan-500/15 text-cyan-300' : 'text-app-muted hover:text-app-soft'
              }`}
            ><Icon size={14} /> {tab.label}</button>
          )
        })}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card, i) => {
          const Icon = card.icon
          return (
            <motion.div key={card.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className={cardClass}>
              <div className={`mb-3 ${iconBox} ${card.color} shadow-lg`}><Icon size={16} className="text-white" /></div>
              <p className="text-xs font-medium uppercase tracking-wider text-app-muted">{card.label}</p>
              <p className="mt-1 text-2xl font-bold text-app-fg">{card.value}</p>
            </motion.div>
          )
        })}
      </div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className={cardClass}>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-app-fg">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Data</h2>
          <button type="button" onClick={loadData} className="text-xs text-cyan-400 transition hover:text-cyan-300">Refresh</button>
        </div>
        <div className="mt-4">
          {loading ? (
            <div className="flex items-center justify-center py-16"><Loader2 size={24} className="animate-spin text-app-muted" /></div>
          ) : data ? (
            <TabContent activeTab={activeTab} data={data} />
          ) : (
            <div className="py-16 text-center">
              <BarChart3 size={40} className="mx-auto text-app-muted" />
              <p className="mt-4 text-sm text-app-muted">No analytics data available</p>
              <p className="text-xs text-app-muted">Start scraping or processing PDFs to see analytics here</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}

export default AnalyticsPage
