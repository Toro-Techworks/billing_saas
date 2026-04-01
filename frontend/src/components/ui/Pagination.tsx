type PaginationProps = {
  currentPage: number
  lastPage: number
  onPageChange: (page: number) => void
}

export default function Pagination({
  currentPage,
  lastPage,
  onPageChange,
}: PaginationProps) {
  const pages: (number | 'ellipsis')[] = []
  const show = 2
  if (lastPage <= 7) {
    for (let i = 1; i <= lastPage; i++) pages.push(i)
  } else {
    pages.push(1)
    if (currentPage > 3) pages.push('ellipsis')
    for (
      let i = Math.max(2, currentPage - show);
      i <= Math.min(lastPage - 1, currentPage + show);
      i++
    ) {
      if (!pages.includes(i)) pages.push(i)
    }
    if (currentPage < lastPage - 2) pages.push('ellipsis')
    if (lastPage > 1) pages.push(lastPage)
  }

  return (
    <nav className="flex flex-wrap items-center gap-2" aria-label="Pagination">
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-50"
      >
        Previous
      </button>
      <div className="flex gap-1">
        {pages.map((p, i) =>
          p === 'ellipsis' ? (
            <span key={`e-${i}`} className="px-3 py-2 text-slate-400">
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              className={`min-w-[2.25rem] rounded-xl border bg-white px-3 py-2 text-sm font-medium shadow-sm ${
                p === currentPage
                  ? 'border-indigo-600 bg-indigo-600 text-white'
                  : 'border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {p}
            </button>
          )
        )}
      </div>
      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= lastPage}
        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-50"
      >
        Next
      </button>
    </nav>
  )
}
