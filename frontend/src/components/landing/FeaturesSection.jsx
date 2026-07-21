import { motion } from 'framer-motion'
import { Globe, FileText, Download, BarChart3, Zap, Shield, Search, Cog, Layers, Sparkles } from 'lucide-react'

const features = [
  {
    icon: Globe,
    title: 'Smart Web Scraping',
    description: 'Extract structured data from any website with intelligent crawling, CSS selectors, and automatic pagination handling. Built for scale.',
    gradient: 'from-indigo-500 to-violet-600',
    glow: 'shadow-indigo-500/10',
  },
  {
    icon: FileText,
    title: 'PDF Text Extraction',
    description: 'Extract text, metadata, and embedded images from any PDF. Handles complex layouts, scanned documents, and encrypted files.',
    gradient: 'from-violet-500 to-purple-600',
    glow: 'shadow-violet-500/10',
  },
  {
    icon: Download,
    title: 'Multi-Format Export',
    description: 'Export your data in JSON, CSV, XLSX, XML, or connect directly to your database. Seamless workflow integration.',
    gradient: 'from-cyan-500 to-blue-600',
    glow: 'shadow-cyan-500/10',
  },
  {
    icon: BarChart3,
    title: 'Real-Time Analytics',
    description: 'Monitor scraping jobs, track processing metrics, and gain actionable insights with beautiful interactive dashboards.',
    gradient: 'from-blue-500 to-indigo-600',
    glow: 'shadow-blue-500/10',
  },
  {
    icon: Zap,
    title: 'Lightning Fast Engine',
    description: 'Parallel processing engine handles thousands of pages per minute with intelligent rate limiting and smart queuing.',
    gradient: 'from-emerald-500 to-teal-600',
    glow: 'shadow-emerald-500/10',
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'SOC 2 compliant infrastructure. End-to-end encryption, secure data storage, and granular role-based access control.',
    gradient: 'from-rose-500 to-pink-600',
    glow: 'shadow-rose-500/10',
  },
  {
    icon: Cog,
    title: 'Automation Workflows',
    description: 'Build automated data pipelines with visual workflow builder. Schedule scrapes, trigger webhooks, and chain transformations.',
    gradient: 'from-purple-500 to-indigo-600',
    glow: 'shadow-purple-500/10',
  },
  {
    icon: Layers,
    title: 'OCR Processing',
    description: 'Extract text from images and scanned documents with advanced OCR. Supports 100+ languages with high accuracy.',
    gradient: 'from-pink-500 to-rose-600',
    glow: 'shadow-pink-500/10',
  },
  {
    icon: Search,
    title: 'Metadata Extraction',
    description: 'Auto-detect and extract metadata from documents and web pages. Author, dates, keywords, and custom fields.',
    gradient: 'from-teal-500 to-cyan-600',
    glow: 'shadow-teal-500/10',
  },
]

function FeaturesSection() {
  return (
    <section id="features" className="relative border-t border-app-line py-24">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.04),transparent_50%)]" />
      <div className="absolute inset-0 bg-grid opacity-30" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600">
            Features
          </p>
          <h2 className="mt-4 text-balance text-3xl sm:text-4xl font-bold text-app-fg">
            Everything you need to collect and process data
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-app-muted text-sm sm:text-base">
            From web scraping to PDF extraction, WebScrap Pro provides a complete toolkit for data professionals.
          </p>
        </motion.div>

        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: i * 0.05, duration: 0.5 }}
              className="group relative overflow-hidden rounded-2xl border border-app-line bg-white p-6 transition-all duration-500 hover:border-indigo-400/30 hover:shadow-2xl hover:shadow-indigo-500/5 hover:-translate-y-1"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.02] via-transparent to-violet-600/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className={`mb-4 inline-flex rounded-xl bg-gradient-to-br ${feature.gradient} p-2.5 shadow-lg ${feature.glow} group-hover:scale-110 transition-all duration-300`}>
                <feature.icon size={20} className="text-white" />
              </div>
              <h3 className="text-lg font-semibold text-app-fg group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-indigo-600 group-hover:to-violet-500 group-hover:bg-clip-text transition-all duration-300">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-app-muted group-hover:text-app-soft transition-colors duration-300">
                {feature.description}
              </p>
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-50 px-5 py-2 text-sm text-indigo-700">
            <Sparkles size={14} />
            New: AI-powered data extraction now available
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default FeaturesSection
