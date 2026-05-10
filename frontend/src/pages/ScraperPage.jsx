import { useState, useEffect } from 'react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import SectionHeader from '../components/ui/SectionHeader'
import { useNotification } from '../hooks/useNotification'
import { scraperService } from '../services/scraperService'
import Select from '../components/ui/Select'
import Input from '../components/ui/Input'
import Textarea from '../components/ui/Textarea'
import { SCRAPE_TYPES, SELECTOR_TYPES } from '../constants/scraperOptions'
import { getSelectorPlaceholder } from '../utils/selectorPlaceholder'
import { useAppUiStore } from '../hooks/useAppUiStore'

function ScraperPage() {
  const { scraperForm, setScraperForm } = useAppUiStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isStopping, setIsStopping] = useState(false)
  const [jobs, setJobs] = useState([])
  const [loadingJobs, setLoadingJobs] = useState(true)
  const [activeJobId, setActiveJobId] = useState(null)
  const { showNotification } = useNotification()

  useEffect(() => {
    loadScrappingJobs()
    const interval = setInterval(loadScrappingJobs, 5000)
    return () => clearInterval(interval)
  }, [])

  const loadScrappingJobs = async () => {
    try {
      setLoadingJobs(true)
      const response = await scraperService.getJobs(20)
      setJobs(response.data.jobs || [])
    } catch (error) {
      // Continue without showing error on auto-refresh
      if (jobs.length === 0) {
        showNotification('Failed to load scraping jobs', 'error')
      }
    } finally {
      setLoadingJobs(false)
    }
  }

  const startScraping = async () => {
    if (!scraperForm.urls.trim()) {
      showNotification('Please enter URLs', 'error')
      return
    }

    const targetUrls = scraperForm.urls
      .split('\n')
      .map((item) => item.trim())
      .filter(Boolean)

    try {
      setIsSubmitting(true)
      const response = await scraperService.start({
        targetUrls,
        crawlDepth: Number(scraperForm.crawlDepth),
        scrapeType: scraperForm.scrapeType,
        selectorType: scraperForm.selectorType,
        selectorValue: scraperForm.selectorValue,
      })
      setActiveJobId(response.data.jobId)
      showNotification('Scraping job submitted successfully')
      setTimeout(() => loadScrappingJobs(), 500)
    } catch (error) {
      showNotification(error.message || 'Could not start scraping', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const stopScraping = async (jobId) => {
    try {
      setIsStopping(true)
      await scraperService.stop(jobId)
      showNotification('Scraping job stopped')
      loadScrappingJobs()
    } catch (error) {
      showNotification('Failed to stop scraping job', 'error')
    } finally {
      setIsStopping(false)
    }
  }

  const pauseScraping = async (jobId) => {
    try {
      await scraperService.pauseJob(jobId)
      showNotification('Scraping job paused')
      loadScrappingJobs()
    } catch (error) {
      showNotification('Failed to pause scraping job', 'error')
    }
  }

  const resumeScraping = async (jobId) => {
    try {
      await scraperService.resumeJob(jobId)
      showNotification('Scraping job resumed')
      loadScrappingJobs()
    } catch (error) {
      showNotification('Failed to resume scraping job', 'error')
    }
  }

  const downloadResults = async (jobId, format = 'csv') => {
    try {
      const blob = await scraperService.downloadResults(jobId, format)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `scraping-results-${jobId}.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      showNotification('Results downloaded successfully')
    } catch (error) {
      showNotification('Failed to download results', 'error')
    }
  }

  const deleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job?')) {
      return
    }
    try {
      await scraperService.deleteJob(jobId)
      showNotification('Job deleted')
      loadScrappingJobs()
    } catch (error) {
      showNotification('Failed to delete job', 'error')
    }
  }

  const getStatusBadge = (status) => {
    const colors = {
      running: '🟢',
      completed: '✅',
      failed: '❌',
      paused: '⏸️',
      pending: '⏳',
    }
    return colors[status] || '❓'
  }

  return (
    <section className="container">
      <SectionHeader title="Web Scraper" />
      <div className="grid-2">
        <Card>
          <h3>Scraper Configuration</h3>
          <Textarea
            id="scraper-urls"
            label="Target URLs (one per line)"
            placeholder={'https://example.com\nhttps://example.com/page2'}
            value={scraperForm.urls}
            onChange={(e) => setScraperForm((prev) => ({ ...prev, urls: e.target.value }))}
          />
          <div className="grid-2 compact-grid">
            <Select
              id="scraper-type"
              label="URL Type"
              options={SCRAPE_TYPES}
              value={scraperForm.scrapeType}
              onChange={(e) =>
                setScraperForm((prev) => ({ ...prev, scrapeType: e.target.value }))
              }
            />
            <Input
              id="scraper-depth"
              label="Crawl Depth"
              type="number"
              min="1"
              max="10"
              value={scraperForm.crawlDepth}
              onChange={(e) =>
                setScraperForm((prev) => ({ ...prev, crawlDepth: e.target.value }))
              }
            />
          </div>
          <div className="grid-2 compact-grid">
            <Select
              id="selector-type"
              label="Selector Type"
              options={SELECTOR_TYPES}
              value={scraperForm.selectorType}
              onChange={(e) =>
                setScraperForm((prev) => ({ ...prev, selectorType: e.target.value }))
              }
            />
            <Input
              id="selector-value"
              label="Selector Value"
              placeholder={getSelectorPlaceholder(scraperForm.selectorType)}
              value={scraperForm.selectorValue}
              onChange={(e) =>
                setScraperForm((prev) => ({ ...prev, selectorValue: e.target.value }))
              }
            />
          </div>
          <div className="action-row">
            <Button
              type="button"
              className="grow"
              onClick={startScraping}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Starting...' : 'Start Scraping'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="grow"
              onClick={() => activeJobId && stopScraping(activeJobId)}
              disabled={isStopping || !activeJobId}
            >
              {isStopping ? 'Stopping...' : 'Stop'}
            </Button>
          </div>
        </Card>

        <Card>
          <h3>Active Jobs ({jobs.filter((j) => j.status === 'running').length})</h3>
          {loadingJobs ? (
            <p>Loading jobs...</p>
          ) : jobs.length === 0 ? (
            <EmptyState icon="🔍" title="No jobs" text="Start a scraping job to see it here" />
          ) : (
            <div className="jobs-list">
              {jobs.slice(0, 5).map((job) => (
                <div key={job.id} className="job-item">
                  <div className="job-header">
                    <span className="status-badge">{getStatusBadge(job.status)}</span>
                    <h4>{job.id.substring(0, 12)}...</h4>
                  </div>
                  <p className="text-small">URLs: {job.urlCount || 0}</p>
                  <p className="text-small">
                    Progress: {job.processedCount || 0}/{job.urlCount || 0}
                  </p>
                  <div className="job-actions">
                    {job.status === 'running' && (
                      <>
                        <Button
                          size="small"
                          variant="secondary"
                          onClick={() => pauseScraping(job.id)}
                        >
                          Pause
                        </Button>
                        <Button
                          size="small"
                          variant="secondary"
                          onClick={() => stopScraping(job.id)}
                        >
                          Stop
                        </Button>
                      </>
                    )}
                    {job.status === 'paused' && (
                      <Button
                        size="small"
                        variant="secondary"
                        onClick={() => resumeScraping(job.id)}
                      >
                        Resume
                      </Button>
                    )}
                    {job.status === 'completed' && (
                      <Button
                        size="small"
                        variant="secondary"
                        onClick={() => downloadResults(job.id, 'csv')}
                      >
                        Download
                      </Button>
                    )}
                    <Button
                      size="small"
                      variant="secondary"
                      onClick={() => deleteJob(job.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </section>
  )
}

export default ScraperPage
