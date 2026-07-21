import { cn } from '@/lib/utils'

const variants = {
  default: 'bg-app-elevated text-app-muted border-app-line',
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  warning: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  error: 'bg-red-50 text-red-700 border-red-200',
  info: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  purple: 'bg-violet-50 text-violet-700 border-violet-200',
  amber: 'bg-indigo-50 text-indigo-700 border-indigo-200',
}

function Badge({ children, variant = 'default', className }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-medium',
        variants[variant] || variants.default,
        className
      )}
    >
      {children}
    </span>
  )
}

export { Badge }
