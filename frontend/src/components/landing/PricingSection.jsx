import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Check, ArrowRight } from 'lucide-react'

const plans = [
  {
    name: 'Starter',
    price: '$29',
    description: 'For individuals and small projects',
    features: [
      '5,000 pages per month',
      'Basic web scraping',
      'PDF text extraction',
      'CSV & JSON export',
      '7-day data retention',
      'Email support',
      '1 team member',
    ],
    cta: 'Start free trial',
    popular: false,
  },
  {
    name: 'Professional',
    price: '$79',
    description: 'For growing teams and businesses',
    features: [
      '50,000 pages per month',
      'Advanced scraping with JS rendering',
      'Full PDF tool suite',
      'All export formats (JSON, CSV, XLSX, XML)',
      '30-day data retention',
      'Priority email & chat support',
      'Full API access',
      'Up to 5 team members',
      'Custom webhooks',
    ],
    cta: 'Start free trial',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: '$249',
    description: 'For large organizations',
    features: [
      'Unlimited pages',
      'Custom integrations',
      'OCR & advanced PDF processing',
      'Real-time export to any destination',
      'Unlimited data retention',
      'Dedicated account manager',
      'Advanced API with SLA',
      'Unlimited team members',
      'SSO, SAML & audit logs',
      '99.99% uptime SLA',
    ],
    cta: 'Contact sales',
    popular: false,
  },
]

const faq = [
  { q: 'Can I cancel anytime?', a: 'Yes, you can cancel your subscription at any time. No long-term contracts or hidden fees.' },
  { q: 'Is there a free trial?', a: 'All plans come with a 14-day free trial. No credit card required to get started.' },
  { q: 'What happens when I exceed my page limit?', a: 'You can purchase additional pages on-demand or upgrade your plan. We will notify you before any overage charges.' },
]

function PricingSection() {
  const navigate = useNavigate()

  return (
    <section id="pricing" className="relative border-t border-app-line py-24">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(99,102,241,0.04),transparent_50%)]" />
      <div className="absolute inset-0 bg-grid opacity-30" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600">
            Pricing
          </p>
          <h2 className="mt-4 text-balance text-3xl sm:text-4xl font-bold text-app-fg">
            Simple, transparent pricing
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-app-muted text-sm sm:text-base">
            Start free, scale as you grow. No hidden fees, no surprises.
          </p>
        </motion.div>

        <div className="mt-16 grid gap-6 lg:grid-cols-3 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className={`relative rounded-2xl border p-8 transition-all duration-300 hover:-translate-y-1 ${
                plan.popular
                  ? 'border-indigo-400/40 bg-gradient-to-b from-indigo-500/10 to-app-elevated shadow-2xl shadow-indigo-500/10'
                  : 'border-app-line bg-app-elevated hover:border-app-line'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-indigo-500 to-violet-600 px-4 py-1 text-[10px] font-semibold uppercase tracking-widest text-white shadow-lg shadow-indigo-500/20">
                  Most popular
                </div>
              )}

              <div>
                <h3 className="text-lg font-semibold text-app-fg">{plan.name}</h3>
                <p className="mt-1 text-sm text-app-muted">{plan.description}</p>
                <p className="mt-6">
                  <span className="text-4xl font-bold text-app-fg">{plan.price}</span>
                  <span className="ml-1 text-sm text-app-muted">/month</span>
                </p>
              </div>

              <ul className="mt-8 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm text-app-muted">
                    <Check size={16} className="mt-0.5 shrink-0 text-indigo-500" />
                    {f}
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={() => navigate('/register')}
                className={`mt-8 w-full rounded-xl py-2.5 text-sm font-semibold transition-all duration-300 ${
                  plan.popular
                    ? 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 hover:scale-[1.02]'
                    : 'border border-app-line text-app-soft hover:bg-app-elevated hover:scale-[1.02]'
                }`}
              >
                {plan.cta}
              </button>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 max-w-2xl mx-auto"
        >
          <h3 className="text-center text-lg font-semibold text-app-fg mb-6">Frequently asked about pricing</h3>
          <div className="space-y-3">
            {faq.map((item) => (
              <details key={item.q} className="group rounded-xl border border-app-line bg-app-elevated transition hover:border-app-line">
                <summary className="flex cursor-pointer items-center justify-between px-5 py-4 text-sm font-medium text-app-soft">
                  {item.q}
                  <ArrowRight size={14} className="shrink-0 transition-transform duration-300 group-open:rotate-90 text-app-muted" />
                </summary>
                <div className="px-5 pb-4 text-sm text-app-muted">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default PricingSection
