import httpClient from './httpClient'

export const webhookService = {
  getWebhooks() {
    return httpClient.get('/webhooks')
  },

  getWebhook(id) {
    return httpClient.get(`/webhooks/${id}`)
  },

  createWebhook(data) {
    return httpClient.post('/webhooks', data)
  },

  updateWebhook(id, data) {
    return httpClient.put(`/webhooks/${id}`, data)
  },

  deleteWebhook(id) {
    return httpClient.delete(`/webhooks/${id}`)
  },

  toggleWebhook(id) {
    return httpClient.post(`/webhooks/${id}/toggle`)
  },

  testWebhook(id) {
    return httpClient.post(`/webhooks/${id}/test`)
  },
}
