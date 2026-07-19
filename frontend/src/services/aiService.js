import httpClient from './httpClient'

export const aiService = {
  summarize(jobId, options = {}) {
    return httpClient.post(`/ai/summarize/${jobId}`, options)
  },

  extractKeywords(jobId, options = {}) {
    return httpClient.post(`/ai/keywords/${jobId}`, options)
  },

  classify(jobId, options = {}) {
    return httpClient.post(`/ai/classify/${jobId}`, options)
  },

  generateEmbedding(jobId) {
    return httpClient.post(`/ai/embed/${jobId}`)
  },

  semanticSearch(query, options = {}) {
    return httpClient.post('/ai/search', { query, ...options })
  },

  detectDuplicate(jobId) {
    return httpClient.post(`/ai/duplicate/${jobId}`)
  },

  getDuplicateStats() {
    return httpClient.get('/ai/duplicates/stats')
  },

  createChatSession(jobId) {
    return httpClient.post(`/ai/chat/${jobId}`)
  },

  sendMessage(sessionId, message) {
    return httpClient.post(`/ai/chat/${sessionId}/message`, { message })
  },

  getChatSessions() {
    return httpClient.get('/ai/chat/sessions')
  },

  getChatHistory(sessionId) {
    return httpClient.get(`/ai/chat/${sessionId}`)
  },

  createScheduledJob(data) {
    return httpClient.post('/ai/schedule', data)
  },

  getScheduledJobs() {
    return httpClient.get('/ai/schedule')
  },

  updateScheduledJob(jobId, data) {
    return httpClient.put(`/ai/schedule/${jobId}`, data)
  },

  deleteScheduledJob(jobId) {
    return httpClient.delete(`/ai/schedule/${jobId}`)
  },

  toggleScheduledJob(jobId) {
    return httpClient.post(`/ai/schedule/${jobId}/toggle`)
  },

  runScheduledJobNow(jobId) {
    return httpClient.post(`/ai/schedule/${jobId}/run`)
  },

  generateReport(jobId, options = {}) {
    return httpClient.post(`/ai/report/${jobId}`, options)
  },

  downloadReport(jobId) {
    return httpClient.get(`/ai/report/${jobId}/download`, { responseType: 'blob' })
  },
}
