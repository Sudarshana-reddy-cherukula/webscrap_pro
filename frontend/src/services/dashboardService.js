import httpClient from './httpClient'

export const dashboardService = {
  getStatistics() {
    return httpClient.get('/user/dashboard')
  },

  getJobHistory(limit = 10, page = 1) {
    return httpClient.get('/user/history', { params: { limit, page } })
  },

  getDownloads(page = 1, limit = 10) {
    return httpClient.get('/user/downloads', { params: { page, limit } })
  },

  getUsageStats(timeRange = '30d') {
    return httpClient.get('/user/statistics', { params: { period: timeRange } })
  },

  getHealthStatus() {
    return httpClient.get('/health')
  },
}
