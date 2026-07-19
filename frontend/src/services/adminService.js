import httpClient from './httpClient'

export const adminService = {
  getDashboardStats() {
    return httpClient.get('/admin/dashboard')
  },

  getUsers(params = {}) {
    return httpClient.get('/admin/users', { params })
  },

  getUser(userId) {
    return httpClient.get(`/admin/users/${userId}`)
  },

  updateUserRole(userId, role) {
    return httpClient.put(`/admin/users/${userId}/role`, { role })
  },

  updateUserStatus(userId, isActive) {
    return httpClient.put(`/admin/users/${userId}/status`, { isActive })
  },

  deleteUser(userId) {
    return httpClient.delete(`/admin/users/${userId}`)
  },

  getSystemHealth() {
    return httpClient.get('/admin/health')
  },
}
