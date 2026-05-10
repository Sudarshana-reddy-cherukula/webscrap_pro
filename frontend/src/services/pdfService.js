import httpClient from './httpClient'

export const pdfService = {
  // Extract text from PDF
  extractText(file) {
    const formData = new FormData()
    formData.append('file', file)
    return httpClient.post('/pdf/extract-text', formData)
  },

  // Merge multiple PDFs
  mergePdfs(files) {
    const formData = new FormData()
    files.forEach((file, index) => {
      formData.append(`file_${index}`, file)
    })
    return httpClient.post('/pdf/merge', formData)
  },

  // Split PDF into individual pages
  splitPdf(file, pageRanges = null) {
    const formData = new FormData()
    formData.append('file', file)
    if (pageRanges) {
      formData.append('pageRanges', JSON.stringify(pageRanges))
    }
    return httpClient.post('/pdf/split', formData)
  },

  // Compress PDF file
  compressPdf(file, quality = 'medium') {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('quality', quality)
    return httpClient.post('/pdf/compress', formData)
  },

  // Rotate PDF pages
  rotatePdf(file, angle = 90) {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('angle', angle)
    return httpClient.post('/pdf/rotate', formData)
  },

  // Extract images from PDF
  extractImages(file) {
    const formData = new FormData()
    formData.append('file', file)
    return httpClient.post('/pdf/extract-images', formData)
  },

  // Add watermark to PDF
  addWatermark(file, watermarkText) {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('watermark', watermarkText)
    return httpClient.post('/pdf/add-watermark', formData)
  },

  // Add page numbers to PDF
  addPageNumbers(file, format = 'Page {page}') {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('format', format)
    return httpClient.post('/pdf/add-page-numbers', formData)
  },

  // Convert PDF to images
  convertToImages(file, format = 'png', dpi = 150) {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('format', format)
    formData.append('dpi', dpi)
    return httpClient.post('/pdf/convert-to-images', formData)
  },

  // Get PDF metadata
  getMetadata(file) {
    const formData = new FormData()
    formData.append('file', file)
    return httpClient.post('/pdf/metadata', formData)
  },

  // Get processing history
  getHistory(limit = 50, offset = 0) {
    return httpClient.get('/pdf/history', { params: { limit, offset } })
  },

  // Cancel ongoing PDF operation
  cancel(jobId) {
    return httpClient.post(`/pdf/cancel/${jobId}`)
  },
}
