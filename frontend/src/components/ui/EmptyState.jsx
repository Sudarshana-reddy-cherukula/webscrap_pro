function EmptyState({ icon = '⚡', title, text }) {
  return (
    <div className="rounded-3xl border border-slate-800/80 bg-slate-900/80 p-8 text-center text-slate-300 shadow-xl shadow-slate-950/20">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-3xl bg-slate-800 text-2xl">
        {icon}
      </div>
      <h3 className="mb-2 text-xl font-semibold text-app-fg">{title}</h3>
      <p className="text-sm leading-6 text-slate-400">{text}</p>
    </div>
  )
}

export default EmptyState
