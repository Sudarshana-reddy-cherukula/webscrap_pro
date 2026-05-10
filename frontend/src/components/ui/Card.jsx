function Card({ children, className = '' }) {
  return (
    <div className={`rounded-3xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900/80 p-6 shadow-xl shadow-slate-200/20 dark:shadow-slate-950/20 ${className}`.trim()}>{children}</div>
  )
}

export default Card
