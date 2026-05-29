import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  FileText, FileDown, Search, Image, Type,
  Loader2, Shield, SplitSquareVertical,
  Combine, RotateCcw, Crop, PaintBucket, Edit3,
  Lightbulb, Code, Upload,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import FileUpload from '@/components/ui/FileUpload'
import { pdfApi } from '@/api/pdfApi'
import { useNotification } from '@/hooks/useNotification'

const tools = [
  { value: 'extractText', label: 'Extract Text', icon: Type, desc: 'Extract all text content from PDF' },
  { value: 'extractMetadata', label: 'Extract Metadata', icon: Search, desc: 'Get document properties and metadata' },
  { value: 'extractImages', label: 'Extract Images', icon: Image, desc: 'Extract embedded images from PDF' },
  { value: 'convertToTxt', label: 'Convert to TXT', icon: FileDown, desc: 'Convert PDF to plain text format' },
  { value: 'convertToDocx', label: 'Convert to DOCX', icon: FileText, desc: 'Convert PDF to Word document' },
  { value: 'modifyText', label: 'Modify Text', icon: Edit3, desc: 'Replace, append, or remove text in PDF' },
  { value: 'addWatermark', label: 'Add Watermark', icon: PaintBucket, desc: 'Add text watermark to PDF pages' },
  { value: 'addSecurity', label: 'Add Security', icon: Shield, desc: 'Password-protect your PDF file' },
  { value: 'splitPdf', label: 'Split PDF', icon: SplitSquareVertical, desc: 'Split PDF into separate pages' },
  { value: 'mergePdf', label: 'Merge PDFs', icon: Combine, desc: 'Combine multiple PDFs into one' },
  { value: 'rotatePages', label: 'Rotate Pages', icon: RotateCcw, desc: 'Rotate PDF pages by 90/180/270 degrees' },
  { value: 'cropPages', label: 'Crop Pages', icon: Crop, desc: 'Crop margins from PDF pages' },
]

const tooltips = [
  'For best results, use searchable PDFs (not scanned images)',
  'Convert to TXT or DOCX with a single click',
  'Split, merge, rotate, and crop PDF pages',
  'Add watermarks or password protection for security',
]

const cardClass = "rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl"

