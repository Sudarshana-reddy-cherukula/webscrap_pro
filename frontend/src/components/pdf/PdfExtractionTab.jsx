import { pdfService } from '@/services/pdfService'

function PdfExtractionTab({ isProcessing, setIsProcessing, showNotification }) {
  const onFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setIsProcessing(true)
      await pdfService.extractText(file)
      showNotification(`Processed ${file.name}`)
    } catch (error) {
      showNotification(error.message || 'Failed to process PDF', 'error')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <>
      <h3>Upload PDF</h3>
      <label className="upload-area" htmlFor="pdf-upload">
        <div className="upload-icon">📄</div>
        <div className="upload-text">Click to upload or drag and drop</div>
        <input
          type="file"
          id="pdf-upload"
          accept=".pdf"
          className="hidden-input"
          onChange={onFileUpload}
        />
      </label>
      {isProcessing && <p className="processing-text">Processing PDF...</p>}
    </>
  )
}

export default PdfExtractionTab
