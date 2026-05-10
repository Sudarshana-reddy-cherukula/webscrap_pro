import httpClient from './httpClient'

export const analyticsService = {
  // Get overview statistics
  getOverview() {
    return httpClient.get('/analytics/overview')
  },

  // Get trend data for specified period
  getTrends(period = '30d') {
    return httpClient.get('/analytics/trends', { params: { period } })
  },

  // Get frequency analysis of scraped data
  getFrequency(dataSource = 'all', limit = 10) {
    return httpClient.get('/analytics/frequency', { params: { dataSource, limit } })
  },

  // Get top keywords from scraped data
  getKeywords(limit = 20) {
    return httpClient.get('/analytics/keywords', { params: { limit } })
  },

  // Get detailed analytics for a specific job
  getJobAnalytics(jobId) {
    return httpClient.get(`/analytics/job/${jobId}`)
  },

  // Export analytics data
  exportAnalytics(format = 'csv', dataType = 'overview') {
    return httpClient.get('/analytics/export', { params: { format, dataType } })
  },

  // Get custom date range analytics
  getDateRangeAnalytics(startDate, endDate) {
    return httpClient.get('/analytics/date-range', {
      params: { startDate, endDate },
    })
  },

  // Clear analytics data
  clearAnalytics() {
    return httpClient.delete('/analytics/clear')
  },
}
