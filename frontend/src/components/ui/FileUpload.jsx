import { useState } from 'react'
import { Button } from './Button'
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
        className={`rounded-xl border-2 border-dashed p-8 text-center transition-all duration-200 ${
          isDragActive
            ? 'border-blue-500 bg-blue-500/10'
            : 'border-slate-600 bg-slate-800 hover:border-slate-500'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="mx-auto flex max-w-md flex-col items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-slate-700 text-3xl">{icon}</div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-white">Drop your file here</p>
            <p className="text-sm text-slate-400">Accepts PDF files only.</p>
          </div>
          <label className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 cursor-pointer">
            Choose File
            <input type="file" accept={accept} multiple={multiple} onChange={handleFileInput} className="sr-only" />
          </label>
        </div>
      </div>
      {selectedFile && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-600 bg-slate-800 px-4 py-3">
          <p className="text-sm text-white">✓ {selectedFile}</p>
          <Button variant="secondary" onClick={() => { setSelectedFile(null); onFilesSelected([]) }}>
            Clear
          </Button>
        </div>
      )}
    </Card>
  )
}

export default FileUpload
