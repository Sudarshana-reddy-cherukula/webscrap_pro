import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText, X, Download, Trash2, AlertCircle } from 'lucide-react'
import { SearchInput } from '@/components/ui/SearchInput'
import { UploadProgress } from '@/components/ui/UploadProgress'
import { DataTable } from '@/components/ui/DataTable'
import { Badge } from '@/components/ui/Badge'
import { dashboardService } from '@/services/dashboardService'

const MAX_FILE_SIZE = 50 * 1024 * 1024
const ACCEPTED_TYPES = {
  'application/pdf': ['.pdf'],
  'text/csv': ['.csv'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  'application/json': ['.json'],
  'text/plain': ['.txt'],
}

const columns = [
  { accessor: 'name', header: 'Name', render: (val, row) => (
    <div className="flex items-center gap-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.04]">
        <FileText size={14} className="text-cyan-400" />
      </div>
      <div>
        <p className="text-sm text-app-soft">{val}</p>
        <p className="text-xs text-app-muted">{row.type?.toUpperCase() || 'PDF'}</p>
      </div>
    </div>
  )},
  { accessor: 'size', header: 'Size', render: (val) => {
    const units = ['B', 'KB', 'MB']; let i = 0; let s = val || 0
    while (s >= 1024 && i < units.length - 1) { s /= 1024; i++ }
    return <span className="text-sm text-app-muted">{s.toFixed(1)} {units[i]}</span>
  }},
  { accessor: 'status', header: 'Status', render: (val) => {
    const variants = { completed: 'success', processing: 'warning', failed: 'error', pending: 'default' }
    return <Badge variant={variants[val] || 'default'}>{val}</Badge>
  }},
  { accessor: 'createdAt', header: 'Uploaded', render: (val) => {
    if (!val) return '—'
    const d = new Date(val)
    return <span className="text-sm text-app-muted">{d.toLocaleDateString()} {d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
  }},
  { accessor: 'actions', header: '', render: (_, row) => (
    <div className="flex items-center gap-1">
      <button type="button" className="rounded-lg border border-white/10 p-1.5 text-app-muted hover:bg-white/[0.04] hover:text-app-soft transition" title="Download">
        <Download size={12} />
      </button>
      <button type="button" className="rounded-lg border border-white/10 p-1.5 text-app-muted hover:bg-white/[0.04] hover:text-red-400 transition" title="Delete">
        <Trash2 size={12} />
      </button>
    </div>
  )},
]

function UploadsPage() {
  const [uploads, setUploads] = useState([])
  const [queue, setQueue] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    loadUploads()
    const interval = setInterval(loadUploads, 15000)
    return () => clearInterval(interval)
  }, [])

  const loadUploads = async () => {
    try {
      const res = await dashboardService.getDownloads()
      const data = res.data?.data || res.data
      const items = data?.downloads || (Array.isArray(data) ? data : [])
      setUploads(items)
    } catch {
      setUploads([])
    } finally {
      setLoading(false)
    }
  }

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    if (rejectedFiles?.length > 0) {
      const reason = rejectedFiles[0]?.errors?.[0]?.message || 'Invalid file'
      setError(reason)
      return
    }
    const newFiles = acceptedFiles.map((file) => ({
      id: Date.now().toString() + Math.random(),
      file,
      name: file.name,
      size: file.size,
      progress: 0,
      status: 'uploading',
    }))
    setQueue((prev) => [...prev, ...newFiles])
    setError('')
    newFiles.forEach((entry) => startUpload(entry.id))
  }, [])

  const startUpload = async (id) => {
    const entry = queue.find((f) => f.id === id)
    if (!entry) return

    try {
      const { default: httpClient } = await import('@/services/httpClient')
      const formData = new FormData()
      formData.append('pdf', entry.file)
      await httpClient.post('/pdf/extract-text', formData, {
        onUploadProgress: (e) => {
          if (e.total) {
            const pct = Math.round((e.loaded / e.total) * 100)
            setQueue((prev) => prev.map((f) => (f.id === id ? { ...f, progress: pct } : f)))
          }
        },
      })
      setQueue((prev) => prev.filter((f) => f.id !== id))
      await loadUploads()
    } catch {
      setQueue((prev) => prev.map((f) => (f.id === id ? { ...f, status: 'failed', progress: 0 } : f)))
      setError(`Upload failed for ${entry.name}`)
    }
  }

  const cancelUpload = (id) => setQueue((prev) => prev.filter((f) => f.id !== id))

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxSize: MAX_FILE_SIZE,
    onDropRejected: (rejections) => {
      const err = rejections[0]?.errors?.[0]
      if (err?.code === 'file-too-large') setError('File exceeds 50MB limit')
      else if (err?.code === 'file-invalid-type') setError('Invalid file type')
      else setError(err?.message || 'Upload failed')
    },
  })

  const filteredUploads = uploads.filter((u) => u.name?.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-app-fg">Uploads</h1>
          <p className="mt-1 text-sm text-app-muted">Manage your uploaded files</p>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        {...getRootProps()}
        className={`relative rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer transition-all duration-300 backdrop-blur-xl ${
          isDragActive ? 'border-cyan-500/50 bg-cyan-500/5' : 'border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]'
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-3">
          <div className={`flex h-12 w-12 items-center justify-center rounded-xl transition-colors ${
            isDragActive ? 'bg-cyan-500/20 text-cyan-400' : 'bg-white/[0.04] text-app-muted'
          }`}>
            {isDragActive ? <Upload size={24} className="animate-bounce" /> : <Upload size={24} />}
          </div>
          <div>
            <p className="text-sm font-medium text-app-soft">{isDragActive ? 'Drop files here' : 'Drag & drop files, or click to browse'}</p>
            <p className="mt-1 text-xs text-app-muted">PDF, CSV, XLSX, JSON, TXT up to 50MB</p>
          </div>
        </div>
      </motion.div>

      {error && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 backdrop-blur-xl"
        >
          <AlertCircle size={14} className="text-red-400 shrink-0" />
          <p className="text-xs text-red-400">{error}</p>
          <button type="button" onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-300"><X size={12} /></button>
        </motion.div>
      )}

      <AnimatePresence>
        {queue.length > 0 && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-2">
            <p className="text-xs font-medium text-app-muted uppercase tracking-wider">Uploading...</p>
            {queue.map((entry) => (
              <UploadProgress key={entry.id} fileName={entry.name} progress={entry.progress} fileSize={entry.file?.size}
                status={entry.status === 'failed' ? 'failed' : entry.progress < 100 ? 'uploading' : 'processing'}
                onCancel={entry.status !== 'failed' ? () => cancelUpload(entry.id) : undefined}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between">
        <p className="text-sm text-app-muted">{filteredUploads.length} files</p>
        {uploads.length > 0 && <SearchInput value={search} onChange={setSearch} placeholder="Search files..." className="w-64" />}
      </div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-1"
      >
        <DataTable columns={columns} data={filteredUploads} loading={loading} error={error}
          emptyTitle="No files uploaded" emptyText="Upload your first file using the drop zone above." searchable={false}
        />
      </motion.div>
    </div>
  )
}

export default UploadsPage
