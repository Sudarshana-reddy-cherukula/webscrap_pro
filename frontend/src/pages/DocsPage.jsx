import { useState } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, Code, Terminal, Globe, FileText, Download, BarChart3, Zap, ChevronRight, Search, Copy, Check } from 'lucide-react'

const sections = [
  {
    id: 'getting-started',
    icon: BookOpen,
    title: 'Getting Started',
    content: (
      <div className="space-y-6">
        <p className="text-app-muted leading-relaxed">WebScrap Pro provides a powerful API for web scraping and PDF processing. This guide will help you get started quickly.</p>
        <div className="rounded-xl border border-app-line bg-app-surface p-5">
          <h4 className="text-sm font-medium text-app-fg mb-2">Authentication</h4>
          <p className="text-xs text-app-muted mb-3">All API requests require an API key in the Authorization header.</p>
          <pre className="text-xs text-app-soft font-mono bg-black/40 rounded-lg p-4 overflow-x-auto"><span className="text-app-muted">#</span> Using your API key<br />curl -H <span className="text-green-400">"Authorization: Bearer YOUR_API_KEY"</span> \<br />  https://api.webscrappro.io/v1/scrape</pre>
        </div>
      </div>
    ),
  },
  {
    id: 'scraping',
    icon: Globe,
    title: 'Web Scraping API',
    content: (
      <div className="space-y-6">
        <p className="text-app-muted leading-relaxed">Start a scraping job by providing target URLs and configuration options.</p>
        <div className="rounded-xl border border-app-line bg-app-surface p-5">
          <h4 className="text-sm font-medium text-app-fg mb-2">POST /scrape/start</h4>
          <pre className="text-xs text-app-soft font-mono bg-black/40 rounded-lg p-4 overflow-x-auto">{`{
  "urls": ["https://example.com/products"],
  "selectors": {
    "title": "h2.product-title",
    "price": ".price-tag",
    "image": "img.product-img @src"
  },
  "pagination": ".next-page @href",
  "max_pages": 100,
  "proxy": "auto"
}`}</pre>
        </div>
        <div className="rounded-xl border border-app-line bg-app-surface p-5">
          <h4 className="text-sm font-medium text-app-fg mb-2">Response</h4>
          <pre className="text-xs text-app-soft font-mono bg-black/40 rounded-lg p-4 overflow-x-auto">{`{
  "job_id": "job_abc123",
  "status": "queued",
  "url_count": 1,
  "estimated_pages": 100
}`}</pre>
        </div>
      </div>
    ),
  },
  {
    id: 'pdf',
    icon: FileText,
    title: 'PDF Processing API',
    content: (
      <div className="space-y-6">
        <p className="text-app-muted leading-relaxed">Extract text, images, and metadata from PDF documents.</p>
        <div className="rounded-xl border border-app-line bg-app-surface p-5">
          <h4 className="text-sm font-medium text-app-fg mb-2">POST /pdf/extract</h4>
          <pre className="text-xs text-app-soft font-mono bg-black/40 rounded-lg p-4 overflow-x-auto"><span className="text-app-muted"># Upload PDF file as multipart/form-data</span><br />curl -X POST https://api.webscrappro.io/v1/pdf/extract \<br />  -H <span className="text-green-400">"Authorization: Bearer YOUR_API_KEY"</span> \<br />  -F <span className="text-green-400">"file=@document.pdf"</span> \<br />  -F <span className="text-green-400">"options=extract_text,extract_metadata"</span></pre>
        </div>
      </div>
    ),
  },
  {
    id: 'export',
    icon: Download,
    title: 'Export API',
    content: (
      <div className="space-y-6">
        <p className="text-app-muted leading-relaxed">Export your scraped data in multiple formats.</p>
        <div className="rounded-xl border border-app-line bg-app-surface p-5">
          <h4 className="text-sm font-medium text-app-fg mb-2">GET /export/{'{job_id}'}</h4>
          <pre className="text-xs text-app-soft font-mono bg-black/40 rounded-lg p-4 overflow-x-auto">curl -H <span className="text-green-400">"Authorization: Bearer YOUR_API_KEY"</span> \<br />  "https://api.webscrappro.io/v1/export/job_abc123?format=csv"</pre>
        </div>
        <div className="flex gap-2 flex-wrap">
          {['CSV', 'JSON', 'XLSX', 'XML'].map((f) => (
            <span key={f} className="rounded-lg border border-app-line bg-app-surface px-3 py-1 text-xs text-app-muted">{f}</span>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 'analytics',
    icon: BarChart3,
    title: 'Analytics API',
    content: (
      <div className="space-y-6">
        <p className="text-app-muted leading-relaxed">Retrieve usage statistics and performance metrics.</p>
        <div className="rounded-xl border border-app-line bg-app-surface p-5">
          <h4 className="text-sm font-medium text-app-fg mb-2">GET /analytics</h4>
          <pre className="text-xs text-app-soft font-mono bg-black/40 rounded-lg p-4 overflow-x-auto">curl -H <span className="text-green-400">"Authorization: Bearer YOUR_API_KEY"</span> \<br />  "https://api.webscrappro.io/v1/analytics?period=30d"</pre>
        </div>
      </div>
    ),
  },
  {
    id: 'sdks',
    icon: Terminal,
    title: 'Client SDKs',
    content: (
      <div className="space-y-6">
        <p className="text-app-muted leading-relaxed">Use our official client libraries for seamless integration.</p>
        <div className="rounded-xl border border-app-line bg-app-surface p-5">
          <h4 className="text-sm font-medium text-app-fg mb-2">JavaScript / Node.js</h4>
          <pre className="text-xs text-app-soft font-mono bg-black/40 rounded-lg p-4 overflow-x-auto">npm install webscrappro-client<br /><br />import WebScrapPro from 'webscrappro-client'<br /><br />const client = new WebScrapPro({'{'}&nbsp;apiKey: 'YOUR_API_KEY'&nbsp;{'}'})<br /><br />const job = await client.scrape.start({'{'}<br />&nbsp;&nbsp;urls: ['https://example.com'],<br />{'}'})</pre>
        </div>
      </div>
    ),
  },
]

function CodeBlock({ code }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div className="relative group">
      <pre className="text-xs text-app-soft font-mono bg-black/40 rounded-lg p-4 overflow-x-auto border border-app-line">{code}</pre>
      <button type="button" onClick={handleCopy} className="absolute top-3 right-3 rounded-lg border border-app-line bg-app-elevated p-1.5 text-app-muted opacity-0 group-hover:opacity-100 transition hover:text-app-soft">
        {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
      </button>
    </div>
  )
}

function DocsPage() {
  const [activeSection, setActiveSection] = useState('getting-started')
  const [search, setSearch] = useState('')

  const activeData = sections.find((s) => s.id === activeSection)

  return (
    <div className="min-h-screen bg-app-bg">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-cyan-400">Documentation</p>
          <h1 className="mt-4 text-balance text-4xl font-bold tracking-tight text-app-fg sm:text-5xl">API Reference & Guides</h1>
          <p className="mx-auto mt-4 max-w-xl text-app-muted">Everything you need to integrate WebScrap Pro into your workflow.</p>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          <motion.nav initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-1">
            <div className="relative mb-4">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-app-muted pointer-events-none" />
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search docs..." className="w-full rounded-xl border border-app-line bg-app-surface pl-9 pr-4 py-2.5 text-sm text-app-fg placeholder:text-app-muted transition focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/20" />
            </div>
            {sections.map((s) => {
              const Icon = s.icon
              return (
                <button key={s.id} type="button" onClick={() => setActiveSection(s.id)}
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                    activeSection === s.id ? 'bg-cyan-500/10 text-cyan-300' : 'text-app-muted hover:bg-app-surface hover:text-app-nav'
                  }`}>
                  <Icon size={16} />
                  {s.title}
                  {activeSection === s.id && <ChevronRight size={14} className="ml-auto text-cyan-400" />}
                </button>
              )
            })}
          </motion.nav>

          <motion.div key={activeSection} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              {activeData && <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20"><activeData.icon size={20} className="text-cyan-400" /></div>}
              <div><h2 className="text-xl font-bold text-app-fg">{activeData?.title}</h2></div>
            </div>
            {activeData?.content}
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default DocsPage
