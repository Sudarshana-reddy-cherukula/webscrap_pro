import httpClient from './httpClient'

export const authApi = {
  login(credentials) {
    return httpClient.post('/auth/login', credentials)
  },

  register(data) {
    return httpClient.post('/auth/register', data)
  },

  getProfile() {
    return httpClient.get('/auth/profile')
  },

  updateProfile(data) {
    return httpClient.put('/users/me', data)
  },
}
