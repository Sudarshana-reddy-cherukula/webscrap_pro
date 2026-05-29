import { Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'

function SearchInput({ value, onChange, placeholder = 'Search...', className }) {
  return (
    <div className={cn('relative', className)}>
      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-app-muted pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-app-line bg-app-surface pl-9 pr-8 py-2.5 text-sm text-app-fg placeholder:text-app-muted transition focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-app-muted hover:text-app-soft transition"
        >
          <X size={14} />
        </button>
      )}
    </div>
  )
}

export { SearchInput }
