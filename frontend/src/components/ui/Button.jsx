const VARIANTS = {
  primary: 'bg-indigo-500 text-white hover:bg-indigo-400 focus:ring-indigo-500',
  secondary: 'bg-slate-800 text-slate-100 hover:bg-slate-700 focus:ring-slate-500',
  ghost: 'bg-transparent text-slate-200 hover:bg-slate-100 focus:ring-slate-500',
}

function Button({ variant = 'primary', className = '', type = 'button', ...props }) {
  const variantClasses = VARIANTS[variant] || VARIANTS.primary

  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold transition focus:outline-none focus:ring-2 ${variantClasses} ${className}`.trim()}
      {...props}
    />
  )
}

export default Button