function ExtraOptions({ action, extraProps, setExtraProps }) {
  const inputClass = "mt-1 block w-full rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-xs text-app-fg transition focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
  const labelClass = "block text-xs font-medium text-app-muted"
  const selectClass = "mt-1 block w-full rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-xs text-app-fg transition focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20"

  switch (action) {
    case 'modifyText':
      return (
        <div className="space-y-3 mt-5 pt-5 border-t border-white/5">
          <div>
            <label className={labelClass}>Operation</label>
            <select value={extraProps.operation || 'replace'} onChange={(e) => setExtraProps({ ...extraProps, operation: e.target.value })} className={selectClass}>
              <option value="replace" className="bg-[#050816]">Replace Text</option>
              <option value="append" className="bg-[#050816]">Append Text</option>
              <option value="prepend" className="bg-[#050816]">Prepend Text</option>
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
        <div className="space-y-3 mt-5 pt-5 border-t border-white/5">
          <div>
            <label className={labelClass}>Watermark Text</label>
            <input type="text" value={extraProps.watermarkText || ''} onChange={(e) => setExtraProps({ ...extraProps, watermarkText: e.target.value })} className={inputClass} placeholder="CONFIDENTIAL" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Opacity</label>
              <input type="number" min="0" max="1" step="0.1" value={extraProps.opacity || 0.3} onChange={(e) => setExtraProps({ ...extraProps, opacity: parseFloat(e.target.value) })} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Position</label>
              <select value={extraProps.position || 'center'} onChange={(e) => setExtraProps({ ...extraProps, position: e.target.value })} className={selectClass}>
                <option value="center" className="bg-[#050816]">Center</option>
                <option value="tile" className="bg-[#050816]">Tile</option>
                <option value="top-left" className="bg-[#050816]">Top Left</option>
                <option value="top-right" className="bg-[#050816]">Top Right</option>
                <option value="bottom-left" className="bg-[#050816]">Bottom Left</option>
                <option value="bottom-right" className="bg-[#050816]">Bottom Right</option>
              </select>
            </div>
          </div>
        </div>
      )
    case 'addSecurity':
      return (
        <div className="space-y-3 mt-5 pt-5 border-t border-white/5">
          <div>
            <label className={labelClass}>Password</label>
            <input type="password" value={extraProps.password || ''} onChange={(e) => setExtraProps({ ...extraProps, password: e.target.value })} className={inputClass} placeholder="Enter password" />
          </div>
        </div>
      )
    case 'splitPdf':
      return (
        <div className="space-y-3 mt-5 pt-5 border-t border-white/5">
          <div>
            <label className={labelClass}>Split Mode</label>
            <select value={extraProps.mode || 'all'} onChange={(e) => setExtraProps({ ...extraProps, mode: e.target.value })} className={selectClass}>
              <option value="all" className="bg-[#050816]">All Pages</option>
              <option value="range" className="bg-[#050816]">Page Range</option>
              <option value="pages" className="bg-[#050816]">Specific Pages</option>
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
        <div className="space-y-3 mt-5 pt-5 border-t border-white/5">
          <div>
            <label className={labelClass}>Rotation</label>
            <select value={extraProps.rotation || 90} onChange={(e) => setExtraProps({ ...extraProps, rotation: parseInt(e.target.value) })} className={selectClass}>
              <option value={90} className="bg-[#050816]">90 Degrees</option>
              <option value={180} className="bg-[#050816]">180 Degrees</option>
              <option value={270} className="bg-[#050816]">270 Degrees</option>
            </select>
          </div>
        </div>
      )
    case 'cropPages':
      return (
        <div className="space-y-3 mt-5 pt-5 border-t border-white/5">
          <div className="grid grid-cols-2 gap-3">
            <div><label className={labelClass}>Top</label><input type="number" min="0" value={extraProps.top || 0} onChange={(e) => setExtraProps({ ...extraProps, top: parseFloat(e.target.value) })} className={inputClass} /></div>
            <div><label className={labelClass}>Right</label><input type="number" min="0" value={extraProps.right || 0} onChange={(e) => setExtraProps({ ...extraProps, right: parseFloat(e.target.value) })} className={inputClass} /></div>
            <div><label className={labelClass}>Bottom</label><input type="number" min="0" value={extraProps.bottom || 0} onChange={(e) => setExtraProps({ ...extraProps, bottom: parseFloat(e.target.value) })} className={inputClass} /></div>
            <div><label className={labelClass}>Left</label><input type="number" min="0" value={extraProps.left || 0} onChange={(e) => setExtraProps({ ...extraProps, left: parseFloat(e.target.value) })} className={inputClass} /></div>
          </div>
          <div>
            <label className={labelClass}>Unit</label>
            <select value={extraProps.unit || 'pt'} onChange={(e) => setExtraProps({ ...extraProps, unit: e.target.value })} className={selectClass}>
              <option value="pt" className="bg-[#050816]">Points</option>
              <option value="mm" className="bg-[#050816]">Millimeters</option>
              <option value="in" className="bg-[#050816]">Inches</option>
            </select>
          </div>
        </div>
      )
    default:
      return null
  }
}

