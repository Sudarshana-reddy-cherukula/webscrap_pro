import { useState } from 'react'
import Button from './Button'
import Card from './Card'

function FileUpload({
  accept = '.pdf',
  multiple = false,
  onFilesSelected = () => {},
  title = 'Upload File',
  description = 'Click to upload or drag and drop',
  icon = '📄',
}) {
  const [isDragActive, setIsDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)

  const handleDrag = (event) => {
    event.preventDefault()
    event.stopPropagation()
    if (event.type === 'dragenter' || event.type === 'dragover') {
      setIsDragActive(true)
    } else {
      setIsDragActive(false)
    }
  }

  const handleDrop = (event) => {
    event.preventDefault()
    event.stopPropagation()
    setIsDragActive(false)
    const files = event.dataTransfer.files
    if (files) {
      handleFiles(files)
    }
  }

  const handleFileInput = (event) => {
    const files = event.target.files
    if (files) {
      handleFiles(files)
    }
  }

  const handleFiles = (files) => {
    const fileArray = multiple ? Array.from(files) : [files[0]]
    setSelectedFile(fileArray.length === 1 ? fileArray[0].name : `${fileArray.length} files selected`)
    onFilesSelected(fileArray)
  }

  return (
    <Card className="space-y-5">
      <div>
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <p className="mt-2 text-sm text-slate-400">{description}</p>
      </div>
      <div
        className={`rounded-3xl border border-slate-700/90 bg-slate-900/70 p-8 text-center transition duration-300 ${
          isDragActive ? 'border-indigo-500/80 bg-slate-900/90 shadow-[0_0_0_1px_rgba(99,102,241,0.5)]' : 'hover:border-slate-500/80 hover:bg-slate-900/80'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="mx-auto flex max-w-md flex-col items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-800 text-3xl">{icon}</div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-white">Drop your file here</p>
            <p className="text-sm text-slate-400">Accepts PDF files only.</p>
          </div>
          <label className="rounded-full bg-indigo-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-indigo-400">
            Choose File
            <input type="file" accept={accept} multiple={multiple} onChange={handleFileInput} className="sr-only" />
          </label>
        </div>
      </div>
      {selectedFile && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-slate-700/90 bg-slate-900/70 px-4 py-3">
          <p className="text-sm text-slate-200">✓ {selectedFile}</p>
          <Button variant="secondary" onClick={() => { setSelectedFile(null); onFilesSelected([]) }}>
            Clear
          </Button>
        </div>
      )}
    </Card>
  )
}

export default FileUpload
