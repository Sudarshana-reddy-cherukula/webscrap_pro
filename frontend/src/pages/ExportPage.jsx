import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Download, FileJson, FileText, Trash2, Loader2, CheckCircle2, AlertCircle, Clock, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useNotification } from '@/hooks/useNotification'
import { exportService } from '@/services/exportService'
import { scraperService } from '@/services/scraperService'
import { pdfApi } from '@/api/pdfApi'

const EXPORT_SOURCES = [
  { value: 'scraping', label: 'Scraped Data', icon: FileJson },
  { value: 'pdf', label: 'PDF Extracted', icon: FileText },
]

const FORMATS = ['csv', 'json', 'txt', 'pdf']

const cardClass = "rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6"

function ExportPage() {
  const [source, setSource] = useState('')
  const [format, setFormat] = useState('csv')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [history, setHistory] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(true)
  const [availableJobs, setAvailableJobs] = useState([])
  const [selectedJobId, setSelectedJobId] = useState('')
  const [loadingJobs, setLoadingJobs] = useState(false)
  const { showNotification } = useNotification()

  useEffect(() => { loadHistory() }, [])

  const loadHistory = async () => {
    try {
      setLoadingHistory(true)
      const res = await exportService.getHistory(20)
      const data = res.data?.data || res.data
      setHistory(data.exports || data?.exports || [])
    } catch { /* silent */ } finally { setLoadingHistory(false) }
  }

  const handleSourceChange = async (value) => {
    setSource(value); setSelectedJobId(''); setAvailableJobs([])
    if (!value) return
    setLoadingJobs(true)
    try {
      let jobs = []
      if (value === 'scraping') {
        const res = await scraperService.getJobs(100)
        const data = res.data?.data || res.data
        jobs = (data.jobs || []).filter((j) => j.status === 'completed')
      } else if (value === 'pdf') {
        const res = await pdfApi.getJobs({ limit: 100 })
        const data = res.data?.data || res.data
        jobs = (data.jobs || []).filter((j) => j.status === 'completed')
      }
      setAvailableJobs(jobs)
    } catch { showNotification('Failed to load available jobs', 'error') } finally { setLoadingJobs(false) }
  }

  const startExport = async () => {
    if (!source) { showNotification('Please select a data source', 'error'); return }
    if (!selectedJobId) { showNotification('Please select a job to export', 'error'); return }
    try {
      setIsSubmitting(true)
      await exportService.start({ sourceType: source, sourceId: selectedJobId, exportType: format })
      showNotification('Export started')
      setTimeout(loadHistory, 1000)
    } catch (err) { showNotification(err.message || 'Export failed', 'error') } finally { setIsSubmitting(false) }
  }

  const handleDownload = async (exp) => {
    const id = exp.id || exp._id
    const fileFormat = exp.exportType || format
    try {
      const blobRes = await exportService.download(id)
      const url = window.URL.createObjectURL(blobRes.data)
      const a = document.createElement('a'); a.href = url; a.download = `export-${id}.${fileFormat}`; a.click()
      window.URL.revokeObjectURL(url)
      showNotification('Export downloaded')
    } catch { showNotification('Download failed', 'error') }
  }

  const handleDelete = async (exp) => {
    const id = exp.id || exp._id
    try { await exportService.delete(id); showNotification('Export deleted'); loadHistory() }
    catch { showNotification('Delete failed', 'error') }
  }

  const statusConfig = {
    completed: { icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    running: { icon: Loader2, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    failed: { icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-500/10' },
    pending: { icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    cancelled: { icon: XCircle, color: 'text-app-muted', bg: 'bg-zinc-500/10' },
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-app-fg">Export Center</h1>
        <p className="mt-1 text-sm text-app-muted">Export your scraped and processed data</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className={cardClass}>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/20">
              <Download size={18} className="text-white" />
            </div>
            <div>
              <h2 className="text-sm font-medium text-app-fg">Export Configuration</h2>
              <p className="text-xs text-app-muted">Choose data source and format</p>
            </div>
          </div>

          <div className="mt-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-app-soft">Data Source</label>
              <div className="mt-2 grid gap-2 sm:grid-cols-3">
                {EXPORT_SOURCES.map((s) => {
                  const Icon = s.icon
                  const isSelected = source === s.value
                  return (
                    <button key={s.value} type="button" onClick={() => handleSourceChange(s.value)}
                      className={`flex items-center gap-3 rounded-xl border p-3 transition ${
                        isSelected ? 'border-amber-500/30 bg-amber-500/10' : 'border-white/10 bg-white/[0.02] hover:border-white/20'
                      }`}
                    >
                      <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${isSelected ? 'bg-amber-500/20 text-amber-400' : 'bg-white/[0.04] text-app-muted'}`}>
                        <Icon size={14} />
                      </div>
                      <span className={`text-sm ${isSelected ? 'text-amber-300' : 'text-app-soft'}`}>{s.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {source && (
              <div>
                <label className="block text-sm font-medium text-app-soft">Select Job</label>
                {loadingJobs ? (
                  <div className="mt-1.5 flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-2.5">
                    <Loader2 size={14} className="animate-spin text-app-muted" />
                    <span className="text-sm text-app-muted">Loading jobs...</span>
                  </div>
                ) : availableJobs.length === 0 ? (
                  <div className="mt-1.5 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-2.5">
                    <span className="text-sm text-app-muted">No completed jobs available</span>
                  </div>
                ) : (
                  <select value={selectedJobId} onChange={(e) => setSelectedJobId(e.target.value)}
                    className="mt-1.5 block w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-app-fg transition focus:border-amber-500/50 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  >
                    <option value="" className="bg-[#050816]">Select a job...</option>
                    {availableJobs.map((job) => (
                      <option key={job.id || job._id} value={job.id || job._id} className="bg-[#050816]">
                        {job.originalName || job.targetUrl || (job.id || job._id).substring(0, 12)}...
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-app-soft">Export Format</label>
              <div className="mt-2 flex gap-2">
                {FORMATS.map((f) => (
                  <button key={f} type="button" onClick={() => setFormat(f)}
                    className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${
                      format === f ? 'border-amber-500/30 bg-amber-500/10 text-amber-300' : 'border-white/10 text-app-muted hover:border-white/20 hover:text-app-nav'
                    }`}
                  >{f.toUpperCase()}</button>
                ))}
              </div>
            </div>

            <Button onClick={startExport} disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/20"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2"><Loader2 size={16} className="animate-spin" /> Starting export...</span>
              ) : (
                <span className="flex items-center justify-center gap-2"><Download size={16} /> Export Now</span>
              )}
            </Button>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className={cardClass}>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-app-fg">Export History</h2>
            <button onClick={loadHistory} className="text-xs text-cyan-400 transition hover:text-cyan-300">Refresh</button>
          </div>
          <div className="mt-4 space-y-2">
            {loadingHistory ? (
              <div className="flex items-center justify-center py-12"><Loader2 size={20} className="animate-spin text-app-muted" /></div>
            ) : history.length === 0 ? (
              <div className="py-12 text-center">
                <Download size={32} className="mx-auto text-zinc-600" />
                <p className="mt-3 text-sm text-app-muted">No exports yet</p>
                <p className="text-xs text-zinc-600">Configure and start an export above</p>
              </div>
            ) : (
              history.slice(0, 10).map((exp) => {
                const expId = exp.id || exp._id
                const st = statusConfig[exp.status] || statusConfig.pending
                const StIcon = st.icon
                return (
                  <div key={expId} className="rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3 transition hover:bg-white/[0.04]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${st.bg}`}>
                          <StIcon size={13} className={`${st.color} ${exp.status === 'running' ? 'animate-spin' : ''}`} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-app-fg">{exp.name || `Export ${expId?.substring(0, 8)}`}</p>
                          <p className="text-xs text-app-muted">{exp.createdAt ? new Date(exp.createdAt).toLocaleString() : ''}</p>
                        </div>
                      </div>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${st.bg} ${st.color}`}>{exp.status}</span>
                    </div>
                    <div className="mt-2 flex gap-1.5">
                      {exp.status === 'completed' && (
                        <button onClick={() => handleDownload(exp)} className="rounded-lg border border-white/10 px-2 py-1 text-[10px] text-app-muted transition hover:bg-white/[0.04] hover:text-app-nav">
                          <Download size={12} />
                        </button>
                      )}
                      <button onClick={() => handleDelete(exp)} className="rounded-lg border border-white/10 px-2 py-1 text-[10px] text-app-muted transition hover:bg-white/[0.04] hover:text-red-400">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default ExportPage
