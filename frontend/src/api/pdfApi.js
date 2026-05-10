import httpClient from './httpClient'

function buildFormData(file, extra = {}) {
  const formData = new FormData()
  formData.append('file', file)

  Object.entries(extra).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, value)
    }
  })

  return formData
}

export const pdfApi = {
  extractText(file) {
    return httpClient.post('/pdf/extract-text', buildFormData(file))
  },

  extractMetadata(file) {
    return httpClient.post('/pdf/metadata', buildFormData(file))
  },

  extractImages(file) {
    return httpClient.post('/pdf/extract-images', buildFormData(file))
  },

  convertToTxt(file) {
    return httpClient.post('/pdf/convert-to-txt', buildFormData(file), {
      responseType: 'blob',
    })
  },

  convertToDocx(file) {
    return httpClient.post('/pdf/convert-to-docx', buildFormData(file), {
      responseType: 'blob',
    })
  },

  getHistory(params = { limit: 10 }) {
    return httpClient.get('/pdf/history', { params })
  },
}
