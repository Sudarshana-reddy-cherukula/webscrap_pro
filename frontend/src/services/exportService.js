import httpClient from './httpClient'

export const exportService = {
  // Start a new export job
  start(payload) {
    return httpClient.post('/export/start', payload)
  },

  // Get export history
  getHistory(limit = 50, offset = 0) {
    return httpClient.get('/export/history', { params: { limit, offset } })
  },

  // Get details of a specific export
  getExportDetails(exportId) {
    return httpClient.get(`/export/${exportId}`)
  },

  // Cancel an ongoing export
  cancel(exportId) {
    return httpClient.post(`/export/${exportId}/cancel`)
  },

  // Download export file
  download(exportId, format = 'csv') {
    return httpClient.get(`/export/${exportId}/download`, {
      params: { format },
      responseType: 'blob',
    })
  },

  // Get available export formats
  getFormats() {
    return httpClient.get('/export/formats')
  },

  // Get export status
  getStatus(exportId) {
    return httpClient.get(`/export/${exportId}/status`)
  },

  // Delete an export
  delete(exportId) {
    return httpClient.delete(`/export/${exportId}`)
  },

  // Schedule periodic exports
  schedule(payload) {
    return httpClient.post('/export/schedule', payload)
  },

  // Get list of scheduled exports
  getScheduled() {
    return httpClient.get('/export/scheduled')
  },

  // Update export preferences
  updatePreferences(preferences) {
    return httpClient.put('/export/preferences', preferences)
  },

  // Get export preferences
  getPreferences() {
    return httpClient.get('/export/preferences')
  },
}
