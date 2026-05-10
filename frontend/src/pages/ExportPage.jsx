import { useState, useEffect } from 'react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import SectionHeader from '../components/ui/SectionHeader'
import { useNotification } from '../hooks/useNotification'
import { exportService } from '../services/exportService'
import Select from '../components/ui/Select'
import { useAppUiStore } from '../hooks/useAppUiStore'

const EXPORT_SOURCES = [
  { value: '', label: 'Select source...' },
  { value: 'scraped', label: 'Scraped Data' },
  { value: 'pdf', label: 'PDF Extracted' },
  { value: 'uploaded', label: 'Uploaded Files' },
]

function ExportPage() {
  const { exportSource, setExportSource } = useAppUiStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [exportHistory, setExportHistory] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(true)
  const [formats, setFormats] = useState([])
  const [selectedFormat, setSelectedFormat] = useState('csv')
  const { showNotification } = useNotification()

  useEffect(() => {
    loadExportHistory()
    loadFormats()
  }, [])

  const loadExportHistory = async () => {
    try {
      setLoadingHistory(true)
      const response = await exportService.getHistory(10)
      setExportHistory(response.data.exports || [])
    } catch (error) {
      showNotification('Failed to load export history', 'error')
    } finally {
      setLoadingHistory(false)
    }
  }

  const loadFormats = async () => {
    try {
      const response = await exportService.getFormats()
      setFormats(response.data.formats || ['csv', 'json', 'xlsx', 'xml'])
    } catch (error) {
      showNotification('Failed to load export formats', 'error')
    }
  }

  const startExport = async () => {
    if (!exportSource) {
      showNotification('Please select a data source', 'error')
      return
    }
    try {
      setIsSubmitting(true)
      await exportService.start({ source: exportSource, format: selectedFormat })
      showNotification('Export started...')
      setTimeout(() => loadExportHistory(), 1000)
    } catch (error) {
      showNotification(error.message || 'Failed to start export', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDownloadExport = async (exportId) => {
    try {
      const blob = await exportService.download(exportId, selectedFormat)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `export-${exportId}.${selectedFormat}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      showNotification('Export downloaded successfully')
    } catch (error) {
      showNotification('Failed to download export', 'error')
    }
  }

  const handleDeleteExport = async (exportId) => {
    if (!window.confirm('Are you sure you want to delete this export?')) {
      return
    }
    try {
      await exportService.delete(exportId)
      showNotification('Export deleted successfully')
      loadExportHistory()
    } catch (error) {
      showNotification('Failed to delete export', 'error')
    }
  }

  const handleCancelExport = async (exportId) => {
    try {
      await exportService.cancel(exportId)
      showNotification('Export canceled')
      loadExportHistory()
    } catch (error) {
      showNotification('Failed to cancel export', 'error')
    }
  }

  return (
    <section className="container">
      <SectionHeader title="Export Center" />
      <div className="grid-2">
        <Card>
          <h3>Export Configuration</h3>
          <Select
            id="export-source"
            label="Data Source"
            options={EXPORT_SOURCES}
            value={exportSource}
            onChange={(e) => setExportSource(e.target.value)}
          />
          <Select
            id="export-format"
            label="Export Format"
            options={[
              { value: '', label: 'Select format...' },
              ...formats.map((format) => ({ value: format, label: format.toUpperCase() })),
            ]}
            value={selectedFormat}
            onChange={(e) => setSelectedFormat(e.target.value)}
          />
          <Button
            type="button"
            className="full-width"
            onClick={startExport}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Starting...' : 'Export Now'}
          </Button>
        </Card>

        <Card>
          <h3>Export History</h3>
          {loadingHistory ? (
            <p>Loading export history...</p>
          ) : exportHistory.length === 0 ? (
            <EmptyState icon="📁" title="No exports yet" text="Export data to see history here" />
          ) : (
            <div className="export-list">
              {exportHistory.map((exp) => (
                <div key={exp.id} className="export-item">
                  <div className="export-info">
                    <h4>{exp.name || `Export ${exp.id.substring(0, 8)}`}</h4>
                    <p className="text-small">
                      {new Date(exp.createdAt).toLocaleString()}
                    </p>
                    <p className="text-small">Status: {exp.status}</p>
                  </div>
                  <div className="export-actions">
                    {exp.status === 'completed' && (
                      <Button
                        size="small"
                        variant="secondary"
                        onClick={() => handleDownloadExport(exp.id)}
                      >
                        Download
                      </Button>
                    )}
                    {exp.status === 'running' && (
                      <Button
                        size="small"
                        variant="secondary"
                        onClick={() => handleCancelExport(exp.id)}
                      >
                        Cancel
                      </Button>
                    )}
                    <Button
                      size="small"
                      variant="secondary"
                      onClick={() => handleDeleteExport(exp.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </section>
  )
}

export default ExportPage
