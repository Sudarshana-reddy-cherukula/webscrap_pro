import { Link } from 'react-router-dom'
import Button from '../components/ui/Button'

function NotFoundPage() {
  return (
    <div className="grid min-h-[70vh] place-items-center text-center">
      <div className="space-y-6 rounded-[2rem] border border-slate-200 dark:border-slate-800/90 bg-white dark:bg-slate-950/80 p-12 shadow-2xl shadow-slate-200/40 dark:shadow-slate-950/40">
        <p className="text-7xl">404</p>
        <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">Page not found</h1>
        <p className="text-slate-500 dark:text-slate-400">The route you are looking for does not exist or has been moved.</p>
        <Link to="/">
          <Button>Go back home</Button>
        </Link>
      </div>
    </div>
  )
}

export default NotFoundPage
