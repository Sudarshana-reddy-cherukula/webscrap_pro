function Card({ children, className = '' }) {
  return (
    <div className={`rounded-3xl border border-border bg-card p-6 shadow-xl ${className}`.trim()}>{children}</div>
  )
}

export default Card
