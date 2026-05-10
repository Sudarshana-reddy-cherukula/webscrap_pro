import httpClient from './httpClient'

export const dashboardService = {
  // Get dashboard statistics
  getStatistics() {
    return httpClient.get('/dashboard/statistics')
  },

  // Get active jobs
  getActiveJobs() {
    return httpClient.get('/dashboard/active-jobs')
  },

  // Get job history
  getJobHistory(limit = 10, offset = 0) {
    return httpClient.get('/dashboard/history', { params: { limit, offset } })
  },

  // Get recent activities
  getRecentActivities(limit = 20) {
    return httpClient.get('/dashboard/activities', { params: { limit } })
  },

  // Get system health status
  getHealthStatus() {
    return httpClient.get('/dashboard/health')
  },

  // Get data summary
  getDataSummary() {
    return httpClient.get('/dashboard/data-summary')
  },

  // Get storage usage
  getStorageUsage() {
    return httpClient.get('/dashboard/storage')
  },

  // Get usage statistics for time period
  getUsageStats(timeRange = '30d') {
    return httpClient.get('/dashboard/usage', { params: { timeRange } })
  },

  // Get performance metrics
  getPerformanceMetrics(timeRange = '24h') {
    return httpClient.get('/dashboard/performance', { params: { timeRange } })
  },

  // Get alerts and notifications
  getAlerts() {
    return httpClient.get('/dashboard/alerts')
  },

  // Mark alert as read
  markAlertAsRead(alertId) {
    return httpClient.put(`/dashboard/alerts/${alertId}/read`)
  },

  // Clear all alerts
  clearAlerts() {
    return httpClient.delete('/dashboard/alerts')
  },

  // Get dashboard widgets configuration
  getWidgetsConfig() {
    return httpClient.get('/dashboard/widgets')
  },

  // Update widgets configuration
  updateWidgetsConfig(config) {
    return httpClient.put('/dashboard/widgets', config)
  },

  // Get real-time stats (WebSocket recommended but this is fallback)
  getRealTimeStats() {
    return httpClient.get('/dashboard/realtime')
  },

  // Get job trends
  getJobTrends(timeRange = '7d') {
    return httpClient.get('/dashboard/trends', { params: { timeRange } })
  },

  // Get success/failure rates
  getSuccessRates(timeRange = '30d') {
    return httpClient.get('/dashboard/success-rates', { params: { timeRange } })
  },

  // Get top data sources
  getTopSources(limit = 5) {
    return httpClient.get('/dashboard/top-sources', { params: { limit } })
  },

  // Get upcoming scheduled jobs
  getUpcomingJobs(limit = 10) {
    return httpClient.get('/dashboard/upcoming-jobs', { params: { limit } })
  },

  // Get pending actions
  getPendingActions() {
    return httpClient.get('/dashboard/pending-actions')
  },

  // Get system logs
  getSystemLogs(limit = 50, offset = 0, level = null) {
    const params = { limit, offset }
    if (level) params.level = level
    return httpClient.get('/dashboard/logs', { params })
  },

  // Export dashboard report
  exportReport(format = 'pdf', timeRange = '30d') {
    return httpClient.get('/dashboard/export-report', {
      params: { format, timeRange },
      responseType: 'blob',
    })
  },

  // Schedule report generation
  scheduleReport(config) {
    return httpClient.post('/dashboard/scheduled-reports', config)
  },

  // Get scheduled reports
  getScheduledReports() {
    return httpClient.get('/dashboard/scheduled-reports')
  },

  // Update dashboard preferences
  updatePreferences(preferences) {
    return httpClient.put('/dashboard/preferences', preferences)
  },

  // Get dashboard preferences
  getPreferences() {
    return httpClient.get('/dashboard/preferences')
  },
}
