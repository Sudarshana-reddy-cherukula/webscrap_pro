import httpClient from './httpClient'

export const exportService = {
  start(payload) {
    return httpClient.post('/export/create', payload)
  },

  getHistory(limit = 50, page = 1) {
    return httpClient.get('/export/list', { params: { limit, page } })
  },

  getStatus(exportId) {
    return httpClient.get(`/export/status/${exportId}`)
  },

  download(exportId) {
    return httpClient.get(`/export/download/${exportId}`, {
      responseType: 'blob',
    })
  },

  delete(exportId) {
    return httpClient.delete(`/export/delete/${exportId}`)
  },
}
