import { motion } from 'framer-motion'
import { Search, Cog, Database, Download, ArrowRight, Link2, Eye, Code } from 'lucide-react'

const steps = [
  {
    icon: Link2,
    title: '1. Configure Target',
    description: 'Enter the URL, define CSS selectors or XPath expressions, and configure pagination rules for your target website.',
    gradient: 'from-cyan-500 to-blue-600',
  },
  {
    icon: Eye,
    title: '2. Preview & Validate',
    description: 'Preview extracted data in real-time. Validate selectors, handle dynamic content, and adjust parsing rules interactively.',
    gradient: 'from-blue-500 to-indigo-600',
  },
  {
    icon: Cog,
    title: '3. Run & Monitor',
    description: 'Execute scrapes with intelligent rate limiting, automatic retry logic, and distributed proxy rotation for reliability.',
    gradient: 'from-indigo-500 to-purple-600',
  },
  {
    icon: Database,
    title: '4. Export & Integrate',
    description: 'Export structured data to JSON, CSV, XLSX, or your database. Set up automated pipelines with webhook triggers.',
    gradient: 'from-purple-500 to-pink-600',
  },
]

const proxyFeatures = [
  'Automatic proxy rotation',
  'Rate limiting & throttling',
  'JavaScript rendering support',
  'Cookie & session management',
  'Custom header injection',
  'Form submission handling',
]

function ScrapingWorkflow() {
  return (
    <section id="workflow" className="relative border-t border-app-line py-24">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_right,rgba(99,102,241,0.06),transparent_50%)]" />
      <div className="absolute inset-0 bg-grid opacity-30" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-indigo-400">
            How It Works
          </p>
          <h2 className="mt-4 text-balance text-3xl sm:text-4xl font-bold text-app-fg">
            From URL to structured data in 4 steps
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-app-muted text-sm sm:text-base">
            Our intelligent scraping engine handles the complexity so you can focus on what matters.
          </p>
        </motion.div>

        <div className="mt-16 grid gap-6 md:grid-cols-4 relative">
          <div className="hidden md:block absolute top-12 left-[calc(12.5%+1.5rem)] right-[calc(12.5%+1.5rem)] h-px bg-gradient-to-r from-cyan-500/30 via-purple-500/30 to-pink-500/30" />
          <div className="hidden md:block absolute top-[72px] left-[calc(12.5%+2.5rem)] right-[calc(12.5%+2.5rem)] h-[2px] bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent animate-pulse" />
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="relative text-center md:text-left group"
            >
              <div className="absolute -top-1 left-1/2 md:left-8 w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.6)] group-hover:shadow-[0_0_12px_rgba(6,182,212,0.9)] transition-shadow duration-300" />
              <motion.div
                className={`inline-flex rounded-xl bg-gradient-to-br ${step.gradient} p-3.5 shadow-lg mb-4 group-hover:scale-110 group-hover:shadow-cyan-500/20 transition-all duration-300`}
                whileHover={{ scale: 1.1 }}
              >
                <step.icon size={22} className="text-app-fg" />
              </motion.div>
              <h3 className="text-lg font-semibold text-app-fg group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-cyan-300 group-hover:to-purple-400 group-hover:bg-clip-text transition-all duration-300">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 text-app-muted group-hover:text-app-soft transition-colors duration-300">{step.description}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-24 grid gap-12 md:grid-cols-2 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl font-bold text-app-fg">Intelligent scraping engine</h3>
            <p className="mt-3 text-sm text-app-muted">
              Our engine handles complex websites with dynamic content, JavaScript rendering, and anti-bot protections. Built for reliability at scale.
            </p>
            <ul className="mt-6 grid grid-cols-2 gap-3">
              {proxyFeatures.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-app-muted">
                  <div className="h-1.5 w-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-app-line bg-app-surface p-6 overflow-hidden"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Code size={14} className="text-app-muted" />
                <span className="text-xs text-app-muted">Example configuration</span>
              </div>
              <span className="text-[10px] text-zinc-600">JSON</span>
            </div>
            <pre className="text-xs text-app-muted font-mono leading-relaxed">
              <span className="text-zinc-600">{'{'}</span>
              {'\n'}  <span className="text-cyan-400">"url"</span>: <span className="text-green-400">"https://example.com/products"</span>,
              {'\n'}  <span className="text-cyan-400">"selectors"</span>: <span className="text-zinc-600">{'{'}</span>
              {'\n'}    <span className="text-cyan-400">"title"</span>: <span className="text-green-400">"h2.product-title"</span>,
              {'\n'}    <span className="text-cyan-400">"price"</span>: <span className="text-green-400">".price-tag"</span>,
              {'\n'}    <span className="text-cyan-400">"image"</span>: <span className="text-green-400">"img.product-img @src"</span>,
              {'\n'}  <span className="text-zinc-600">{'}'}</span>,
              {'\n'}  <span className="text-cyan-400">"pagination"</span>: <span className="text-green-400">".next-page @href"</span>,
              {'\n'}  <span className="text-cyan-400">"rate_limit"</span>: <span className="text-blue-400">2</span>,
              {'\n'}  <span className="text-cyan-400">"max_pages"</span>: <span className="text-blue-400">100</span>
              {'\n'}<span className="text-zinc-600">{'}'}</span>
            </pre>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default ScrapingWorkflow
