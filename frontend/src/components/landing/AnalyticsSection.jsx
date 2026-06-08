import { motion } from 'framer-motion'
import { BarChart3, LineChart, PieChart, TrendingUp } from 'lucide-react'

const metrics = [
  {
    icon: BarChart3,
    title: 'Volume Metrics',
    description: 'Track pages scraped, PDFs processed, and data exported over time with granular breakdowns.',
    gradient: 'from-emerald-500 to-teal-600',
  },
  {
    icon: LineChart,
    title: 'Performance Trends',
    description: 'Monitor processing speed, success rates, and queue times with interactive time-series charts.',
    gradient: 'from-teal-500 to-cyan-600',
  },
  {
    icon: PieChart,
    title: 'Resource Allocation',
    description: 'Visualize usage by project, team member, or data source. Optimize your resource distribution.',
    gradient: 'from-green-500 to-emerald-600',
  },
  {
    icon: TrendingUp,
    title: 'Cost Analytics',
    description: 'Track spending across projects, set budget alerts, and optimize cost per page scraped.',
    gradient: 'from-emerald-500 to-green-600',
  },
]

const insights = [
  { label: 'Avg. Processing Time', value: '1.2s', change: '-15%', per: 'per page' },
  { label: 'Success Rate', value: '99.7%', change: '+0.3%', per: 'last 30 days' },
  { label: 'Data Extracted', value: '2.4GB', change: '+42%', per: 'this month' },
  { label: 'Active Projects', value: '18', change: '+3', per: 'this week' },
]

function AnalyticsSection() {
  return (
    <section id="analytics" className="relative border-t border-app-line py-24">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_left,rgba(16,185,129,0.04),transparent_50%)]" />
      <div className="absolute inset-0 bg-grid opacity-30" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-700">
            Analytics
          </p>
          <h2 className="mt-4 text-balance text-3xl sm:text-4xl font-bold text-app-fg">
            Data-driven insights at your fingertips
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-app-muted text-sm sm:text-base">
            Make informed decisions with comprehensive analytics and beautiful visualizations.
          </p>
        </motion.div>

        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric, i) => (
            <motion.div
              key={metric.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: i * 0.05 }}
              className="rounded-2xl border border-app-line bg-white p-6 hover:border-emerald-400/30 transition-all duration-300 hover:-translate-y-1"
            >
              <div className={`mb-4 inline-flex rounded-xl bg-gradient-to-br ${metric.gradient} p-2.5 shadow-lg`}>
                <metric.icon size={20} className="text-white" />
              </div>
              <h3 className="text-base font-semibold text-app-fg">{metric.title}</h3>
              <p className="mt-2 text-sm text-app-muted">{metric.description}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mt-16 rounded-2xl border border-app-line bg-white p-8"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold text-app-fg">Performance Overview</h3>
              <p className="text-sm text-app-muted mt-1">Last 30 days summary</p>
            </div>
            <div className="flex gap-2">
              {[BarChart3, LineChart, PieChart].map((Icon, i) => (
                <div key={i} className="rounded-lg border border-app-line bg-white p-2 text-app-muted hover:bg-amber-50 hover:text-app-nav transition cursor-pointer">
                  <Icon size={14} />
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {insights.map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="rounded-xl border border-app-line bg-white p-4 text-center"
              >
                <p className="text-2xl font-bold text-app-fg">{item.value}</p>
                <p className="text-xs text-app-muted mt-1">{item.label}</p>
                <p className={`text-xs mt-2 ${item.change.startsWith('+') ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {item.change} <span className="text-app-muted">{item.per}</span>
                </p>
              </motion.div>
            ))}
          </div>

          <div className="mt-8 h-32 rounded-xl border border-app-line bg-white p-4 flex items-center justify-center">
            <div className="flex items-center gap-6">
              {[40, 65, 45, 80, 55, 90, 70].map((height, i) => (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  whileInView={{ height }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.05 }}
                  className="w-8 bg-gradient-to-t from-emerald-500/50 to-teal-500/30 rounded-lg"
                  style={{ height }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default AnalyticsSection
