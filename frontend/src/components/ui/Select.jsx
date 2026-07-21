function Select({ id, label, options = [], className = '', ...props }) {
  return (
    <div className="space-y-2">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-app-fg">
          {label}
        </label>
      )}
      <select
        id={id}
        className={`w-full rounded-2xl border border-border bg-app-elevated px-4 py-3 text-sm text-app-fg outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/20 ${className}`.trim()}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}

export default Select
