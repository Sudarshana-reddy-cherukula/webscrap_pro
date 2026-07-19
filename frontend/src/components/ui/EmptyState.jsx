function EmptyState({ icon = '⚡', title, text }) {
  return (
    <div className="rounded-3xl border border-border bg-card p-8 text-center text-app-muted shadow-xl">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-3xl bg-app-elevated text-2xl">
        {icon}
      </div>
      <h3 className="mb-2 text-xl font-semibold text-app-fg">{title}</h3>
      <p className="text-sm leading-6 text-app-muted">{text}</p>
    </div>
  )
}

export default EmptyState
