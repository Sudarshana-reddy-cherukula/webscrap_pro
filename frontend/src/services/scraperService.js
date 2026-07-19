import httpClient from './httpClient'

function normalizeUrl(url) {
  if (!url) return ''
  url = url.trim()
  if (!/^https?:\/\//i.test(url)) {
    url = 'https://' + url
  }
  return url
}

export const scraperService = {
  start(payload) {
    const url = normalizeUrl(payload.targetUrls?.[0] || '')
    const type = payload.scrapeType || 'fullPage'

    const routes = {
      fullPage: '/scrape/url',
      specific: '/scrape/url',
      metadata: '/scrape/metadata',
      links: '/scrape/links',
      images: '/scrape/images',
    }

    const route = routes[type] || '/scrape/url'

    return httpClient.post(route, {
      url,
      options: {
        extractText: type === 'fullPage' || type === 'specific',
        extractTitle: true,
        extractHeadings: type === 'fullPage' || type === 'specific',
        extractParagraphs: type === 'fullPage' || type === 'specific',
        extractLinks: type === 'links',
        extractImages: type === 'images',
        extractMetadata: type === 'metadata',
        usePlaywright: payload.usePlaywright === true,
      },
    })
  },

  getStatus(jobId) {
    return httpClient.get(`/scrape/status/${jobId}`)
  },

  pauseJob(jobId) {
    return httpClient.post(`/scrape/pause/${jobId}`)
  },

  resumeJob(jobId) {
    return httpClient.post(`/scrape/resume/${jobId}`)
  },

  stop(jobId) {
    return httpClient.delete(`/scrape/delete/${jobId}`)
  },

  getResults(jobId, format = 'json') {
    return httpClient.get(`/scrape/results/${jobId}`, { params: { format } })
  },

  getJobs(limit = 50, offset = 0, status = null) {
    const params = { limit, page: Math.floor(offset / limit) + 1 }
    if (status) params.status = status
    return httpClient.get('/scrape/jobs', { params })
  },

  getJobsCursor(params = {}) {
    const { cursor, limit = 20, status, search } = params
    const query = { limit }
    if (cursor) query.cursor = cursor
    if (status) query.status = status
    if (search) query.search = search
    return httpClient.get('/scrape/jobs/cursor', { params: query })
  },

  getUserJobs(page = 1, limit = 20) {
    return httpClient.get('/scrape/jobs', { params: { page, limit } })
  },

  deleteJob(jobId) {
    return httpClient.delete(`/scrape/delete/${jobId}`)
  },

  downloadResults(jobId, format = 'csv') {
    return httpClient.get(`/scrape/results/${jobId}`, {
      params: { format },
      responseType: 'blob',
    })
  },
}
