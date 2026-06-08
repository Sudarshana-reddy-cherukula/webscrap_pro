function Card({ children, className = '' }) {
  return (
    <div className={`rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/20 ${className}`.trim()}>{children}</div>
  )
}

export default Card
