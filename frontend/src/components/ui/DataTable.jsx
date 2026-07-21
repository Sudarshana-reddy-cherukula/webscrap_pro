import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { ArrowUpDown, ArrowUp, ArrowDown, Search as SearchIcon } from 'lucide-react'
import { Pagination } from './Pagination'
import { Skeleton } from './Skeleton'
import EmptyState from './EmptyState'

function DataTable({
  columns,
  data,
  loading = false,
  error = null,
  emptyTitle = 'No data',
  emptyText = 'No records found.',
  emptyIcon = null,
  searchable = false,
  searchPlaceholder = 'Search...',
  pageSize = 10,
  onRowClick,
  keyExtractor = (row, i) => i,
}) {
  const [sortKey, setSortKey] = useState(null)
  const [sortDir, setSortDir] = useState('asc')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const toggleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const filtered = useMemo(() => {
    if (!search) return data
    const q = search.toLowerCase()
    return data.filter((row) =>
      columns.some((col) => {
        const val = col.accessor ? row[col.accessor] : ''
        return String(val).toLowerCase().includes(q)
      })
    )
  }, [data, search, columns])

  const sorted = useMemo(() => {
    if (!sortKey) return filtered
    return [...filtered].sort((a, b) => {
      const aVal = a[sortKey]
      const bVal = b[sortKey]
      if (aVal == null) return 1
      if (bVal == null) return -1
      const cmp = typeof aVal === 'string' ? aVal.localeCompare(bVal) : aVal - bVal
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [filtered, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const paginated = sorted.slice((page - 1) * pageSize, page * pageSize)

  if (error) {
    return (
      <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-center">
        <p className="text-sm text-red-400">{error}</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 p-4">
          {columns.map((col) => (
            <Skeleton key={col.accessor} className="h-4 flex-1" />
          ))}
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4">
            {columns.map((col) => (
              <Skeleton key={col.accessor} className="h-4 flex-1" />
            ))}
          </div>
        ))}
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="py-8">
        <EmptyState
          icon={emptyIcon || SearchIcon}
          title={emptyTitle}
          text={emptyText}
        />
      </div>
    )
  }

  const SortIcon = ({ column }) => {
    if (sortKey !== column.accessor) return <ArrowUpDown size={12} className="text-zinc-600" />
    return sortDir === 'asc' ? <ArrowUp size={12} className="text-cyan-400" /> : <ArrowDown size={12} className="text-cyan-400" />
  }

  return (
    <div className="space-y-4">
      {searchable && (
        <div className="relative max-w-xs">
          <SearchIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-app-muted pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            placeholder={searchPlaceholder}
            className="w-full rounded-xl border border-app-line bg-app-surface pl-9 pr-4 py-2.5 text-sm text-app-fg placeholder:text-app-muted transition focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
          />
        </div>
      )}

      <div className="rounded-xl border border-app-line bg-app-surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-app-line">
                {columns.map((col) => (
                  <th
                    key={col.accessor}
                    className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-app-muted ${
                      col.sortable !== false ? 'cursor-pointer hover:text-app-soft select-none' : ''
                    }`}
                    onClick={() => col.sortable !== false && toggleSort(col.accessor)}
                  >
                    <div className="flex items-center gap-1.5">
                      {col.header}
                      {col.sortable !== false && <SortIcon column={col} />}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-app-line/50">
              {paginated.map((row, i) => (
                <motion.tr
                  key={keyExtractor(row, i)}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: i * 0.02 }}
                  className={`transition-colors ${
                    onRowClick ? 'cursor-pointer hover:bg-app-surface' : ''
                  }`}
                  onClick={() => onRowClick && onRowClick(row)}
                >
                  {columns.map((col) => (
                    <td key={col.accessor} className="px-4 py-3 text-sm text-app-soft whitespace-nowrap">
                      {col.render ? col.render(row[col.accessor], row) : row[col.accessor] ?? '—'}
                    </td>
                  ))}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-app-muted">
        <span>
          Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, sorted.length)} of {sorted.length}
        </span>
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </div>
  )
}

export { DataTable }
