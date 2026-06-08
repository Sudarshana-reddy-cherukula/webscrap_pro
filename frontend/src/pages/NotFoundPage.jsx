import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

function NotFoundPage() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <p className="text-8xl font-bold text-app-fg">404</p>
        <h1 className="mt-4 text-2xl font-bold text-app-fg">Page not found</h1>
        <p className="mt-2 text-app-muted">The page you&apos;re looking for doesn&apos;t exist.</p>
        <Link
          to="/"
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-amber-500/20 transition hover:shadow-amber-500/30"
        >
          Go home
        </Link>
      </motion.div>
    </div>
  )
}

export default NotFoundPage
