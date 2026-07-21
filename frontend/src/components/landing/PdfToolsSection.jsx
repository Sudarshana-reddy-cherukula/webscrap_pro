import { motion } from 'framer-motion'
import { FileText, Image, FileSearch, FileOutput, Scan, FileJson, ArrowRight, Check } from 'lucide-react'

const pdfTools = [
  {
    icon: FileText,
    title: 'Text Extraction',
    description: 'Extract clean text from any PDF while preserving structure, formatting, and encoding.',
    gradient: 'from-indigo-500 to-violet-600',
  },
  {
    icon: Image,
    title: 'Image Extraction',
    description: 'Extract embedded images from PDFs with original quality. Supports JPEG, PNG, TIFF formats.',
    gradient: 'from-violet-500 to-purple-600',
  },
  {
    icon: FileSearch,
    title: 'Metadata Extraction',
    description: 'Extract document metadata including author, creation date, page count, and custom fields.',
    gradient: 'from-cyan-500 to-blue-600',
  },
  {
    icon: FileOutput,
    title: 'Format Conversion',
    description: 'Convert PDFs to DOCX, HTML, Markdown, TXT, and more while maintaining original layout.',
    gradient: 'from-blue-500 to-indigo-600',
  },
  {
    icon: Scan,
    title: 'OCR Recognition',
    description: 'Optical character recognition for scanned documents. Supports 100+ languages.',
    gradient: 'from-purple-500 to-violet-600',
  },
  {
    icon: FileJson,
    title: 'Structured Export',
    description: 'Export extracted data as JSON, CSV, or XLSX for seamless integration with your stack.',
    gradient: 'from-indigo-500 to-blue-600',
  },
]

function PdfToolsSection() {
  return (
    <section id="pdf-tools" className="relative border-t border-app-line py-24">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.04),transparent_50%)]" />
      <div className="absolute inset-0 bg-grid opacity-30" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600">
            PDF Tools
          </p>
          <h2 className="mt-4 text-balance text-3xl sm:text-4xl font-bold text-app-fg">
            Enterprise PDF processing engine
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-app-muted text-sm sm:text-base">
            Extract, convert, and process PDFs with precision. Handles everything from simple text extraction to complex OCR.
          </p>
        </motion.div>

        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {pdfTools.map((tool, i) => (
            <motion.div
              key={tool.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: i * 0.05, duration: 0.5 }}
              className="group relative overflow-hidden rounded-2xl border border-app-line bg-app-elevated p-6 transition-all duration-500 hover:border-indigo-400/30 hover:shadow-2xl hover:shadow-indigo-500/5 hover:-translate-y-1"
            >
              <div className={`mb-4 inline-flex rounded-xl bg-gradient-to-br ${tool.gradient} p-2.5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <tool.icon size={20} className="text-white" />
              </div>
              <h3 className="text-lg font-semibold text-app-fg">{tool.title}</h3>
              <p className="mt-2 text-sm leading-6 text-app-muted">{tool.description}</p>
              <div className="mt-4 flex items-center gap-1 text-xs text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span>Learn more</span>
                <ArrowRight size={10} />
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-16 rounded-2xl border border-app-line bg-app-elevated p-8"
        >
          <div className="grid gap-8 md:grid-cols-2 items-center">
            <div>
              <h3 className="text-2xl font-bold text-app-fg">Process up to 1,000 PDFs per minute</h3>
              <p className="mt-3 text-sm text-app-muted">
                Our parallel processing engine handles massive PDF workloads with ease. Batch processing, automatic retries, and real-time status updates.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  'Batch processing with automatic queuing',
                  'Real-time progress tracking',
                  'Automatic retry on failure',
                  'Webhook notifications on completion',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-app-muted">
                    <Check size={16} className="mt-0.5 shrink-0 text-indigo-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-app-line bg-app-elevated p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-app-muted">Processing Queue</span>
                <span className="text-xs text-emerald-600">● 12 active</span>
              </div>
              <div className="space-y-3">
                {[
                  { name: 'annual_report_2025.pdf', progress: 100 },
                  { name: 'contract_draft_v3.pdf', progress: 67 },
                  { name: 'technical_specs.pdf', progress: 23 },
                ].map((file) => (
                  <div key={file.name}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-app-soft truncate mr-2">{file.name}</span>
                      <span className="text-app-muted shrink-0">{file.progress}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-indigo-100 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${file.progress}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default PdfToolsSection
