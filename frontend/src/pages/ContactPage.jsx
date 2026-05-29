import { useState } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Send, Mail, MapPin, Clock, CheckCircle2, Loader2, ArrowRight } from 'lucide-react'

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters').max(2000, 'Message must be under 2000 characters'),
})

const contactInfo = [
  { icon: Mail, label: 'Email', value: 'hello@webscrappro.io', desc: 'We respond within 24 hours' },
  { icon: MapPin, label: 'Location', value: 'San Francisco, CA', desc: 'Remote-first team' },
  { icon: Clock, label: 'Hours', value: 'Mon–Fri, 9AM–6PM PST', desc: '24/7 support for Enterprise' },
]

function ContactPage() {
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data) => {
    setLoading(true)
    await new Promise((r) => setTimeout(r, 1500))
    setLoading(false)
    setSent(true)
  }

  return (
    <div className="min-h-screen bg-app-bg">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-cyan-400">Contact</p>
          <h1 className="mt-4 text-balance text-4xl font-bold tracking-tight text-app-fg sm:text-5xl">
            Get in touch
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-app-muted">
            Have a question, feedback, or want to discuss enterprise plans? We'd love to hear from you.
          </p>
        </motion.div>

        <div className="mt-16 grid gap-8 lg:grid-cols-[1fr_1.5fr]">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            {contactInfo.map((item) => {
              const Icon = item.icon
              return (
                <div key={item.label} className="rounded-2xl border border-app-line bg-app-surface p-6 transition hover:border-app-line">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20">
                      <Icon size={18} className="text-cyan-400" />
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-app-muted">{item.label}</p>
                      <p className="mt-1 text-sm font-medium text-app-fg">{item.value}</p>
                      <p className="mt-0.5 text-xs text-app-muted">{item.desc}</p>
                    </div>
                  </div>
                </div>
              )
            })}

            <div className="rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/5 to-blue-600/5 p-6">
              <p className="text-sm font-medium text-app-fg">Enterprise sales</p>
              <p className="mt-1 text-xs text-app-muted">For dedicated support, custom SLAs, and volume pricing.</p>
              <a href="mailto:enterprise@webscrappro.io" className="mt-3 inline-flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 transition">
                enterprise@webscrappro.io <ArrowRight size={10} />
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl border border-app-line bg-app-surface p-8"
          >
            {sent ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
                  <CheckCircle2 size={32} className="text-emerald-400" />
                </div>
                <h3 className="mt-6 text-xl font-bold text-app-fg">Message sent!</h3>
                <p className="mt-2 text-sm text-app-muted max-w-sm">
                  Thanks for reaching out. We'll review your message and get back to you within 24 hours.
                </p>
                <button
                  type="button"
                  onClick={() => setSent(false)}
                  className="mt-8 rounded-xl border border-app-line px-6 py-2.5 text-sm text-app-soft transition hover:bg-app-surface"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-app-soft">Full name</label>
                    <input id="name" {...register('name')} placeholder="Jane Doe"
                      className="mt-1.5 block w-full rounded-xl border border-app-line bg-app-surface px-4 py-2.5 text-sm text-app-fg placeholder:text-app-muted transition focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/20" />
                    {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>}
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-app-soft">Email</label>
                    <input id="email" type="email" {...register('email')} placeholder="jane@company.com"
                      className="mt-1.5 block w-full rounded-xl border border-app-line bg-app-surface px-4 py-2.5 text-sm text-app-fg placeholder:text-app-muted transition focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/20" />
                    {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-app-soft">Subject</label>
                  <input id="subject" {...register('subject')} placeholder="How can we help?"
                    className="mt-1.5 block w-full rounded-xl border border-app-line bg-app-surface px-4 py-2.5 text-sm text-app-fg placeholder:text-app-muted transition focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/20" />
                  {errors.subject && <p className="mt-1 text-xs text-red-400">{errors.subject.message}</p>}
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-app-soft">Message</label>
                  <textarea id="message" rows={5} {...register('message')} placeholder="Tell us more about what you're looking for..."
                    className="mt-1.5 block w-full rounded-xl border border-app-line bg-app-surface px-4 py-2.5 text-sm text-app-fg placeholder:text-app-muted transition focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 resize-none" />
                  {errors.message && <p className="mt-1 text-xs text-red-400">{errors.message.message}</p>}
                </div>

                <button type="submit" disabled={loading}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-2.5 text-sm font-semibold text-app-fg shadow-lg shadow-cyan-500/20 transition hover:shadow-cyan-500/30 disabled:opacity-50">
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  {loading ? 'Sending...' : 'Send message'}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default ContactPage
