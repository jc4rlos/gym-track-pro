import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

type Props = {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

export const ExercisePagination = ({
  page,
  totalPages,
  onPageChange,
}: Props) => {
  const getPageNumbers = () => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i)
    }

    const pages: (number | string)[] = []
    const start = Math.max(0, page - 2)
    const end = Math.min(totalPages - 1, page + 2)

    if (start > 0) {
      pages.push(0)
      if (start > 1) pages.push('...')
    }

    for (let i = start; i <= end; i++) {
      pages.push(i)
    }

    if (end < totalPages - 1) {
      if (end < totalPages - 2) pages.push('...')
      pages.push(totalPages - 1)
    }

    return pages
  }

  const pages = getPageNumbers()

  return (
    <div className='flex items-center justify-center gap-2 px-5 py-6'>
      <button
        onClick={() => onPageChange(Math.max(0, page - 1))}
        disabled={page === 0}
        className={cn(
          'flex h-9 w-9 items-center justify-center rounded-[8px] border transition-colors',
          page === 0
            ? 'text-soft cursor-not-allowed border-border bg-card'
            : 'hover:bg-card-dark border-border bg-card text-foreground hover:border-primary'
        )}
      >
        <ChevronLeft size={16} />
      </button>

      <div className='flex gap-1'>
        {pages.map((p, idx) => {
          if (typeof p === 'string') {
            return (
              <div
                key={`dots-${idx}`}
                className='flex h-9 w-9 items-center justify-center text-muted'
              >
                {p}
              </div>
            )
          }

          return (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-[8px] border text-[13px] font-medium transition-colors',
                page === p
                  ? 'border-primary bg-primary font-bold text-primary-foreground'
                  : 'hover:bg-card-dark border-border bg-card text-foreground hover:border-primary'
              )}
            >
              {p + 1}
            </button>
          )
        })}
      </div>

      <button
        onClick={() => onPageChange(Math.min(totalPages - 1, page + 1))}
        disabled={page === totalPages - 1}
        className={cn(
          'flex h-9 w-9 items-center justify-center rounded-[8px] border transition-colors',
          page === totalPages - 1
            ? 'text-soft cursor-not-allowed border-border bg-card'
            : 'hover:bg-card-dark border-border bg-card text-foreground hover:border-primary'
        )}
      >
        <ChevronRight size={16} />
      </button>
    </div>
  )
}
