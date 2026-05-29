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
    <footer className="relative border-t border-white/5 bg-[#050816]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(6,182,212,0.04),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(168,85,247,0.03),transparent_50%)]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-1">
            <Link to="/" className="group inline-flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 text-[7px] font-bold text-app-fg shadow-lg shadow-cyan-500/20 tracking-tight leading-none">
                WP
              </div>
              <span className="text-lg font-bold tracking-tight text-app-fg">
                WebScrap <span className="text-cyan-400">Pro</span>
              </span>
            </Link>
            <p className="mt-4 text-sm leading-6 text-zinc-400 max-w-xs">
              Enterprise-grade web scraping and PDF processing platform. Extract, transform, and export data at scale with enterprise reliability.
            </p>
            <div className="mt-6 flex gap-3">
              {['Twitter', 'GitHub', 'Discord', 'YouTube'].map((s) => (
                <a
                  key={s}
                  href="#"
                  className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-zinc-500 transition hover:border-cyan-500/30 hover:text-cyan-300 hover:bg-cyan-500/5"
                >
                  {s}
                </a>
              ))}
            </div>

            <div className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-cyan-500/10 bg-cyan-500/5 px-3 py-1">
              <Zap size={10} className="text-cyan-400" />
              <span className="text-[10px] text-cyan-400/80">All systems operational</span>
            </div>
          </div>

          {Object.entries(footerLinks).map(([heading, links]) => (
            <div key={heading}>
              <h4 className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
                {heading}
              </h4>
              <ul className="mt-4 space-y-3">
                {links.map((link) => (
                  <motion.li key={link.label} whileHover={{ x: 3 }}>
                    <Link
                      to={link.to}
                      className="text-sm text-zinc-500 transition hover:text-cyan-300"
                    >
                      {link.label}
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/5 py-8">
          <p className="text-sm text-zinc-600">
            &copy; {new Date().getFullYear()} WebScrap Pro, Inc. All rights reserved.
          </p>
          <form onSubmit={handleNewsletter} className="flex items-center gap-2">
            <div className="relative">
              <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Subscribe to updates"
                className="w-48 rounded-xl border border-white/10 bg-white/[0.03] pl-9 pr-3 py-2 text-xs text-app-fg placeholder:text-zinc-600 transition focus:border-cyan-500/30 focus:outline-none focus:ring-1 focus:ring-cyan-500/20"
              />
            </div>
            <button
              type="submit"
              className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 p-2 text-app-fg transition hover:shadow-lg hover:shadow-cyan-500/20"
            >
              <ArrowRight size={14} />
            </button>
          </form>
        </div>

        <div className="flex items-center justify-center gap-4 pb-6 text-[11px] text-zinc-700">
          <a href="#" className="hover:text-zinc-500 transition">Privacy</a>
          <span className="w-1 h-1 rounded-full bg-zinc-800" />
          <a href="#" className="hover:text-zinc-500 transition">Terms</a>
          <span className="w-1 h-1 rounded-full bg-zinc-800" />
          <a href="#" className="hover:text-zinc-500 transition">Cookies</a>
        </div>
      </div>
    </footer>
  )
}

export default Footer