import { Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'

function SearchInput({ value, onChange, placeholder = 'Search...', className }) {
  return (
    <div className={cn('relative', className)}>
      <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-12 w-full rounded-xl border border-slate-600 bg-slate-800 pl-11 pr-10 py-3 text-sm text-white placeholder:text-slate-400 transition-all duration-200 outline-none hover:border-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition"
        >
          <X size={14} />
        </button>
      )}
    </div>
  )
}

export { SearchInput }
