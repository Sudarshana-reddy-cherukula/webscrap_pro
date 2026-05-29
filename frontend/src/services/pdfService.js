import httpClient from './httpClient'

export const pdfService = {
  extractText(file) {
    const formData = new FormData()
    formData.append('pdf', file)
    return httpClient.post('/pdf/extract-text', formData)
  },

  extractImages(file) {
    const formData = new FormData()
    formData.append('pdf', file)
    return httpClient.post('/pdf/extract-images', formData)
  },

  getMetadata(file) {
    const formData = new FormData()
    formData.append('pdf', file)
    return httpClient.post('/pdf/extract-metadata', formData)
  },

  convertToTxt(file) {
    const formData = new FormData()
    formData.append('pdf', file)
    return httpClient.post('/pdf/convert-to-txt', formData)
  },

  convertToDocx(file) {
    const formData = new FormData()
    formData.append('pdf', file)
    return httpClient.post('/pdf/convert-to-docx', formData)
  },

  getHistory(limit = 50, offset = 0) {
    return httpClient.get('/pdf/jobs', {
      params: { limit, page: Math.floor(offset / limit) + 1 },
    })
  },
}
