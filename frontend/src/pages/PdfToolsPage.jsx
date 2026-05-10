import { useMemo, useState } from 'react'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import FileUpload from '../components/ui/FileUpload'
import SectionHeader from '../components/ui/SectionHeader'
import { pdfApi } from '../api/pdfApi'
import { useNotification } from '../hooks/useNotification'

const actions = [
  { value: 'extractText', label: 'Extract text' },
  { value: 'extractMetadata', label: 'Extract metadata' },
  { value: 'extractImages', label: 'Extract images' },
  { value: 'convertToTxt', label: 'PDF → TXT' },
  { value: 'convertToDocx', label: 'PDF → DOCX' },
]

function PdfToolsPage() {
  const [selectedFile, setSelectedFile] = useState(null)
  const [action, setAction] = useState('extractText')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const { showNotification } = useNotification()

  const previewText = useMemo(() => {
    if (!result) return 'Upload a PDF and choose a tool to preview the output.'
    if (typeof result === 'string') return result
    return JSON.stringify(result, null, 2)
  }, [result])

  const downloadBlob = (blob, filename) => {
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }

  const handleRun = async () => {
    if (!selectedFile) {
      showNotification('Please upload a PDF before running a tool.', 'warning')
      return
    }

    setLoading(true)
    setResult(null)

    try {
      if (action === 'extractText') {
        const response = await pdfApi.extractText(selectedFile)
        setResult(response.data.text || response.data)
      } else if (action === 'extractMetadata') {
        const response = await pdfApi.extractMetadata(selectedFile)
        setResult(response.data)
      } else if (action === 'extractImages') {
        const response = await pdfApi.extractImages(selectedFile)
        setResult(response.data)
      } else if (action === 'convertToTxt') {
        const response = await pdfApi.convertToTxt(selectedFile)
        downloadBlob(response.data, `${selectedFile.name.replace(/\.pdf$/i, '')}.txt`)
        setResult('Download ready.')
      } else if (action === 'convertToDocx') {
        const response = await pdfApi.convertToDocx(selectedFile)
        downloadBlob(response.data, `${selectedFile.name.replace(/\.pdf$/i, '')}.docx`)
        setResult('Download ready.')
      }

      showNotification('PDF tool completed successfully.')
    } catch (error) {
      showNotification(error.message || 'PDF tool failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <SectionHeader title="PDF Tools" />
        <p className="text-sm text-slate-400">Process PDFs with upload-first workflows and export-ready outputs.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <Card className="space-y-6 p-6">
          <FileUpload
            accept=".pdf"
            onFilesSelected={(files) => setSelectedFile(files[0] || null)}
            title="Upload PDF"
            description="Drag & drop or click to select a PDF file."
          />

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Choose a tool</label>
              <select
                value={action}
                onChange={(event) => setAction(event.target.value)}
                className="mt-3 w-full rounded-2xl border border-slate-300 dark:border-slate-700/90 bg-white dark:bg-slate-950/70 px-4 py-3 text-sm text-slate-900 dark:text-slate-100 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20"
              >
                {actions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <Button type="button" onClick={handleRun} disabled={loading}>
              {loading ? 'Running…' : 'Execute tool'}
            </Button>
          </div>
        </Card>

        <Card className="space-y-6 p-6">
          <div>
            <h2 className="text-lg font-semibold text-white">Tips</h2>
            <p className="mt-2 text-sm text-slate-400">
              For best results, use searchable PDFs. Use the preview panel to confirm extracted text and metadata.
            </p>
          </div>
          <div className="space-y-3 text-sm text-slate-400">
            <p>• Convert to TXT or DOCX with a single click.</p>
            <p>• Extract images from PDFs for downstream processing.</p>
            <p>• Use text and metadata tools for data validation.</p>
          </div>
        </Card>
      </div>

      <Card className="space-y-4 p-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Preview output</h2>
        <pre className="max-h-[420px] overflow-y-auto rounded-3xl border border-slate-200 dark:border-slate-700/90 bg-slate-50 dark:bg-slate-950/80 p-4 text-sm text-slate-900 dark:text-slate-200">
          {previewText}
        </pre>
      </Card>
    </div>
  )
}

export default PdfToolsPage
