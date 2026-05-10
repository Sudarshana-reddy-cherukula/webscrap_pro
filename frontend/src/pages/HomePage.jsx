import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'

const featureCards = [
  {
    title: 'Web Scraping',
    description: 'Capture structured website content, metadata, links, and images from live sources.',
    icon: '🕸️',
  },
  {
    title: 'PDF Processing',
    description: 'Upload PDFs, extract text, metadata, images, and convert files to TXT/DOCX.',
    icon: '📄',
  },
  {
    title: 'Export Ready',
    description: 'Download results in JSON, CSV, TXT, or PDF-ready export formats.',
    icon: '📤',
  },
]

function HomePage() {
  const navigate = useNavigate()

  return (
    <div className="space-y-12 pb-10">
      <section className="rounded-[2rem] border border-slate-200 dark:border-slate-800/90 bg-white dark:bg-slate-950/80 p-10 shadow-2xl shadow-slate-200/40 dark:shadow-slate-950/40">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_minmax(280px,0.8fr)] lg:items-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="space-y-6"
          >
            <p className="inline-flex rounded-full bg-indigo-500/15 px-4 py-2 text-sm uppercase tracking-[0.35em] text-indigo-600 dark:text-indigo-300">
              Final year SaaS
            </p>
            <h1 className="max-w-3xl text-5xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-6xl">
              Modern web scraping and PDF processing for real SaaS delivery.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
              Build, analyze, and export structured data from both websites and PDF documents with a clean, production-ready frontend.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button onClick={() => navigate('/register')}>Start free trial</Button>
              <Button variant="secondary" onClick={() => navigate('/login')}>
                Sign in
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="rounded-[2rem] bg-slate-100 dark:bg-slate-900/70 p-8 shadow-2xl shadow-slate-200/40 dark:shadow-slate-950/40"
          >
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Launch in production</p>
            <div className="mt-6 space-y-4">
              <div className="rounded-3xl border border-slate-200 dark:border-slate-800/90 bg-white dark:bg-slate-950/80 p-6">
                <p className="text-sm text-slate-500 dark:text-slate-400">Reliable backend-driven analytics</p>
                <p className="mt-3 text-3xl font-semibold text-slate-900 dark:text-white">API-first</p>
              </div>
              <div className="rounded-3xl border border-slate-200 dark:border-slate-800/90 bg-white dark:bg-slate-950/80 p-6">
                <p className="text-sm text-slate-500 dark:text-slate-400">Responsive UI for desktop, tablet, and mobile</p>
                <p className="mt-3 text-3xl font-semibold text-slate-900 dark:text-white">Fully responsive</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {featureCards.map((feature) => (
          <Card key={feature.title} className="p-8">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-indigo-500/10 text-2xl">
              {feature.icon}
            </div>
            <h2 className="text-xl font-semibold text-white">{feature.title}</h2>
            <p className="mt-3 text-slate-400">{feature.description}</p>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card className="p-8">
          <h2 className="text-2xl font-semibold text-white">Use real backend APIs</h2>
          <p className="mt-4 text-slate-400">
            Use environment-driven API routing with {<span className="font-semibold text-white">VITE_API_URL</span>} and secure JWT session handling.
          </p>
        </Card>
        <Card className="p-8">
          <h2 className="text-2xl font-semibold text-white">Built for delivery</h2>
          <p className="mt-4 text-slate-400">
            Modular, maintainable, and performance-minded React architecture without Redux or excessive complexity.
          </p>
        </Card>
      </section>
    </div>
  )
}

export default HomePage
