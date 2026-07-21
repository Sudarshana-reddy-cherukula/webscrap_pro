import { motion } from 'framer-motion'
import { TrendingUp, Activity, Globe, FileText, ArrowUp, ArrowDown } from 'lucide-react'

const stats = [
  { label: 'Pages Today', value: '12,847', change: '+12.5%', positive: true, icon: Globe },
  { label: 'PDFs Processed', value: '3,421', change: '+8.2%', positive: true, icon: FileText },
  { label: 'Active Jobs', value: '47', change: '-3.1%', positive: false, icon: Activity },
  { label: 'API Calls', value: '89.2K', change: '+24.3%', positive: true, icon: TrendingUp },
]

const recentJobs = [
  { url: 'example.com/products', status: 'Completed', pages: 342, time: '2m 14s', data: 'Completed' },
  { url: 'docs.company.com/manual.pdf', status: 'Processing', pages: '—', time: 'In progress', data: 'Extracting' },
  { url: 'pricelist.xlsx', status: 'Completed', pages: 1, time: '8s', data: 'Exported' },
  { url: 'news-site.com/articles', status: 'Failed', pages: 0, time: '—', data: 'Error' },
]

function DashboardPreview() {
  return (
    <section id="dashboard" className="relative border-t border-app-line py-24">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_left,rgba(139,92,246,0.04),transparent_50%)]" />
      <div className="absolute inset-0 bg-grid opacity-30" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600">
            Dashboard
          </p>
          <h2 className="mt-4 text-balance text-3xl sm:text-4xl font-bold text-app-fg">
            Beautiful real-time analytics
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-app-muted text-sm sm:text-base">
            Monitor every aspect of your data pipeline with a clean, intuitive dashboard.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="mt-16 relative"
        >
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-indigo-500/10 via-violet-500/5 to-transparent blur-3xl" />
          <div className="relative rounded-2xl border border-app-line bg-white/90 backdrop-blur-2xl overflow-hidden shadow-2xl shadow-indigo-500/5">
            <div className="border-b border-app-line px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-xs font-bold text-white">
                  D
                </div>
                <div>
                  <p className="text-sm font-medium text-app-fg">Dashboard Overview</p>
                  <p className="text-xs text-app-muted">Real-time metrics</p>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                <div className="h-2 w-2 rounded-full bg-indigo-400" />
                <div className="h-2 w-2 rounded-full bg-red-400" />
              </div>
            </div>

            <div className="p-6">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
                {stats.map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 + i * 0.05 }}
                    className="rounded-xl border border-app-line bg-white p-4 hover:border-app-line transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-app-muted">{stat.label}</span>
                      <stat.icon size={14} className="text-app-muted" />
                    </div>
                    <p className="text-xl font-bold text-app-fg">{stat.value}</p>
                    <span className={`inline-flex items-center gap-0.5 text-xs ${stat.positive ? 'text-emerald-600' : 'text-red-500'}`}>
                      {stat.positive ? <ArrowUp size={10} /> : <ArrowDown size={10} />}
                      {stat.change}
                    </span>
                  </motion.div>
                ))}
              </div>

              <div className="rounded-xl border border-app-line bg-white overflow-hidden">
                <div className="px-4 py-3 border-b border-app-line">
                  <p className="text-xs font-medium text-app-muted uppercase tracking-wider">Recent Jobs</p>
                </div>
                <div className="divide-y divide-app-line">
                  {recentJobs.map((job, i) => (
                    <motion.div
                      key={job.url}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center justify-between px-4 py-3 text-sm hover:bg-indigo-50/50 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                          job.status === 'Completed' ? 'bg-emerald-500' :
                          job.status === 'Processing' ? 'bg-indigo-400' :
                          'bg-red-400'
                        }`} />
                        <span className="text-app-soft truncate">{job.url}</span>
                      </div>
                      <div className="flex items-center gap-6 text-xs text-app-muted shrink-0">
                        <span>{job.pages}{typeof job.pages === 'number' ? ' pages' : ''}</span>
                        <span>{job.time}</span>
                        <span className={`${
                          job.data === 'Completed' ? 'text-emerald-600' :
                          job.data === 'Error' ? 'text-red-500' :
                          'text-indigo-600'
                        }`}>{job.data}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default DashboardPreview
