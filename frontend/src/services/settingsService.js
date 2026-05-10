import httpClient from './httpClient'

export const settingsService = {
  // Get all user settings
  getSettings() {
    return httpClient.get('/settings')
  },

  // Update user settings
  updateSettings(settings) {
    return httpClient.put('/settings', settings)
  },

  // Get profile information
  getProfile() {
    return httpClient.get('/settings/profile')
  },

  // Update profile information
  updateProfile(profileData) {
    return httpClient.put('/settings/profile', profileData)
  },

  // Update password
  updatePassword(oldPassword, newPassword) {
    return httpClient.put('/settings/password', { oldPassword, newPassword })
  },

  // Manage API keys
  getApiKeys() {
    return httpClient.get('/settings/api-keys')
  },

  // Create new API key
  createApiKey(name, expiresIn = '90d') {
    return httpClient.post('/settings/api-keys', { name, expiresIn })
  },

  // Delete API key
  deleteApiKey(keyId) {
    return httpClient.delete(`/settings/api-keys/${keyId}`)
  },

  // Revoke API key
  revokeApiKey(keyId) {
    return httpClient.post(`/settings/api-keys/${keyId}/revoke`)
  },

  // Get theme settings
  getThemeSettings() {
    return httpClient.get('/settings/theme')
  },

  // Update theme settings
  updateTheme(theme) {
    return httpClient.put('/settings/theme', { theme })
  },

  // Get notification preferences
  getNotificationPreferences() {
    return httpClient.get('/settings/notifications')
  },

  // Update notification preferences
  updateNotificationPreferences(preferences) {
    return httpClient.put('/settings/notifications', preferences)
  },

  // Get export defaults
  getExportDefaults() {
    return httpClient.get('/settings/export-defaults')
  },

  // Update export defaults
  updateExportDefaults(defaults) {
    return httpClient.put('/settings/export-defaults', defaults)
  },

  // Get security settings
  getSecuritySettings() {
    return httpClient.get('/settings/security')
  },

  // Enable 2FA
  enable2FA() {
    return httpClient.post('/settings/security/2fa/enable')
  },

  // Disable 2FA
  disable2FA(password) {
    return httpClient.post('/settings/security/2fa/disable', { password })
  },

  // Verify 2FA
  verify2FA(code) {
    return httpClient.post('/settings/security/2fa/verify', { code })
  },

  // Get active sessions
  getActiveSessions() {
    return httpClient.get('/settings/sessions')
  },

  // Revoke session
  revokeSession(sessionId) {
    return httpClient.delete(`/settings/sessions/${sessionId}`)
  },

  // Reset all settings to default
  resetToDefaults() {
    return httpClient.post('/settings/reset')
  },

  // Export settings as backup
  exportSettings() {
    return httpClient.get('/settings/export', { responseType: 'blob' })
  },

  // Import settings from backup
  importSettings(file) {
    const formData = new FormData()
    formData.append('file', file)
    return httpClient.post('/settings/import', formData)
  },

  // Get settings audit log
  getAuditLog(limit = 50, offset = 0) {
    return httpClient.get('/settings/audit-log', { params: { limit, offset } })
  },

  // Delete account
  deleteAccount(password) {
    return httpClient.delete('/settings/account', { data: { password } })
  },
}
