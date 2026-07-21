function Select({ id, label, options = [], className = '', ...props }) {
  return (
    <div className="space-y-2">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-white">
          {label}
        </label>
      )}
      <select
        id={id}
        className={`h-12 w-full rounded-xl border border-slate-600 bg-slate-800 px-4 py-3 text-sm text-white placeholder:text-slate-400 transition-all duration-200 outline-none hover:border-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 disabled:bg-slate-800 disabled:text-white disabled:opacity-100 disabled:cursor-not-allowed ${className}`.trim()}
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
