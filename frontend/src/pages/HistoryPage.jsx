import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { History, Filter, Download, Trash2, RefreshCw, AlertCircle, Loader2 } from 'lucide-react'
import { DataTable } from '@/components/ui/DataTable'
import { Badge } from '@/components/ui/Badge'
import { SearchInput } from '@/components/ui/SearchInput'

const typeFilters = ['All', 'Scrape', 'PDF', 'Export', 'OCR']

const columns = [
  { accessor: 'type', header: 'Type', render: (val) => {
    const colors = { Scrape: 'text-cyan-400', PDF: 'text-purple-400', Export: 'text-amber-400', OCR: 'text-emerald-400' }
    return <span className={`text-xs font-medium ${colors[val] || 'text-app-muted'}`}>{val || '—'}</span>
  }},
  { accessor: 'name', header: 'Name', render: (val, row) => (
    <div>
      <p className="text-sm text-app-soft">{val}</p>
      {row.details && <p className="text-xs text-app-muted">{row.details}</p>}
    </div>
  )},
  { accessor: 'status', header: 'Status', render: (val) => {
    const variants = { Completed: 'success', Running: 'info', Failed: 'error', Pending: 'warning' }
    return <Badge variant={variants[val] || 'default'}>{val}</Badge>
  }},
  { accessor: 'pages', header: 'Pages/URLs', render: (val) => <span className="text-sm text-app-muted">{val ?? '—'}</span> },
  { accessor: 'duration', header: 'Duration', render: (val) => <span className="text-sm text-app-muted">{val || '—'}</span> },
  { accessor: 'date', header: 'Date', render: (val) => {
    if (!val) return '—'
    const d = new Date(val)
    return <span className="text-sm text-app-muted">{d.toLocaleDateString()} {d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
  }},
  { accessor: 'actions', header: '', render: (_, row) => (
    <div className="flex items-center gap-1">
      <button type="button" className="rounded-lg border border-white/10 p-1.5 text-app-muted hover:bg-white/[0.04] hover:text-app-soft transition" title="Download">
        <Download size={12} />
      </button>
      <button type="button" className="rounded-lg border border-white/10 p-1.5 text-app-muted hover:bg-white/[0.04] hover:text-red-400 transition" title="Delete">
        <Trash2 size={12} />
      </button>
    </div>
  )},
]

function HistoryPage() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('All')

  useEffect(() => { loadHistory() }, [])

  const loadHistory = async () => {
    setLoading(true)
    setError('')
    try {
      const { dashboardService } = await import('@/services/dashboardService')
      const res = await dashboardService.getJobHistory()
      const jobs = res.data?.data || res.data || []
      setData(Array.isArray(jobs) ? jobs.map((j) => ({
        id: j._id || j.id,
        type: j.type || 'Scrape',
        name: j.name || j.title || `Job ${j._id?.slice(0, 8) || 'unknown'}`,
        status: j.status?.charAt(0).toUpperCase() + j.status?.slice(1) || 'Pending',
        pages: j.urlCount || j.pages || j.processedCount || 0,
        duration: j.duration || j.time || '—',
        date: j.createdAt || j.date || new Date().toISOString(),
        details: j.details || `${j.processedCount || 0}/${j.urlCount || 0} items processed`,
      })) : [])
    } catch (err) {
      setError(err.message || 'Failed to load history')
    } finally {
      setLoading(false)
    }
  }

  const filtered = data.filter((item) => {
    const matchesSearch = !search || item.name?.toLowerCase().includes(search.toLowerCase())
    const matchesType = typeFilter === 'All' || item.type === typeFilter
    return matchesSearch && matchesType
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-app-fg">History</h1>
          <p className="mt-1 text-sm text-app-muted">View all your scraping and processing jobs</p>
        </div>
        <button type="button" onClick={loadHistory} disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-app-muted transition hover:bg-white/[0.06] hover:text-app-soft disabled:opacity-50 backdrop-blur-xl"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          {typeFilters.map((f) => (
            <button key={f} type="button" onClick={() => setTypeFilter(f)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                typeFilter === f ? 'bg-cyan-500/15 text-cyan-300' : 'text-app-muted hover:text-app-soft hover:bg-white/[0.04]'
              }`}
            >{f}</button>
          ))}
        </div>
        <SearchInput value={search} onChange={setSearch} placeholder="Search jobs..." className="w-full sm:w-64" />
      </div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-1"
      >
        <DataTable
          columns={columns}
          data={filtered}
          loading={loading}
          error={error}
          emptyTitle="No history yet"
          emptyText="Your scraping and processing jobs will appear here."
          keyExtractor={(row) => row.id}
        />
      </motion.div>
    </div>
  )
}

export default HistoryPage