function PdfToolsPage() {
  const [selectedFile, setSelectedFile] = useState(null)
  const [mergeFiles, setMergeFiles] = useState([])
  const [action, setAction] = useState('extractText')
  const [extraProps, setExtraProps] = useState({})
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const { showNotification } = useNotification()

  const previewText = useMemo(() => {
    if (!result) return 'Upload a PDF and choose a tool to preview the output here.'
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

  const ActiveIcon = tools.find((t) => t.value === action)?.icon || FileText

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-app-fg">PDF Tools</h1>
        <p className="mt-1 text-sm text-app-muted">Process, extract, convert, secure, and manipulate PDF documents</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className={`${cardClass} p-6 space-y-5`}>
            <div className="flex items-center gap-3 pb-2 border-b border-white/5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg shadow-purple-500/20">
                <Upload size={18} className="text-white" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-app-fg">{action === 'mergePdf' ? 'Upload PDFs to Merge' : 'Upload PDF'}</h2>
                <p className="text-xs text-app-muted">{action === 'mergePdf' ? 'Select multiple PDF files' : 'Drag & drop or click to select'}</p>
              </div>
            </div>
            {action === 'mergePdf' ? (
              <FileUpload accept=".pdf" multiple onFilesSelected={(files) => setMergeFiles(files)} title="Upload PDFs to Merge" description="Drag & drop or click to select multiple PDF files" icon="📄" />
            ) : (
              <FileUpload accept=".pdf" onFilesSelected={(files) => setSelectedFile(files[0] || null)} title="Upload PDF" description="Drag & drop or click to select a PDF file" icon="📄" />
            )}
          </div>

          <div className={`${cardClass} p-6 space-y-5`}>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg shadow-purple-500/20">
                <ActiveIcon size={18} className="text-white" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-app-fg">Choose Tool</h2>
                <p className="text-xs text-app-muted">Select a PDF processing tool</p>
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              {tools.map((tool, i) => {
                const ToolIcon = tool.icon
                const isActive = action === tool.value
                return (
                  <motion.button key={tool.value} type="button" onClick={() => { setAction(tool.value); setExtraProps({}) }}
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.025 }}
                    className={`group flex items-start gap-3 rounded-xl border p-3 text-left transition-all duration-200 ${
                      isActive
                        ? 'border-purple-500/40 bg-purple-500/10 shadow-lg shadow-purple-500/5'
                        : 'border-white/5 bg-white/[0.02] hover:border-purple-500/20 hover:bg-purple-500/[0.03] hover:shadow-sm'
                    }`}
                  >
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all duration-200 ${
                      isActive ? 'bg-purple-500/25 text-purple-400 shadow-sm shadow-purple-500/10' : 'bg-white/[0.04] text-app-muted group-hover:bg-purple-500/10 group-hover:text-purple-400'
                    }`}>
                      <ToolIcon size={14} />
                    </div>
                    <div className="min-w-0">
                      <p className={`text-sm font-medium transition-colors ${isActive ? 'text-purple-300' : 'text-app-soft group-hover:text-purple-200'}`}>{tool.label}</p>
                      <p className="text-[10px] leading-tight text-app-muted truncate">{tool.desc}</p>
                    </div>
                  </motion.button>
                )
              })}
            </div>

            <ExtraOptions action={action} extraProps={extraProps} setExtraProps={setExtraProps} />

            <Button onClick={handleRun} disabled={loading}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 transition-all duration-300"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2"><Loader2 size={16} className="animate-spin" /> Processing...</span>
              ) : (
                <span className="flex items-center justify-center gap-2"><FileDown size={16} /> Execute Tool</span>
              )}
            </Button>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-6">
          <div className={`${cardClass} p-6 space-y-4`}>
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600">
                <Lightbulb size={12} className="text-white" />
              </div>
              <h2 className="text-sm font-semibold text-app-fg">Pro Tips</h2>
            </div>
            <ul className="space-y-3">
              {tooltips.map((tip, i) => (
                <li key={i} className="flex gap-3 text-xs leading-5 text-app-muted">
                  <span className="mt-1.5 flex h-1.5 w-1.5 shrink-0 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          <div className={`${cardClass} p-6 space-y-4`}>
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600">
                <Code size={12} className="text-white" />
              </div>
              <h2 className="text-sm font-semibold text-app-fg">Preview Output</h2>
            </div>
            <pre className="max-h-[320px] overflow-y-auto rounded-xl border border-white/10 bg-black/40 p-4 text-xs leading-5 text-app-soft scrollbar-hide">
              {previewText}
            </pre>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default PdfToolsPage
