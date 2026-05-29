import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Globe, Play, Square, Pause, Download, Trash2, Plus,
  Clock, CheckCircle2, AlertCircle, Loader2, FileType,
  Layout, Link, ImageIcon, Hash, Code,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { TableSkeleton } from '@/components/ui/Skeleton'
import { useNotification } from '@/hooks/useNotification'
import { scraperService } from '@/services/scraperService'
import { exportService } from '@/services/exportService'

const SCRAPE_TYPES = [
  { value: 'fullPage', label: 'Full Page', icon: Layout, desc: 'Extract all page content' },
  { value: 'specific', label: 'Specific Elements', icon: Code, desc: 'CSS, XPath, or regex selectors' },
  { value: 'metadata', label: 'Metadata Only', icon: FileType, desc: 'Title, description, keywords' },
  { value: 'links', label: 'Links Only', icon: Link, desc: 'Extract all page links' },
  { value: 'images', label: 'Images Only', icon: ImageIcon, desc: 'Extract embedded images' },
]

const SELECTOR_TYPES = [
  { value: 'css', label: 'CSS Selector' },
  { value: 'xpath', label: 'XPath' },
  { value: 'regex', label: 'Regex Pattern' },
  { value: 'attribute', label: 'HTML Attribute' },
]

const cardClass = "rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl"
const inputClass = "mt-1.5 block w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-app-fg placeholder:text-app-muted transition focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
const labelClass = "block text-sm font-medium text-app-soft"

