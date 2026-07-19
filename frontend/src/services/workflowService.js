import httpClient from './httpClient'

export const workflowService = {
  getWorkflows(params = {}) {
    return httpClient.get('/workflows', { params })
  },

  getWorkflow(id) {
    return httpClient.get(`/workflows/${id}`)
  },

  createWorkflow(data) {
    return httpClient.post('/workflows', data)
  },

  updateWorkflow(id, data) {
    return httpClient.put(`/workflows/${id}`, data)
  },

  deleteWorkflow(id) {
    return httpClient.delete(`/workflows/${id}`)
  },

  toggleWorkflow(id) {
    return httpClient.post(`/workflows/${id}/toggle`)
  },

  executeWorkflow(id) {
    return httpClient.post(`/workflows/${id}/execute`)
  },

  getRunHistory(workflowId, params = {}) {
    return httpClient.get(`/workflows/${workflowId}/runs`, { params })
  },

  getRun(runId) {
    return httpClient.get(`/workflows/runs/${runId}`)
  },

  cancelRun(runId) {
    return httpClient.post(`/workflows/runs/${runId}/cancel`)
  },

  getStats() {
    return httpClient.get('/workflows/stats')
  },
}
