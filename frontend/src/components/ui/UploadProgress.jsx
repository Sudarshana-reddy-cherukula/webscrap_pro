import { motion } from 'framer-motion'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

function UploadProgress({ fileName, progress, status = 'uploading', fileSize, onCancel }) {
  const statusConfig = {
    uploading: { icon: Loader2, color: 'text-blue-400', bar: 'bg-blue-500' },
    processing: { icon: Loader2, color: 'text-purple-400', bar: 'bg-purple-500' },
    completed: { icon: CheckCircle2, color: 'text-emerald-400', bar: 'bg-emerald-500' },
    error: { icon: XCircle, color: 'text-red-400', bar: 'bg-red-500' },
  }

  const config = statusConfig[status] || statusConfig.uploading
  const StatusIcon = config.icon

  const formatSize = (bytes) => {
    if (!bytes) return ''
    const units = ['B', 'KB', 'MB', 'GB']
    let i = 0
    let size = bytes
    while (size >= 1024 && i < units.length - 1) {
      size /= 1024
      i++
    }
    return `${size.toFixed(1)} ${units[i]}`
  }

  return (
    <div className="rounded-xl border border-app-line bg-app-surface p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <StatusIcon size={16} className={`${config.color} shrink-0 ${status === 'uploading' || status === 'processing' ? 'animate-spin' : ''}`} />
          <div className="min-w-0 flex-1">
            <p className="text-sm text-app-soft truncate">{fileName}</p>
            {fileSize && (
              <p className="text-xs text-app-muted">{formatSize(fileSize)}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs text-app-muted">{Math.round(progress)}%</span>
          {status === 'uploading' && onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="text-app-muted hover:text-red-400 transition"
            >
              <XCircle size={14} />
            </button>
          )}
        </div>
      </div>

      <div className="h-1.5 rounded-full bg-app-line/50 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className={cn('h-full rounded-full', config.bar)}
        />
      </div>
    </div>
  )
}

export { UploadProgress }