function ScraperPage() {
  const [urls, setUrls] = useState('')
  const [scrapeType, setScrapeType] = useState('fullPage')
  const [crawlDepth, setCrawlDepth] = useState(1)
  const [selectorType, setSelectorType] = useState('css')
  const [selectorValue, setSelectorValue] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [jobs, setJobs] = useState([])
  const [loadingJobs, setLoadingJobs] = useState(true)
  const [jobsError, setJobsError] = useState(null)
  const { showNotification } = useNotification()

  useEffect(() => {
    loadJobs()
    const interval = setInterval(loadJobs, 8000)
    return () => clearInterval(interval)
  }, [])

  const loadJobs = async () => {
    try {
      setLoadingJobs(true)
      setJobsError(null)
      const res = await scraperService.getJobs(20)
      const data = res.data?.data || res.data
      setJobs(data.jobs || [])
    } catch (err) {
      setJobsError(err?.message || 'Failed to load jobs')
    } finally {
      setLoadingJobs(false)
    }
  }

  const startScraping = async () => {
    if (!urls.trim()) { showNotification('Please enter at least one URL', 'error'); return }
    const targetUrls = urls.split('\n').map((u) => u.trim()).filter(Boolean)
    try {
      setIsSubmitting(true)
      await scraperService.start({ targetUrls, crawlDepth: Number(crawlDepth), scrapeType, selectorType, selectorValue })
      showNotification('Scraping job started')
      setTimeout(loadJobs, 500)
    } catch (err) { showNotification(err.message || 'Failed to start scraping', 'error') } finally { setIsSubmitting(false) }
  }

  const stopJob = async (id) => { try { await scraperService.stop(id); showNotification('Job stopped'); loadJobs() } catch { showNotification('Failed to stop job', 'error') } }
  const pauseJob = async (id) => { try { await scraperService.pauseJob(id); showNotification('Job paused'); loadJobs() } catch { showNotification('Failed to pause job', 'error') } }
  const resumeJob = async (id) => { try { await scraperService.resumeJob(id); showNotification('Job resumed'); loadJobs() } catch { showNotification('Failed to resume job', 'error') } }
  const deleteJob = async (id) => { try { await scraperService.deleteJob(id); showNotification('Job deleted'); loadJobs() } catch { showNotification('Failed to delete job', 'error') } }

  const downloadResults = async (job, format = 'csv') => {
    const jobId = job.id || job._id
    try {
      const exportRes = await exportService.start({ sourceType: 'scraping', sourceId: jobId, exportType: format })
      const exportId = exportRes.data?.data?.exportId
      if (!exportId) throw new Error('No export ID returned')
      const blobRes = await exportService.download(exportId)
      const url = window.URL.createObjectURL(blobRes.data)
      const a = document.createElement('a'); a.href = url; a.download = `scraping-results-${jobId}.${format}`; a.click()
      window.URL.revokeObjectURL(url)
      showNotification('Results downloaded')
    } catch { showNotification('Download failed', 'error') }
  }

  const statusConfig = {
    running: { icon: Loader2, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    completed: { icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    failed: { icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-500/10' },
    paused: { icon: Pause, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    pending: { icon: Clock, color: 'text-app-muted', bg: 'bg-zinc-500/10' },
  }

  const activeCount = jobs.filter((j) => j.status === 'running').length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-app-fg">Web Scraper</h1>
        <p className="mt-1 text-sm text-app-muted">Configure and run web scraping jobs</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className={`${cardClass} p-6 space-y-6`}>
          <div className="flex items-center gap-3 pb-2 border-b border-white/5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/20">
              <Globe size={18} className="text-white" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-app-fg">Scraper Configuration</h2>
              <p className="text-xs text-app-muted">Configure your scraping parameters</p>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className={labelClass}>Target URLs</label>
            <textarea value={urls} onChange={(e) => setUrls(e.target.value)}
              placeholder={'https://example.com\nhttps://example.com/page2'}
              rows={4} className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Scrape Type</label>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {SCRAPE_TYPES.map((t) => {
                const Icon = t.icon
                const isActive = scrapeType === t.value
                return (
                  <button key={t.value} type="button" onClick={() => setScrapeType(t.value)}
                    className={`group flex items-start gap-3 rounded-xl border p-3 text-left transition-all duration-200 ${
                      isActive
                        ? 'border-cyan-500/40 bg-cyan-500/10 shadow-lg shadow-cyan-500/5'
                        : 'border-white/5 bg-white/[0.02] hover:border-cyan-500/20 hover:bg-cyan-500/[0.03]'
                    }`}
                  >
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all ${
                      isActive ? 'bg-cyan-500/25 text-cyan-400 shadow-sm' : 'bg-white/[0.04] text-app-muted group-hover:bg-cyan-500/10 group-hover:text-cyan-400'
                    }`}>
                      <Icon size={14} />
                    </div>
                    <div className="min-w-0">
                      <p className={`text-sm font-medium ${isActive ? 'text-cyan-300' : 'text-app-soft group-hover:text-cyan-200'}`}>{t.label}</p>
                      <p className="text-[10px] leading-tight text-app-muted">{t.desc}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Crawl Depth</label>
              <input type="number" min={1} max={10} value={crawlDepth} onChange={(e) => setCrawlDepth(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Selector Type</label>
              <select value={selectorType} onChange={(e) => setSelectorType(e.target.value)} className={inputClass}>
                {SELECTOR_TYPES.map((t) => (
                  <option key={t.value} value={t.value} className="bg-[#050816]">{t.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className={labelClass}>Selector Value</label>
            <input type="text" value={selectorValue} onChange={(e) => setSelectorValue(e.target.value)}
              placeholder={selectorType === 'css' ? '.class-name' : selectorType === 'xpath' ? '//div[@class]' : selectorType === 'regex' ? 'pattern' : 'data-attribute'}
              className={inputClass}
            />
          </div>

          <Button onClick={startScraping} disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 transition-all duration-300"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2"><Loader2 size={16} className="animate-spin" /> Starting...</span>
            ) : (
              <span className="flex items-center justify-center gap-2"><Play size={16} /> Start Scraping</span>
            )}
          </Button>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className={`${cardClass} p-6 space-y-4`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-medium text-app-fg">Jobs</h2>
              {activeCount > 0 && (
                <span className="flex items-center gap-1 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 px-2 py-0.5 text-[10px] font-semibold text-white shadow-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                  {activeCount} active
                </span>
              )}
            </div>
            <button type="button" onClick={loadJobs} className="text-xs text-cyan-400 transition hover:text-cyan-300">Refresh</button>
          </div>

          <div className="space-y-2">
            {loadingJobs ? (
              <TableSkeleton rows={3} />
            ) : jobsError ? (
              <div className="py-12 text-center">
                <AlertCircle size={32} className="mx-auto text-red-500" />
                <p className="mt-3 text-sm text-red-400">Failed to load jobs</p>
                <p className="text-xs text-app-muted">{jobsError}</p>
                <button onClick={loadJobs} className="mt-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-xs text-app-soft transition hover:bg-white/[0.06]">Try Again</button>
              </div>
            ) : jobs.length === 0 ? (
              <div className="py-12 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white/[0.03] border border-white/10">
                  <Globe size={24} className="text-zinc-600" />
                </div>
                <p className="mt-4 text-sm text-app-muted">No scraping jobs yet</p>
                <p className="text-xs text-zinc-600">Configure and start a job above</p>
              </div>
            ) : (
              jobs.slice(0, 10).map((job) => {
                const status = statusConfig[job.status] || statusConfig.pending
                const StatusIcon = status.icon
                return (
                  <div key={job.id || job._id}
                    className="rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3 transition-all duration-200 hover:bg-white/[0.04] hover:border-white/10 hover:shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${status.bg}`}>
                          <StatusIcon size={13} className={`${status.color} ${job.status === 'running' ? 'animate-spin' : ''}`} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-app-fg">{(job.id || job._id)?.substring(0, 12)}...</p>
                          <p className="text-xs text-app-muted">{job.urlCount || 0} URLs · {job.processedCount || 0}/{job.urlCount || 0} done</p>
                        </div>
                      </div>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${status.bg} ${status.color}`}>{job.status}</span>
                    </div>
                    <div className="mt-2 flex gap-1.5">
                      {job.status === 'running' && (
                        <>
                          <button onClick={() => pauseJob(job.id || job._id)} className="rounded-lg border border-white/10 px-2 py-1 text-[10px] text-app-muted transition hover:bg-white/[0.04] hover:text-amber-400" title="Pause"><Pause size={12} /></button>
                          <button onClick={() => stopJob(job.id || job._id)} className="rounded-lg border border-white/10 px-2 py-1 text-[10px] text-app-muted transition hover:bg-white/[0.04] hover:text-red-400" title="Stop"><Square size={12} /></button>
                        </>
                      )}
                      {job.status === 'paused' && (
                        <button onClick={() => resumeJob(job.id || job._id)} className="rounded-lg border border-white/10 px-2 py-1 text-[10px] text-app-muted transition hover:bg-white/[0.04] hover:text-cyan-400" title="Resume"><Play size={12} /></button>
                      )}
                      {job.status === 'completed' && (
                        <>
                          <button onClick={() => downloadResults(job, 'csv')} className="rounded-lg border border-white/10 px-2 py-1 text-[10px] text-app-muted transition hover:bg-white/[0.04] hover:text-cyan-400" title="Download CSV"><Download size={12} /></button>
                          <button onClick={() => downloadResults(job, 'json')} className="rounded-lg border border-white/10 px-2 py-1 text-[10px] text-app-muted transition hover:bg-white/[0.04] hover:text-purple-400" title="Download JSON"><FileType size={12} /></button>
                        </>
                      )}
                      <button onClick={() => deleteJob(job.id || job._id)} className="rounded-lg border border-white/10 px-2 py-1 text-[10px] text-app-muted transition hover:bg-white/[0.04] hover:text-red-400" title="Delete"><Trash2 size={12} /></button>
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

export default ScraperPage
