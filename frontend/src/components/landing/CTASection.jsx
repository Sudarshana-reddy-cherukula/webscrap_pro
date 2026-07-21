import { motion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'

function CTASection({ onNavigate }) {
  return (
    <section className="relative border-t border-app-line py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl border border-indigo-400/30 bg-gradient-to-br from-indigo-50 via-violet-50/50 to-cyan-50/30 px-8 py-16 text-center sm:px-16"
        >
          <div className="absolute inset-0 bg-grid opacity-20" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-gradient-to-r from-indigo-500/20 to-violet-500/20 rounded-full blur-3xl" />

          <div className="relative">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-50 px-4 py-1.5 text-xs font-medium text-indigo-700"
            >
              <Sparkles size={12} />
              Start your free trial today
            </motion.div>

            <h2 className="text-balance text-3xl sm:text-4xl lg:text-5xl font-bold text-app-fg">
              Ready to supercharge your data pipeline?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-app-muted text-sm sm:text-base">
              Join thousands of data professionals who trust WebScrap Pro for their web scraping and PDF processing needs. Start free, no credit card required.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => onNavigate && onNavigate('/register')}
                className="group bg-gradient-to-r from-indigo-500 to-violet-600 px-8 py-3 text-base font-semibold text-white rounded-xl shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all duration-300 hover:scale-105"
              >
                Get started free
                <ArrowRight size={16} className="ml-2 inline transition-transform duration-300 group-hover:translate-x-1" />
              </button>
              <button
                type="button"
                onClick={() => onNavigate && onNavigate('/faq')}
                className="border border-app-line px-8 py-3 text-base font-medium text-app-soft rounded-xl hover:bg-app-elevated transition-all duration-300 hover:scale-105"
              >
                Learn more
              </button>
            </div>

            <div className="mt-8 flex items-center justify-center gap-6 text-xs text-app-muted">
              <span>No credit card required</span>
              <span className="w-1 h-1 rounded-full bg-app-line" />
              <span>14-day free trial</span>
              <span className="w-1 h-1 rounded-full bg-app-line" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default CTASection
