function Toast({ message, type = 'success' }) {
  if (!message) return null

  const tone =
    type === 'error'
      ? 'bg-rose-500 text-app-fg'
      : type === 'warning'
      ? 'bg-amber-500 text-slate-950'
      : 'bg-emerald-500 text-slate-950'

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-6 right-6 z-50 max-w-sm rounded-3xl px-5 py-3 shadow-2xl shadow-slate-950/30 ${tone}`}
    >
      {message}
    </div>
  )
}

export default Toast
