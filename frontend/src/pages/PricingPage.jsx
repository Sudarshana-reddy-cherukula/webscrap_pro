import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Check, ArrowRight, Zap } from 'lucide-react'
import AnimatedGradient from '@/components/ui/AnimatedGradient'

const plans = [
  {
    name: 'Starter', price: '$29',
    description: 'For individuals and small projects',
    features: ['5,000 pages/month', 'Basic web scraping', 'PDF text extraction', 'CSV & JSON export', '24-hour data retention', 'Email support', '1 team member'],
    cta: 'Start free trial', popular: false, color: 'from-cyan-500 to-blue-600',
  },
  {
    name: 'Professional', price: '$79',
    description: 'For growing teams and businesses',
    features: ['50,000 pages/month', 'Advanced scraping with selectors', 'Full PDF processing suite', 'All export formats', '30-day data retention', 'Priority support', 'REST API access', 'Up to 5 team members', 'Real-time analytics'],
    cta: 'Start free trial', popular: true, color: 'from-purple-500 to-pink-600',
  },
  {
    name: 'Enterprise', price: '$249',
    description: 'For large organizations',
    features: ['Unlimited pages/month', 'Custom scraping integrations', 'Unlimited PDF processing', 'Real-time data export', 'Unlimited data retention', 'Dedicated account manager', 'Advanced API with SSO/SAML', 'Unlimited team members', '99.99% SLA guarantee', 'Custom onboarding', 'On-premise deployment option'],
    cta: 'Contact sales', popular: false, color: 'from-amber-500 to-orange-600',
  },
]

const faq = [
  { q: 'Can I switch plans anytime?', a: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.' },
  { q: 'Is there a free trial?', a: 'All plans come with a 14-day free trial. No credit card required.' },
  { q: 'What happens when I hit my page limit?', a: 'We&#x27;ll notify you and you can upgrade your plan or purchase additional pages.' },
  { q: 'Do you offer student discounts?', a: 'Yes, we offer 50% off for verified students and academic researchers.' },
]

const cardClass = "rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6"

function PricingPage() {
  const navigate = useNavigate()

  return (
    <div className="relative min-h-screen bg-app-bg">
      <AnimatedGradient />
      <div className="absolute inset-0 bg-grid opacity-30" />

      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/5 px-4 py-1.5 text-xs font-medium text-cyan-300">
            <Zap size={12} /> Simple, transparent pricing
          </div>
          <h1 className="text-balance text-4xl font-bold tracking-tight text-app-fg sm:text-5xl">
            Choose the plan that fits your needs
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-app-muted">Start free, scale as you grow. No hidden fees, no surprises.</p>
        </motion.div>

        <div className="mt-16 grid gap-6 lg:grid-cols-3">
          {plans.map((plan, i) => (
            <motion.div key={plan.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className={`relative ${cardClass} ${plan.popular ? 'border-purple-500/30 shadow-xl shadow-purple-500/5' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-gradient-to-r from-purple-500 to-pink-600 px-4 py-1 text-[10px] font-semibold uppercase tracking-widest text-white shadow-lg">
                  Most popular
                </div>
              )}
              <div>
                <h3 className="text-lg font-semibold text-app-fg">{plan.name}</h3>
                <p className="mt-1 text-sm text-app-muted">{plan.description}</p>
                <p className="mt-6"><span className="text-4xl font-bold text-app-fg">{plan.price}</span><span className="ml-1 text-sm text-app-muted">/month</span></p>
              </div>
              <ul className="mt-8 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm text-app-muted">
                    <Check size={16} className="mt-0.5 shrink-0 text-cyan-400" /> {f}
                  </li>
                ))}
              </ul>
              <button type="button" onClick={() => navigate('/register')}
                className={`mt-8 w-full rounded-xl py-2.5 text-sm font-semibold transition ${
                  plan.popular
                    ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30'
                    : 'border border-white/10 text-app-soft hover:bg-white/[0.04]'
                }`}
              >{plan.cta}</button>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-24">
          <h2 className="text-center text-2xl font-bold text-app-fg">Frequently asked questions</h2>
          <div className="mx-auto mt-10 grid max-w-3xl gap-4">
            {faq.map((item) => (
              <details key={item.q} className="group rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl transition hover:border-white/20">
                <summary className="flex cursor-pointer items-center justify-between px-6 py-4 text-sm font-medium text-app-nav">
                  {item.q}
                  <ArrowRight size={14} className="shrink-0 text-app-muted transition group-open:rotate-90" />
                </summary>
                <p className="border-t border-white/5 px-6 py-4 text-sm leading-6 text-app-muted">{item.a}</p>
              </details>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
          className="mx-auto mt-24 max-w-2xl text-center"
        >
          <div className="rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/5 to-blue-600/5 backdrop-blur-xl px-8 py-10">
            <h2 className="text-2xl font-bold text-app-fg">Still have questions?</h2>
            <p className="mt-2 text-sm text-app-muted">Our team is here to help you find the perfect plan.</p>
            <button type="button" onClick={() => navigate('/faq')}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30"
            >Visit FAQ <ArrowRight size={16} /></button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default PricingPage
