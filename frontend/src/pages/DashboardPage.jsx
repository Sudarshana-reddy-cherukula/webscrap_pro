import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import SectionHeader from '../components/ui/SectionHeader'
import { useNotification } from '../hooks/useNotification'
import { scrapingApi } from '../api/scrapingApi'
import { pdfApi } from '../api/pdfApi'

function DashboardPage() {
  const [scraperJobs, setScraperJobs] = useState([])
  const [pdfJobs, setPdfJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const { showNotification } = useNotification()

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const [scraperRes, pdfRes] = await Promise.all([
        scrapingApi.getJobs({ limit: 5 }),
        pdfApi.getHistory({ limit: 5 }),
      ])

      setScraperJobs(scraperRes.data.jobs || scraperRes.data || [])
      setPdfJobs(pdfRes.data.history || pdfRes.data || [])
    } catch (error) {
      showNotification(error.message || 'Unable to load dashboard data', 'error')
    } finally {
      setLoading(false)
    }
  }

  const stats = useMemo(
    () => [
      { label: 'Scraper jobs', value: scraperJobs.length, icon: '🕸️' },
      { label: 'PDF jobs', value: pdfJobs.length, icon: '📄' },
      {
        label: 'Completed tasks',
        value:
          scraperJobs.filter((job) => job.status === 'completed').length +
          pdfJobs.filter((job) => job.status === 'completed').length,
        icon: '✅',
      },
      { label: 'Exports ready', value: scraperJobs.length + pdfJobs.length, icon: '📤' },
    ],
    [pdfJobs, scraperJobs],
  )

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <SectionHeader title="Dashboard" />
        <Button onClick={loadDashboardData} disabled={loading}>
          {loading ? 'Refreshing…' : 'Refresh data'}
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="p-6">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-indigo-500/10 text-2xl text-indigo-300">
                {stat.icon}
              </div>
              <p className="text-sm text-slate-400">{stat.label}</p>
              <p className="mt-4 text-3xl font-semibold text-white">{stat.value}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Recent scraping</p>
              <h2 className="mt-3 text-xl font-semibold text-white">Latest jobs</h2>
            </div>
            <Button variant="secondary" onClick={loadDashboardData}>
              Reload
            </Button>
          </div>

          <div className="mt-6 space-y-3">
            {loading ? (
              <p className="text-slate-400">Loading scraping activity…</p>
            ) : scraperJobs.length === 0 ? (
              <p className="text-slate-400">No scraping activity yet.</p>
            ) : (
              scraperJobs.map((job) => (
                <div key={job.id || job.jobId || job.url} className="rounded-3xl border border-slate-700/80 bg-slate-900/80 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-white">{job.name || job.url || 'Scraping job'}</p>
                    <span className="rounded-full bg-slate-800/90 px-3 py-1 text-xs text-slate-300">
                      {job.status || 'pending'}
                    </span>
                  </div>
                  {job.startedAt && <p className="mt-2 text-sm text-slate-400">Started {new Date(job.startedAt).toLocaleString()}</p>}
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="p-6">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">PDF activity</p>
            <h2 className="mt-3 text-xl font-semibold text-white">Recent PDF jobs</h2>
          </div>

          <div className="mt-6 space-y-3">
            {loading ? (
              <p className="text-slate-400">Loading PDF history…</p>
            ) : pdfJobs.length === 0 ? (
              <p className="text-slate-400">No PDF processing history found.</p>
            ) : (
              pdfJobs.map((job) => (
                <div key={job.id || job.jobId || job.fileName} className="rounded-3xl border border-slate-700/80 bg-slate-900/80 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-white">{job.fileName || 'PDF task'}</p>
                    <span className="rounded-full bg-slate-800/90 px-3 py-1 text-xs text-slate-300">
                      {job.status || 'completed'}
                    </span>
                  </div>
                  {job.createdAt && <p className="mt-2 text-sm text-slate-400">Created {new Date(job.createdAt).toLocaleString()}</p>}
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}

export default DashboardPage
