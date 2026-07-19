import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Zap, Mail, ArrowRight } from 'lucide-react'
import { useState } from 'react'
import { useNotification } from '@/hooks/useNotification'

const footerLinks = {
  Product: [
    { label: 'Web Scraper', to: '/scraper' },
    { label: 'PDF Tools', to: '/pdf-tools' },
    { label: 'Export Center', to: '/export' },
    { label: 'Analytics', to: '/analytics' },
    { label: 'Pricing', to: '/pricing' },
  ],
  Company: [
    { label: 'About', to: '#' },
    { label: 'Blog', to: '#' },
    { label: 'Careers', to: '#' },
    { label: 'Contact', to: '#' },
  ],
  Support: [
    { label: 'Documentation', to: '#' },
    { label: 'API Reference', to: '#' },
    { label: 'FAQ', to: '/faq' },
    { label: 'Status', to: '#' },
  ],
  Legal: [
    { label: 'Privacy Policy', to: '#' },
    { label: 'Terms of Service', to: '#' },
    { label: 'Security', to: '#' },
    { label: 'GDPR', to: '#' },
  ],
}

function Footer() {
  const [email, setEmail] = useState('')
  const { showNotification } = useNotification()

  const handleNewsletter = (e) => {
    e.preventDefault()
    if (email) {
      showNotification('Subscribed to newsletter!')
      setEmail('')
    }
  }

  return (
    <footer className="relative border-t border-app-line bg-app-bg">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(200,90,72,0.03),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(212,147,60,0.02),transparent_50%)]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-1">
            <Link to="/" className="group inline-flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 text-[7px] font-bold text-white shadow-lg shadow-amber-500/20 tracking-tight leading-none">
                WP
              </div>
              <span className="text-lg font-bold tracking-tight text-app-fg">
                WebScrap <span className="text-amber-600">Pro</span>
              </span>
            </Link>
            <p className="mt-4 text-sm leading-6 text-app-muted max-w-xs">
              Enterprise-grade web scraping and PDF processing platform. Extract, transform, and export data at scale with enterprise reliability.
            </p>
            <div className="mt-6 flex gap-3">
              {['Twitter', 'GitHub', 'Discord', 'YouTube'].map((s) => (
                <a
                  key={s}
                  href="#"
                  className="rounded-lg border border-app-line bg-white px-3 py-1.5 text-xs text-app-muted transition hover:border-amber-400/30 hover:text-amber-700 hover:bg-amber-50"
                >
                  {s}
                </a>
              ))}
            </div>

            <div className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-amber-400/20 bg-amber-50 px-3 py-1">
              <Zap size={10} className="text-amber-600" />
              <span className="text-[10px] text-amber-700">All systems operational</span>
            </div>
          </div>

          {Object.entries(footerLinks).map(([heading, links]) => (
            <div key={heading}>
              <h4 className="text-xs font-semibold uppercase tracking-widest text-app-muted">
                {heading}
              </h4>
              <ul className="mt-4 space-y-3">
                {links.map((link) => (
                  <motion.li key={link.label} whileHover={{ x: 3 }}>
                    <Link
                      to={link.to}
                      className="text-sm text-app-muted transition hover:text-amber-700"
                    >
                      {link.label}
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-app-line py-8">
          <p className="text-sm text-app-muted">
            &copy; {new Date().getFullYear()} WebScrap Pro, Inc. All rights reserved.
          </p>
          <form onSubmit={handleNewsletter} className="flex items-center gap-2">
            <div className="relative">
              <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-app-muted" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Subscribe to updates"
                className="w-48 rounded-xl border border-app-line bg-white pl-9 pr-3 py-2 text-xs text-app-fg placeholder:text-app-muted transition focus:border-amber-400/50 focus:outline-none focus:ring-1 focus:ring-amber-500/20"
              />
            </div>
            <button
              type="submit"
              className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 p-2 text-white transition hover:shadow-lg hover:shadow-amber-500/20"
            >
              <ArrowRight size={14} />
            </button>
          </form>
        </div>

        <div className="flex items-center justify-center gap-4 pb-6 text-[11px] text-app-muted">
          <a href="#" className="hover:text-app-fg transition">Privacy</a>
          <span className="w-1 h-1 rounded-full bg-app-line" />
          <a href="#" className="hover:text-app-fg transition">Terms</a>
          <span className="w-1 h-1 rounded-full bg-app-line" />
          <a href="#" className="hover:text-app-fg transition">Cookies</a>
        </div>
      </div>
    </footer>
  )
}

export default Footer
