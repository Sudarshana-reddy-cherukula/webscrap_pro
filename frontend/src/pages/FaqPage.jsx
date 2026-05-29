import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, HelpCircle, Mail, BookOpen } from 'lucide-react'
import AnimatedGradient from '@/components/ui/AnimatedGradient'

const categories = [
  {
    title: 'Getting Started',
    icon: BookOpen,
    color: 'from-cyan-500 to-blue-600',
    questions: [
      { q: 'What is WebScrap Pro?', a: 'WebScrap Pro is an enterprise-grade web scraping and PDF processing platform. It allows you to extract structured data from websites, process PDF documents, and export the results in multiple formats.' },
      { q: 'How do I get started?', a: 'Sign up for a free account, verify your email, and you\'re ready to start. The dashboard provides guided onboarding to help you create your first scraping job or PDF processing task.' },
      { q: 'Is there a free trial?', a: 'Yes, all plans come with a 14-day free trial with full access to all features. No credit card required.' },
      { q: 'What kind of support do you offer?', a: 'We offer email support for all plans, priority support for Professional plans, and dedicated account management for Enterprise customers.' },
    ],
  },
  {
    title: 'Web Scraping',
    icon: HelpCircle,
    color: 'from-purple-500 to-pink-600',
    questions: [
      { q: 'What types of websites can I scrape?', a: 'You can scrape any publicly accessible website. Our engine handles JavaScript-rendered content, pagination, authentication, and dynamic loading patterns automatically.' },
      { q: 'How many pages can I scrape?', a: 'This depends on your plan. Starter includes 5,000 pages/month, Professional includes 50,000 pages/month, and Enterprise offers unlimited scraping.' },
      { q: 'Can I scrape sites that require login?', a: 'Yes, you can configure session cookies or authentication headers for sites that require login. Enterprise plans include dedicated support for complex auth scenarios.' },
      { q: 'How fast is the scraping engine?', a: 'Our parallel processing engine can handle up to 500 pages per minute with intelligent rate limiting to avoid overloading target servers.' },
    ],
  },
  {
    title: 'PDF Processing',
    icon: HelpCircle,
    color: 'from-green-500 to-emerald-600',
    questions: [
      { q: 'What PDF formats are supported?', a: 'We support all standard PDF formats including searchable PDFs, scanned documents, fillable forms, and encrypted PDFs (with password).' },
      { q: 'Can I extract images from PDFs?', a: 'Yes, our PDF tools can extract embedded images, text, metadata, and convert PDFs to TXT or DOCX formats while maintaining layout fidelity.' },
      { q: 'Is there a file size limit?', a: 'Starter plans support up to 50MB per file. Professional supports up to 200MB, and Enterprise has no file size limit.' },
      { q: 'Do you support batch processing?', a: 'Yes, you can upload and process multiple PDFs simultaneously. Professional plans support batch processing of up to 20 files, Enterprise has unlimited batch processing.' },
    ],
  },
  {
    title: 'Data & Export',
    icon: HelpCircle,
    color: 'from-amber-500 to-orange-600',
    questions: [
      { q: 'What export formats are available?', a: 'We support CSV, JSON, XLSX, and XML export formats. Enterprise plans include custom format support and direct database integrations.' },
      { q: 'How long is my data stored?', a: 'Data retention varies by plan: Starter 24 hours, Professional 30 days, Enterprise unlimited retention with configurable data lifecycle policies.' },
      { q: 'Can I automate exports?', a: 'Yes, you can schedule recurring exports via our API or dashboard. Enterprise plans include webhook integrations for real-time data delivery.' },
      { q: 'Is my data secure?', a: 'Absolutely. We use end-to-end encryption for data in transit and at rest. We are SOC 2 compliant and offer SSO/SAML for Enterprise plans.' },
    ],
  },
  {
    title: 'Billing & Account',
    icon: HelpCircle,
    color: 'from-red-500 to-rose-600',
    questions: [
      { q: 'Can I change my plan?', a: 'Yes, you can upgrade or downgrade your plan at any time. Upgrades take effect immediately, downgrades apply at the next billing cycle.' },
      { q: 'What payment methods do you accept?', a: 'We accept all major credit cards, PayPal, and wire transfers for Enterprise plans.' },
      { q: 'Can I cancel anytime?', a: 'Yes, you can cancel your subscription at any time. Your data will remain accessible until the end of your billing period.' },
      { q: 'Do you offer refunds?', a: 'We offer a 30-day money-back guarantee on all plans. Contact our support team for assistance.' },
    ],
  },
]

function FaqPage() {
  const navigate = useNavigate()

  return (
    <div className="relative min-h-screen bg-app-bg">
      <AnimatedGradient />
      <div className="absolute inset-0 bg-grid opacity-30" />

      <div className="relative mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/5 px-4 py-1.5 text-xs font-medium text-cyan-300">
            <HelpCircle size={12} />
            FAQ
          </div>
          <h1 className="text-balance text-4xl font-bold tracking-tight text-app-fg sm:text-5xl">
            Frequently asked questions
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-app-muted">
            Everything you need to know about WebScrap Pro. Can&apos;t find what you&apos;re looking for? Reach out to our team.
          </p>
        </motion.div>

        <div className="mt-16 space-y-12">
          {categories.map((category, ci) => {
            const Icon = category.icon
            return (
              <motion.div
                key={category.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: ci * 0.1 }}
              >
                <div className="mb-6 flex items-center gap-3">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${category.color}`}>
                    <Icon size={16} className="text-app-fg" />
                  </div>
                  <h2 className="text-lg font-semibold text-app-fg">{category.title}</h2>
                </div>
                <div className="space-y-3">
                  {category.questions.map((item) => (
                    <details
                      key={item.q}
                      className="group rounded-2xl border border-white/5 bg-[#0B1220] transition hover:border-cyan-500/20 hover:shadow-lg hover:shadow-cyan-500/5"
                    >
                      <summary className="flex cursor-pointer items-center justify-between px-6 py-4 text-sm font-medium text-app-nav group-open:text-cyan-300 transition-colors">
                        {item.q}
                        <ArrowRight size={14} className="shrink-0 text-app-muted transition group-open:rotate-90 group-open:text-cyan-400" />
                      </summary>
                      <p className="border-t border-white/5 px-6 py-4 text-sm leading-6 text-app-muted">
                        {item.a}
                      </p>
                    </details>
                  ))}
                </div>
              </motion.div>
            )
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="mx-auto mt-20 max-w-xl text-center"
        >
          <div className="rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/5 to-blue-600/5 px-8 py-10">
            <Mail size={24} className="mx-auto text-cyan-400" />
            <h2 className="mt-4 text-xl font-bold text-app-fg">Still have questions?</h2>
            <p className="mt-2 text-sm text-app-muted">
              Our team is ready to help. Reach out and we&apos;ll get back to you within 24 hours.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
              <a
                href="mailto:support@webscrappro.io"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-2.5 text-sm font-semibold text-app-fg shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30"
              >
                <Mail size={16} />
                Contact support
              </a>
              <button
                type="button"
                onClick={() => navigate('/pricing')}
                className="inline-flex items-center gap-2 rounded-xl border border-app-line px-6 py-2.5 text-sm font-medium text-app-soft hover:bg-app-surface"
              >
                View pricing
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default FaqPage
