import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Search } from 'lucide-react'

const faqItems = [
  {
    q: 'What types of websites can WebScrap Pro scrape?',
    a: 'WebScrap Pro can scrape any publicly accessible website, including JavaScript-rendered SPAs, e-commerce stores, news sites, social media platforms, and APIs. Our engine handles dynamic content, pagination, authentication, and anti-bot protections.',
  },
  {
    q: 'How does PDF text extraction work?',
    a: 'Our PDF engine uses advanced parsing algorithms to extract text while preserving structure. We support PDF/A, scanned documents (via OCR), encrypted PDFs, and complex multi-column layouts. Text is extracted with position mapping for accurate reconstruction.',
  },
  {
    q: 'Is there a limit on file sizes?',
    a: 'Starter plans support files up to 50MB. Professional plans support up to 200MB. Enterprise plans have no file size limits. All plans support batch processing of multiple files simultaneously.',
  },
  {
    q: 'Can I export data to my own database?',
    a: 'Yes. We support direct exports to PostgreSQL, MySQL, MongoDB, BigQuery, Snowflake, and S3-compatible storage. You can also set up automated pipelines with webhook triggers for real-time data streaming.',
  },
  {
    q: 'How do you handle rate limiting and IP blocks?',
    a: 'Our intelligent proxy system automatically rotates IP addresses across multiple geographic regions. We implement adaptive rate limiting, retry logic with exponential backoff, and respect robots.txt directives automatically.',
  },
  {
    q: 'What security measures are in place?',
    a: 'We are SOC 2 compliant with end-to-end encryption at rest and in transit. All data is stored in isolated containers with granular RBAC. We support SSO, SAML, 2FA, and maintain detailed audit logs of all operations.',
  },
  {
    q: 'Do you offer OCR for scanned documents?',
    a: 'Yes, our OCR engine supports 100+ languages with high accuracy. It handles handwritten text, multiple fonts, tables, and low-quality scans. OCR is available on Professional and Enterprise plans.',
  },
  {
    q: 'Can I schedule recurring scrapes?',
    a: 'Absolutely. You can schedule scrapes on any cron interval — hourly, daily, weekly, or custom. Each scheduled job can trigger webhooks, send email notifications, and automatically export data to your chosen destination.',
  },
]

function FaqSection() {
  const [openIndex, setOpenIndex] = useState(null)
  const [search, setSearch] = useState('')

  const filtered = faqItems.filter(
    (item) =>
      item.q.toLowerCase().includes(search.toLowerCase()) ||
      item.a.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <section id="faq" className="relative border-t border-app-line py-24">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.03),transparent_50%)]" />
      <div className="absolute inset-0 bg-grid opacity-30" />

      <div className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600">
            FAQ
          </p>
          <h2 className="mt-4 text-balance text-3xl sm:text-4xl font-bold text-app-fg">
            Got questions? We have answers
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-app-muted text-sm sm:text-base">
            Everything you need to know about WebScrap Pro. Can&apos;t find what you&apos;re looking for? Contact our support team.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-10 relative"
        >
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-app-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search questions..."
            className="w-full rounded-xl border border-app-line bg-app-elevated pl-10 pr-4 py-3 text-sm text-app-fg placeholder:text-app-muted transition focus:border-indigo-400/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="mt-8 space-y-2"
        >
          {filtered.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.03 }}
              className="rounded-xl border border-app-line bg-app-elevated overflow-hidden transition hover:border-app-line"
            >
              <button
                type="button"
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-medium text-app-soft transition hover:text-app-fg"
              >
                {item.q}
                <ChevronDown
                  size={14}
                  className={`shrink-0 text-app-muted transition-transform duration-300 ${
                    openIndex === i ? 'rotate-180' : ''
                  }`}
                />
              </button>
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <p className="px-5 pb-4 text-sm text-app-muted leading-relaxed">{item.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>

        {filtered.length === 0 && (
          <div className="mt-8 text-center py-12 rounded-xl border border-dashed border-app-line">
            <p className="text-app-muted text-sm">No results found for &ldquo;{search}&rdquo;</p>
            <button
              type="button"
              onClick={() => setSearch('')}
              className="mt-2 text-xs text-indigo-600 hover:text-indigo-500 transition"
            >
              Clear search
            </button>
          </div>
        )}
      </div>
    </section>
  )
}

export default FaqSection
