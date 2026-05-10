import httpClient from './httpClient'

export const scraperService = {
  // Start a new scraping job
  start(payload) {
    return httpClient.post('/scraper/start', payload)
  },

  // Get scraping job status
  getStatus(jobId) {
    return httpClient.get(`/scraper/job/${jobId}`)
  },

  // Stop a running scraping job
  stop(jobId) {
    return httpClient.post(`/scraper/job/${jobId}/stop`)
  },

  // Get scraping job results
  getResults(jobId, format = 'json') {
    return httpClient.get(`/scraper/job/${jobId}/results`, { params: { format } })
  },

  // Get list of all scraping jobs
  getJobs(limit = 50, offset = 0, status = null) {
    const params = { limit, offset }
    if (status) params.status = status
    return httpClient.get('/scraper/jobs', { params })
  },

  // Get detailed job information
  getJobDetails(jobId) {
    return httpClient.get(`/scraper/job/${jobId}/details`)
  },

  // Delete a scraping job and its results
  deleteJob(jobId) {
    return httpClient.delete(`/scraper/job/${jobId}`)
  },

  // Pause a running job
  pauseJob(jobId) {
    return httpClient.post(`/scraper/job/${jobId}/pause`)
  },

  // Resume a paused job
  resumeJob(jobId) {
    return httpClient.post(`/scraper/job/${jobId}/resume`)
  },

  // Download job results
  downloadResults(jobId, format = 'csv') {
    return httpClient.get(`/scraper/job/${jobId}/download`, {
      params: { format },
      responseType: 'blob',
    })
  },

  // Get scraping templates
  getTemplates() {
    return httpClient.get('/scraper/templates')
  },

  // Save a scraper configuration as template
  saveTemplate(config) {
    return httpClient.post('/scraper/templates', config)
  },

  // Get scraper statistics
  getStatistics(timeRange = '7d') {
    return httpClient.get('/scraper/statistics', { params: { timeRange } })
  },

  // Validate URLs before scraping
  validateUrls(urls) {
    return httpClient.post('/scraper/validate-urls', { urls })
  },

  // Get estimated scraping time
  estimateTime(payload) {
    return httpClient.post('/scraper/estimate-time', payload)
  },

  // Schedule recurring scraping jobs
  schedule(payload) {
    return httpClient.post('/scraper/schedule', payload)
  },

  // Get scheduled scraping jobs
  getScheduledJobs() {
    return httpClient.get('/scraper/scheduled-jobs')
  },

  // Update scraper preferences
  updatePreferences(preferences) {
    return httpClient.put('/scraper/preferences', preferences)
  },

  // Get scraper preferences
  getPreferences() {
    return httpClient.get('/scraper/preferences')
  },
}
