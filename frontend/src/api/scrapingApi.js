import httpClient from './httpClient'

export const scrapingApi = {
  start(payload) {
    return httpClient.post('/scraper/start', payload)
  },

  getJobs(params = { limit: 10 }) {
    return httpClient.get('/scraper/jobs', { params })
  },

  getResults(jobId, format = 'json') {
    return httpClient.get(`/scraper/job/${jobId}/results`, { params: { format } })
  },

  downloadResults(jobId, format = 'csv') {
    return httpClient.get(`/scraper/job/${jobId}/download`, {
      params: { format },
      responseType: 'blob',
    })
  },

  validateUrls(urls) {
    return httpClient.post('/scraper/validate-urls', { urls })
  },
}
