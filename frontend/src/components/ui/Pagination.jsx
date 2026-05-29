import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null

  const pages = []
  const maxVisible = 5
  let start = Math.max(1, currentPage - Math.floor(maxVisible / 2))
  let end = Math.min(totalPages, start + maxVisible - 1)

  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1)
  }

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  return (
    <nav className="flex items-center justify-center gap-1" aria-label="Pagination">
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="rounded-lg border border-app-line p-2 text-app-muted transition hover:bg-app-surface hover:text-app-soft disabled:opacity-30 disabled:cursor-not-allowed"
        aria-label="Previous page"
      >
        <ChevronLeft size={14} />
      </button>

      {start > 1 && (
        <>
          <button
            type="button"
            onClick={() => onPageChange(1)}
            className="rounded-lg px-3 py-1.5 text-xs text-app-muted transition hover:bg-app-surface hover:text-app-soft"
          >
            1
          </button>
          {start > 2 && <span className="px-1 text-zinc-600 text-xs">...</span>}
        </>
      )}

      {pages.map((page) => (
        <button
          key={page}
          type="button"
          onClick={() => onPageChange(page)}
          className={cn(
            'rounded-lg px-3 py-1.5 text-xs font-medium transition',
            page === currentPage
              ? 'bg-cyan-500/20 text-cyan-300'
              : 'text-app-muted hover:bg-app-surface hover:text-app-soft'
          )}
          aria-current={page === currentPage ? 'page' : undefined}
        >
          {page}
        </button>
      ))}

      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className="px-1 text-zinc-600 text-xs">...</span>}
          <button
            type="button"
            onClick={() => onPageChange(totalPages)}
            className="rounded-lg px-3 py-1.5 text-xs text-app-muted transition hover:bg-app-surface hover:text-app-soft"
          >
            {totalPages}
          </button>
        </>
      )}

      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="rounded-lg border border-app-line p-2 text-app-muted transition hover:bg-app-surface hover:text-app-soft disabled:opacity-30 disabled:cursor-not-allowed"
        aria-label="Next page"
      >
        <ChevronRight size={14} />
      </button>
    </nav>
  )
}

export { Pagination }
