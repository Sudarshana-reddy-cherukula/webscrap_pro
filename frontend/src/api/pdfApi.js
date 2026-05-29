import httpClient from './httpClient'

function buildFormData(file, extra = {}) {
  const formData = new FormData()
  formData.append('pdf', file)

  Object.entries(extra).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (typeof value === 'object') {
        formData.append(key, JSON.stringify(value))
      } else {
        formData.append(key, value)
      }
    }
  })

  return formData
}

export const pdfApi = {
  extractText(file, options = {}) {
    return httpClient.post('/pdf/extract-text', buildFormData(file, options))
  },

  extractMetadata(file, options = {}) {
    return httpClient.post('/pdf/extract-metadata', buildFormData(file, options))
  },

  extractImages(file, options = {}) {
    return httpClient.post('/pdf/extract-images', buildFormData(file, options))
  },

  convertToTxt(file) {
    return httpClient.post('/pdf/convert-to-txt', buildFormData(file))
  },

  convertToDocx(file) {
    return httpClient.post('/pdf/convert-to-docx', buildFormData(file))
  },

  downloadProcessedFile(jobId) {
    return httpClient.get(`/pdf/download/${jobId}`, {
      responseType: 'blob',
    })
  },

  modifyText(file, options = {}) {
    return httpClient.post('/pdf/modify-text', buildFormData(file, options))
  },

  addWatermark(file, options = {}) {
    return httpClient.post('/pdf/add-watermark', buildFormData(file, options))
  },

  addSecurity(file, options = {}) {
    return httpClient.post('/pdf/add-security', buildFormData(file, options))
  },

  splitPdf(file, options = {}) {
    return httpClient.post('/pdf/split', buildFormData(file, options))
  },

  mergePdf(files) {
    const formData = new FormData()
    files.forEach((f) => formData.append('pdf', f))
    return httpClient.post('/pdf/merge', formData)
  },

  rotatePages(file, options = {}) {
    return httpClient.post('/pdf/rotate', buildFormData(file, options))
  },

  cropPages(file, options = {}) {
    return httpClient.post('/pdf/crop', buildFormData(file, options))
  },

  getHistory(params = { limit: 10 }) {
    return httpClient.get('/pdf/jobs', { params })
  },

  getJobs(params = { limit: 50 }) {
    return httpClient.get('/pdf/jobs', { params })
  },
}
