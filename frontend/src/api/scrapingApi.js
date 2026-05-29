import httpClient from './httpClient'

export const scrapingApi = {
  start(payload) {
    return httpClient.post('/scrape/url', payload)
  },

  getJobs(params = { limit: 10 }) {
    return httpClient.get('/scrape/jobs', { params })
  },

  getResults(jobId, format = 'json') {
    return httpClient.get(`/scrape/results/${jobId}`, { params: { format } })
  },

  downloadResults(jobId, format = 'csv') {
    return httpClient.get(`/scrape/results/${jobId}`, {
      params: { format },
      responseType: 'blob',
    })
  },

  validateUrls(urls) {
    return httpClient.post('/scrape/url', { url: urls[0] })
  },
}
