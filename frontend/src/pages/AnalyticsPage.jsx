import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, TrendingUp, PieChart, Hash, Download, Trash2, Loader2, Globe, FileText, ArrowUpRight, Calendar } from 'lucide-react'
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
const gradientBtn = "bg-gradient-to-r from-cyan-500 to-blue-600 text-app-fg shadow-lg shadow-cyan-500/20"

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
  }, [activeTab])

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
            <pre className="max-h-[400px] overflow-y-auto rounded-xl border border-white/10 bg-black/40 p-4 text-xs leading-5 text-app-soft scrollbar-hide">{JSON.stringify(data, null, 2)}</pre>
          ) : (
            <div className="py-16 text-center">
              <BarChart3 size={40} className="mx-auto text-zinc-600" />
              <p className="mt-4 text-sm text-app-muted">No analytics data available</p>
              <p className="text-xs text-zinc-600">Start scraping or processing PDFs to see analytics here</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}

export default AnalyticsPage
