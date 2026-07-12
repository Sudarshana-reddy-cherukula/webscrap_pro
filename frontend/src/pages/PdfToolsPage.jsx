import { useMemo, useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  FileText, FileDown, Search, Image, Type,
  Loader2, Shield, SplitSquareVertical,
  Combine, RotateCcw, Crop, PaintBucket, Edit3,
  Upload, FileUp, FileSearch, Lock, Sliders, NotebookText,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { pdfApi } from '@/api/pdfApi'
import { useNotification } from '@/hooks/useNotification'

const categories = [
  { value: 'all', label: 'All Tools', color: '#6366f1' },
  { value: 'convert', label: 'Convert & Extract', color: '#1473E6' },
  { value: 'edit', label: 'Edit', color: '#2E7D32' },
  { value: 'security', label: 'Security', color: '#E65100' },
  { value: 'pages', label: 'Pages & Organization', color: '#7C4DFF' },
]

const tools = [
  { value: 'extractText', label: 'Extract Text', icon: Type, desc: 'Extract all text content from PDF', category: 'convert', color: '#1473E6' },
  { value: 'extractMetadata', label: 'Extract Metadata', icon: FileSearch, desc: 'Get document properties and metadata', category: 'convert', color: '#1473E6' },
  { value: 'extractImages', label: 'Extract Images', icon: Image, desc: 'Extract embedded images from PDF', category: 'convert', color: '#1473E6' },
  { value: 'convertToTxt', label: 'Convert to TXT', icon: NotebookText, desc: 'Convert PDF to plain text format', category: 'convert', color: '#1473E6' },
  { value: 'convertToDocx', label: 'Convert to DOCX', icon: FileText, desc: 'Convert PDF to Word document', category: 'convert', color: '#1473E6' },
  { value: 'modifyText', label: 'Modify Text', icon: Edit3, desc: 'Replace, append, or remove text in PDF', category: 'edit', color: '#2E7D32' },
  { value: 'addWatermark', label: 'Add Watermark', icon: PaintBucket, desc: 'Add text watermark to PDF pages', category: 'edit', color: '#2E7D32' },
  { value: 'addSecurity', label: 'Add Security', icon: Shield, desc: 'Password-protect your PDF file', category: 'security', color: '#E65100' },
  { value: 'splitPdf', label: 'Split PDF', icon: SplitSquareVertical, desc: 'Split PDF into separate pages', category: 'pages', color: '#7C4DFF' },
  { value: 'mergePdf', label: 'Merge PDFs', icon: Combine, desc: 'Combine multiple PDFs into one', category: 'pages', color: '#7C4DFF' },
  { value: 'rotatePages', label: 'Rotate Pages', icon: RotateCcw, desc: 'Rotate PDF pages by 90/180/270 degrees', category: 'pages', color: '#7C4DFF' },
  { value: 'cropPages', label: 'Crop Pages', icon: Crop, desc: 'Crop margins from PDF pages', category: 'pages', color: '#7C4DFF' },
]

function ExtraOptions({ action, extraProps, setExtraProps }) {
  const inputClass = "mt-1 block w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
  const labelClass = "block text-sm font-medium text-gray-700"
  const selectClass = "mt-1 block w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"

  switch (action) {
    case 'modifyText':
      return (
        <div className="space-y-4 mt-4 pt-4 border-t border-gray-100">
          <div>
            <label className={labelClass}>Operation</label>
            <select value={extraProps.operation || 'replace'} onChange={(e) => setExtraProps({ ...extraProps, operation: e.target.value })} className={selectClass}>
              <option value="replace">Replace Text</option>
              <option value="append">Append Text</option>
              <option value="prepend">Prepend Text</option>
            </select>
          </div>
          {extraProps.operation === 'replace' && (
            <div>
              <label className={labelClass}>Search Text</label>
              <input type="text" value={extraProps.searchText || ''} onChange={(e) => setExtraProps({ ...extraProps, searchText: e.target.value })} className={inputClass} placeholder="Text to find" />
            </div>
          )}
          <div>
            <label className={labelClass}>{extraProps.operation === 'replace' ? 'Replace With' : 'Text Content'}</label>
            <input type="text" value={extraProps.replaceText || ''} onChange={(e) => setExtraProps({ ...extraProps, replaceText: e.target.value })} className={inputClass} placeholder="New text" />
          </div>
        </div>
      )
    case 'addWatermark':
      return (
        <div className="space-y-4 mt-4 pt-4 border-t border-gray-100">
          <div>
            <label className={labelClass}>Watermark Text</label>
            <input type="text" value={extraProps.watermarkText || ''} onChange={(e) => setExtraProps({ ...extraProps, watermarkText: e.target.value })} className={inputClass} placeholder="CONFIDENTIAL" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Opacity</label>
              <input type="number" min="0" max="1" step="0.1" value={extraProps.opacity || 0.3} onChange={(e) => setExtraProps({ ...extraProps, opacity: parseFloat(e.target.value) })} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Position</label>
              <select value={extraProps.position || 'center'} onChange={(e) => setExtraProps({ ...extraProps, position: e.target.value })} className={selectClass}>
                <option value="center">Center</option>
                <option value="tile">Tile</option>
                <option value="top-left">Top Left</option>
                <option value="top-right">Top Right</option>
                <option value="bottom-left">Bottom Left</option>
                <option value="bottom-right">Bottom Right</option>
              </select>
            </div>
          </div>
        </div>
      )
    case 'addSecurity':
      return (
        <div className="space-y-4 mt-4 pt-4 border-t border-gray-100">
          <div>
            <label className={labelClass}>Password</label>
            <input type="password" value={extraProps.password || ''} onChange={(e) => setExtraProps({ ...extraProps, password: e.target.value })} className={inputClass} placeholder="Enter password" />
          </div>
        </div>
      )
    case 'splitPdf':
      return (
        <div className="space-y-4 mt-4 pt-4 border-t border-gray-100">
          <div>
            <label className={labelClass}>Split Mode</label>
            <select value={extraProps.mode || 'all'} onChange={(e) => setExtraProps({ ...extraProps, mode: e.target.value })} className={selectClass}>
              <option value="all">All Pages</option>
              <option value="range">Page Range</option>
              <option value="pages">Specific Pages</option>
            </select>
          </div>
          {extraProps.mode !== 'all' && (
            <div>
              <label className={labelClass}>{extraProps.mode === 'range' ? 'Page Range (e.g. 1-5)' : 'Page Numbers (e.g. 1,3,5)'}</label>
              <input type="text" value={extraProps.pages || ''} onChange={(e) => setExtraProps({ ...extraProps, pages: e.target.value })} className={inputClass} />
            </div>
          )}
        </div>
      )
    case 'rotatePages':
      return (
        <div className="space-y-4 mt-4 pt-4 border-t border-gray-100">
          <div>
            <label className={labelClass}>Rotation</label>
            <select value={extraProps.rotation || 90} onChange={(e) => setExtraProps({ ...extraProps, rotation: parseInt(e.target.value) })} className={selectClass}>
              <option value={90}>90 Degrees</option>
              <option value={180}>180 Degrees</option>
              <option value={270}>270 Degrees</option>
            </select>
          </div>
        </div>
      )
    case 'cropPages':
      return (
        <div className="space-y-4 mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between rounded-lg bg-purple-50 border border-purple-100 px-4 py-2.5">
            <div className="flex items-center gap-3 text-sm text-purple-700">
              <Crop size={16} />
              <span>Drag the handles on the PDF preview to set crop margins</span>
            </div>
          </div>
          {extraProps.top !== undefined && (
            <div className="grid grid-cols-4 gap-2">
              {['top', 'right', 'bottom', 'left'].map((side) => (
                <div key={side} className="text-center">
                  <p className="text-xs font-medium text-gray-500 uppercase mb-0.5">{side}</p>
                  <p className="text-sm font-semibold text-gray-900">{extraProps[side]}%</p>
                </div>
              ))}
            </div>
          )}
          <div>
            <label className={labelClass}>Unit</label>
            <select value={extraProps.unit || 'pt'} onChange={(e) => setExtraProps({ ...extraProps, unit: e.target.value })} className={selectClass}>
              <option value="pt">Points</option>
              <option value="mm">Millimeters</option>
              <option value="in">Inches</option>
            </select>
          </div>
        </div>
      )
    default:
      return null
  }
}

function CropOverlay({ extraProps, setExtraProps, pdfPreviewUrl }) {
  const containerRef = useRef(null)
  const [crop, setCrop] = useState({ x: 10, y: 10, width: 80, height: 80 })
  const [interaction, setInteraction] = useState(null)
  const [startPos, setStartPos] = useState(null)
  const [startCrop, setStartCrop] = useState(null)

  const syncMargins = useCallback((c) => {
    setExtraProps((prev) => ({
      ...prev,
      top: Math.round(c.y),
      left: Math.round(c.x),
      right: Math.round(100 - c.x - c.width),
      bottom: Math.round(100 - c.y - c.height),
      unit: prev.unit || 'pt',
    }))
  }, [setExtraProps])

  useEffect(() => {
    if (extraProps?.top === undefined) syncMargins(crop)
  }, [crop, syncMargins, extraProps?.top])

  const handleMouseDown = (e, type) => {
    e.preventDefault(); e.stopPropagation()
    setInteraction(type)
    setStartPos({ x: e.clientX, y: e.clientY })
    setStartCrop({ ...crop })
  }

  useEffect(() => {
    if (!interaction) return
    const handleMouseMove = (e) => {
      const rect = containerRef.current?.getBoundingClientRect()
      if (!rect) return
      const dx = ((e.clientX - startPos.x) / rect.width) * 100
      const dy = ((e.clientY - startPos.y) / rect.height) * 100
      const min = 5
      let c = { ...startCrop }

      if (interaction === 'move') {
        c.x = Math.max(0, Math.min(100 - startCrop.width, startCrop.x + dx))
        c.y = Math.max(0, Math.min(100 - startCrop.height, startCrop.y + dy))
      } else {
        if (interaction.includes('left')) {
          c.x = Math.max(0, Math.min(startCrop.x + startCrop.width - min, startCrop.x + dx))
          c.width = startCrop.x + startCrop.width - c.x
        }
        if (interaction.includes('right')) {
          c.width = Math.max(min, Math.min(100 - c.x, startCrop.width + dx))
        }
        if (interaction.includes('top')) {
          c.y = Math.max(0, Math.min(startCrop.y + startCrop.height - min, startCrop.y + dy))
          c.height = startCrop.y + startCrop.height - c.y
        }
        if (interaction.includes('bottom')) {
          c.height = Math.max(min, Math.min(100 - c.y, startCrop.height + dy))
        }
      }
      setCrop(c)
      syncMargins(c)
    }
    const handleMouseUp = () => {
      setInteraction(null)
      setStartPos(null)
    }
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [interaction, startPos, startCrop, syncMargins])

  const handleClasses = 'absolute z-20 w-3 h-3 border-2 border-white bg-purple-600 shadow-sm rounded-sm'

  return (
    <div ref={containerRef} className="relative rounded-lg border border-gray-200 bg-white overflow-hidden select-none">
      <embed src={pdfPreviewUrl} type="application/pdf" className="w-full h-[500px] pointer-events-none" />
      <div className="absolute inset-0 z-10">
        <div className="absolute inset-0 bg-black/40" style={{
          clipPath: `polygon(
            0% 0%, 100% 0%, 100% 100%, 0% 100%,
            0% 0%, ${crop.x}% 0%, ${crop.x}% ${crop.y}%, ${crop.x + crop.width}% ${crop.y}%,
            ${crop.x + crop.width}% ${crop.y + crop.height}%, ${crop.x}% ${crop.y + crop.height}%,
            ${crop.x}% ${crop.y}%, 0% ${crop.y}%, 0% 0%
          )`
        }} />
        <div className="absolute z-10 border-2 border-purple-500 cursor-move"
          style={{ left: `${crop.x}%`, top: `${crop.y}%`, width: `${crop.width}%`, height: `${crop.height}%` }}
          onMouseDown={(e) => handleMouseDown(e, 'move')}
        >
          <div className={handleClasses + ' -top-1.5 -left-1.5 cursor-nw-resize'} onMouseDown={(e) => { e.stopPropagation(); handleMouseDown(e, 'top-left') }} />
          <div className={handleClasses + ' -top-1.5 left-1/2 -translate-x-1/2 cursor-n-resize'} onMouseDown={(e) => { e.stopPropagation(); handleMouseDown(e, 'top') }} />
          <div className={handleClasses + ' -top-1.5 -right-1.5 cursor-ne-resize'} onMouseDown={(e) => { e.stopPropagation(); handleMouseDown(e, 'top-right') }} />
          <div className={handleClasses + ' top-1/2 -translate-y-1/2 -left-1.5 cursor-w-resize'} onMouseDown={(e) => { e.stopPropagation(); handleMouseDown(e, 'left') }} />
          <div className={handleClasses + ' top-1/2 -translate-y-1/2 -right-1.5 cursor-e-resize'} onMouseDown={(e) => { e.stopPropagation(); handleMouseDown(e, 'right') }} />
          <div className={handleClasses + ' -bottom-1.5 -left-1.5 cursor-sw-resize'} onMouseDown={(e) => { e.stopPropagation(); handleMouseDown(e, 'bottom-left') }} />
          <div className={handleClasses + ' -bottom-1.5 left-1/2 -translate-x-1/2 cursor-s-resize'} onMouseDown={(e) => { e.stopPropagation(); handleMouseDown(e, 'bottom') }} />
          <div className={handleClasses + ' -bottom-1.5 -right-1.5 cursor-se-resize'} onMouseDown={(e) => { e.stopPropagation(); handleMouseDown(e, 'bottom-right') }} />
        </div>
      </div>
    </div>
  )
}

function PdfToolsPage() {
  const [selectedFile, setSelectedFile] = useState(null)
  const [mergeFiles, setMergeFiles] = useState([])
  const [action, setAction] = useState(null)
  const [extraProps, setExtraProps] = useState({})
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [category, setCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [dragActive, setDragActive] = useState(false)
  const { showNotification } = useNotification()

  const pdfPreviewUrl = useMemo(() => {
    if (selectedFile && action !== 'mergePdf') {
      return URL.createObjectURL(selectedFile)
    }
    return null
  }, [selectedFile, action])

  useEffect(() => {
    return () => {
      if (pdfPreviewUrl) URL.revokeObjectURL(pdfPreviewUrl)
    }
  }, [pdfPreviewUrl])

  const filteredTools = useMemo(() => {
    return tools.filter((t) => {
      if (category !== 'all' && t.category !== category) return false
      if (searchQuery && !t.label.toLowerCase().includes(searchQuery.toLowerCase()) && !t.desc.toLowerCase().includes(searchQuery.toLowerCase())) return false
      return true
    })
  }, [category, searchQuery])

  const selectedTool = tools.find((t) => t.value === action)

  const previewText = useMemo(() => {
    if (!result) return null
    if (typeof result === 'string') return result
    return JSON.stringify(result, null, 2)
  }, [result])

  function getResponseData(resp) { return resp.data?.data || resp.data }
  function triggerDownloadBlob(jobId, filename) {
    return pdfApi.downloadProcessedFile(jobId).then((blobRes) => {
      const url = window.URL.createObjectURL(blobRes.data)
      const a = document.createElement('a')
      a.href = url; a.download = filename
      a.click(); window.URL.revokeObjectURL(url)
    })
  }

  const handleRun = async () => {
    if (action === 'mergePdf') {
      if (mergeFiles.length < 2) { showNotification('Please upload at least 2 PDF files to merge', 'warning'); return }
    } else if (!selectedFile) { showNotification('Please upload a PDF first', 'warning'); return }
    setLoading(true)
    setResult(null)
    try {
      let response, d
      switch (action) {
        case 'extractText':
          response = await pdfApi.extractText(selectedFile)
          d = getResponseData(response)
          setResult(d?.results?.text || d?.text || 'No text extracted')
          break
        case 'extractMetadata':
          response = await pdfApi.extractMetadata(selectedFile)
          d = getResponseData(response)
          setResult(d?.results || d)
          break
        case 'extractImages':
          response = await pdfApi.extractImages(selectedFile)
          d = getResponseData(response)
          setResult(d?.results || d)
          break
        case 'convertToTxt': {
          response = await pdfApi.convertToTxt(selectedFile)
          d = getResponseData(response)
          const j1 = d?.jobId; if (!j1) throw new Error('No job ID returned')
          await triggerDownloadBlob(j1, `${selectedFile.name.replace(/\.pdf$/i, '')}.txt`)
          setResult('Download ready.')
          break
        }
        case 'convertToDocx': {
          response = await pdfApi.convertToDocx(selectedFile)
          d = getResponseData(response)
          const j2 = d?.jobId; if (!j2) throw new Error('No job ID returned')
          await triggerDownloadBlob(j2, `${selectedFile.name.replace(/\.pdf$/i, '')}.docx`)
          setResult('Download ready.')
          break
        }
        case 'modifyText': case 'addWatermark': case 'addSecurity': case 'splitPdf': case 'mergePdf': case 'rotatePages': case 'cropPages': {
          const apiFn = {
            modifyText: () => pdfApi.modifyText(selectedFile, extraProps),
            addWatermark: () => pdfApi.addWatermark(selectedFile, extraProps),
            addSecurity: () => pdfApi.addSecurity(selectedFile, extraProps),
            splitPdf: () => pdfApi.splitPdf(selectedFile, extraProps),
            mergePdf: () => pdfApi.mergePdf(mergeFiles),
            rotatePages: () => pdfApi.rotatePages(selectedFile, extraProps),
            cropPages: () => pdfApi.cropPages(selectedFile, extraProps),
          }[action]
          response = await apiFn()
          d = getResponseData(response)
          const of = d?.results?.outputFile || d?.outputFile
          if (of?.path && d?.jobId) {
            const ext = of.filename.includes('.') ? of.filename.split('.').pop() : 'pdf'
            await triggerDownloadBlob(d.jobId, `output_${Date.now()}.${ext}`)
            setResult({ ...d?.results, downloaded: true })
          } else { setResult(d?.results || d) }
          break
        }
      }
      showNotification(`${tools.find((t) => t.value === action)?.label || 'Tool'} completed successfully`)
    } catch (err) { showNotification(err.message || 'PDF tool failed', 'error') } finally { setLoading(false) }
  }

  const handleFileDrop = (e) => {
    e.preventDefault()
    setDragActive(false)
    const files = e.dataTransfer.files
    if (files?.length) handleFiles(files)
  }

  const handleFileInput = (e) => {
    if (e.target.files?.length) handleFiles(e.target.files)
  }

  const handleFiles = (files) => {
    const fileArray = Array.from(files).filter((f) => f.type === 'application/pdf' || f.name.endsWith('.pdf'))
    if (!fileArray.length) { showNotification('Please select PDF files only', 'warning'); return }
    if (action === 'mergePdf') {
      setMergeFiles((prev) => [...prev, ...fileArray])
    } else {
      setSelectedFile(fileArray[0])
    }
  }

  const removeFile = () => {
    setSelectedFile(null)
    setMergeFiles([])
    setResult(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">PDF Tools</h1>
          <p className="mt-1 text-sm text-gray-500">Process, extract, convert, secure, and manipulate PDF documents</p>
        </div>
        {selectedFile && (
          <div className="hidden sm:flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm">
            <FileUp size={14} className="text-blue-500" />
            <span className="text-sm text-gray-700 max-w-[160px] truncate">{selectedFile.name}</span>
            <button onClick={removeFile} className="ml-1 text-gray-400 hover:text-gray-600 transition-colors">&times;</button>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-4 py-3">
          <div className="flex flex-wrap gap-1">
            {categories.map((cat) => (
              <button key={cat.value} onClick={() => setCategory(cat.value)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  category === cat.value
                    ? 'bg-blue-50 text-blue-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-56">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tools..."
              className="w-full rounded-lg border border-gray-200 bg-gray-50 py-1.5 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all"
            />
          </div>
        </div>

        <div className="p-4">
          {filteredTools.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileSearch size={36} className="text-gray-300 mb-3" />
              <p className="text-sm text-gray-500">No tools found matching your search.</p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredTools.map((tool, i) => {
                const ToolIcon = tool.icon
                const isActive = action === tool.value
                return (
                  <motion.button key={tool.value} type="button" onClick={() => { setAction(tool.value); setExtraProps({}) }}
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                    className={`group relative overflow-hidden rounded-xl border p-4 text-left transition-all duration-200 ${
                      isActive
                        ? 'border-blue-200 bg-blue-50/50 shadow-sm'
                        : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-md hover:-translate-y-0.5'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                        style={{ backgroundColor: `${tool.color}15`, color: tool.color }}
                      >
                        <ToolIcon size={18} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm font-semibold ${isActive ? 'text-blue-700' : 'text-gray-900'}`}>{tool.label}</p>
                        <p className="mt-0.5 text-xs text-gray-500 leading-snug">{tool.desc}</p>
                      </div>
                      {isActive && (
                        <div className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </motion.button>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {selectedTool ? (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between gap-4 border-b border-gray-100 px-5 py-4 bg-gray-50/50">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg"
                style={{ backgroundColor: `${selectedTool.color}15`, color: selectedTool.color }}
              >
                <selectedTool.icon size={18} />
              </div>
              <div>
                <h2 className="text-base font-semibold text-gray-900">{selectedTool.label}</h2>
                <p className="text-xs text-gray-500">{selectedTool.desc}</p>
              </div>
            </div>
          </div>

          <div className="p-5">
            <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
              <div className="space-y-5">
                <div onDragOver={(e) => { e.preventDefault(); setDragActive(true) }} onDragLeave={() => setDragActive(false)} onDrop={handleFileDrop}
                  className={`relative rounded-xl border-2 border-dashed p-8 text-center transition-all duration-200 ${
                    dragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-200 bg-gray-50/50 hover:border-blue-300 hover:bg-blue-50/30'
                  }`}
                >
                  <div className="mx-auto flex max-w-xs flex-col items-center gap-3">
                    <div className={`flex h-14 w-14 items-center justify-center rounded-xl transition-colors ${
                      dragActive ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
                    }`}>
                      <Upload size={24} />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-700">
                        {selectedFile ? selectedFile.name : action === 'mergePdf' ? 'Drop PDF files here' : 'Drop your PDF here'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {selectedFile
                          ? `${(selectedFile.size / 1024 / 1024).toFixed(1)} MB`
                          : 'or click to browse files'
                        }
                      </p>
                    </div>
                    {!selectedFile && (
                      <label className="cursor-pointer inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition-colors">
                        <FileUp size={14} />
                        {action === 'mergePdf' ? 'Choose Files' : 'Choose PDF'}
                        <input type="file" accept=".pdf" multiple={action === 'mergePdf'} onChange={handleFileInput} className="sr-only" />
                      </label>
                    )}
                    {mergeFiles.length > 0 && action === 'mergePdf' && (
                      <div className="w-full space-y-1.5 mt-1">
                        {mergeFiles.map((f, i) => (
                          <div key={i} className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-700">
                            <FileText size={12} className="text-blue-500 shrink-0" />
                            <span className="truncate flex-1">{f.name}</span>
                            <span className="text-gray-400 shrink-0">{(f.size / 1024).toFixed(0)} KB</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {selectedFile && action !== 'mergePdf' && (
                  <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
                    <FileText size={16} className="text-blue-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{selectedFile.name}</p>
                      <p className="text-xs text-gray-500">{(selectedFile.size / 1024 / 1024).toFixed(1)} MB</p>
                    </div>
                    <button onClick={removeFile} className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors">Remove</button>
                  </div>
                )}

                <ExtraOptions action={action} extraProps={extraProps} setExtraProps={setExtraProps} />

                <Button onClick={handleRun} disabled={loading}
                  className="w-full bg-blue-600 text-white shadow-sm hover:bg-blue-700 transition-all duration-200"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2"><Loader2 size={16} className="animate-spin" /> Processing...</span>
                  ) : (
                    <span className="flex items-center justify-center gap-2"><FileDown size={16} /> Execute Tool</span>
                  )}
                </Button>
              </div>

              <div className="space-y-4">
                <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4">
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3">
                    <Sliders size={14} className="text-gray-400" />
                    {previewText ? 'Preview Output' : 'PDF Preview'}
                  </h3>
                  {previewText ? (
                    <pre className="max-h-[400px] overflow-y-auto rounded-lg border border-gray-200 bg-white p-4 text-xs leading-5 text-gray-700 font-mono scrollbar-hide">
                      {previewText}
                    </pre>
                  ) : pdfPreviewUrl && action === 'cropPages' ? (
                    <CropOverlay extraProps={extraProps} setExtraProps={setExtraProps} pdfPreviewUrl={pdfPreviewUrl} />
                  ) : pdfPreviewUrl ? (
                    <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
                      <embed src={pdfPreviewUrl} type="application/pdf" className="w-full h-[500px]" />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                      <FileSearch size={28} className="text-gray-200 mb-2" />
                      <p className="text-xs text-gray-400">Upload a PDF to see a preview here.</p>
                    </div>
                  )}
                </div>

                <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4">
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3">
                    <Lock size={14} className="text-gray-400" />
                    Pro Tips
                  </h3>
                  <ul className="space-y-2.5">
                    <li className="flex gap-2.5 text-xs leading-5 text-gray-600">
                      <span className="mt-1.5 flex h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400" />
                      For best results, use searchable PDFs (not scanned images)
                    </li>
                    <li className="flex gap-2.5 text-xs leading-5 text-gray-600">
                      <span className="mt-1.5 flex h-1.5 w-1.5 shrink-0 rounded-full bg-green-400" />
                      Convert to TXT or DOCX with a single click
                    </li>
                    <li className="flex gap-2.5 text-xs leading-5 text-gray-600">
                      <span className="mt-1.5 flex h-1.5 w-1.5 shrink-0 rounded-full bg-purple-400" />
                      Split, merge, rotate, and crop PDF pages
                    </li>
                    <li className="flex gap-2.5 text-xs leading-5 text-gray-600">
                      <span className="mt-1.5 flex h-1.5 w-1.5 shrink-0 rounded-full bg-orange-400" />
                      Add watermarks or password protection for security
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center rounded-xl border border-gray-100 bg-white shadow-sm py-16 text-center"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-50 mb-4">
            <FileText size={28} className="text-gray-300" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Select a Tool to Start</h3>
          <p className="mt-1 text-sm text-gray-500 max-w-md">Choose a PDF tool from the grid above to begin processing your documents.</p>
        </motion.div>
      )}
    </div>
  )
}

export default PdfToolsPage
