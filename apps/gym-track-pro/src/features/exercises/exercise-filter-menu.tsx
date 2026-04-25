import { useState, useRef, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export type FilterMenuOption = {
  id: string
  label: string
  icon?: string
  count?: number
}

type Props = {
  options: FilterMenuOption[]
  selectedId?: string
  onSelect: (id: string) => void
  variant?: 'pills' | 'tabs'
  showArrows?: boolean
}

export const ExerciseFilterMenu = ({
  options,
  selectedId,
  onSelect,
  variant = 'pills',
  showArrows = true,
}: Props) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
    }
  }

  useEffect(() => {
    checkScroll()
    window.addEventListener('resize', checkScroll)
    return () => window.removeEventListener('resize', checkScroll)
  }, [])

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 150
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      })
      setTimeout(checkScroll, 300)
    }
  }

  return (
    <div className='relative px-5 py-2.5'>
      {showArrows && canScrollLeft && (
        <button
          onClick={() => scroll('left')}
          className='from-background absolute top-1/2 left-0 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-gradient-to-r to-transparent'
        >
          <ChevronLeft size={16} className='text-primary' />
        </button>
      )}

      <div
        ref={scrollContainerRef}
        onScroll={checkScroll}
        className='scrollbar-hide flex gap-2 overflow-x-auto'
      >
        <div className='flex min-w-max gap-2 px-2'>
          {options.map(({ id, label, icon, count }) => (
            <button
              key={id}
              onClick={() => onSelect(id)}
              className={cn(
                'flex items-center gap-1.5 rounded-full whitespace-nowrap transition-all',
                variant === 'pills'
                  ? selectedId === id
                    ? 'bg-primary text-primary-foreground px-3.5 py-1.5 text-[12px] font-bold'
                    : 'border-border bg-card text-muted hover:border-primary border px-3.5 py-1.5 text-[12px] font-medium'
                  : selectedId === id
                    ? 'border-primary text-primary border-b-2 px-3 py-2 text-[13px] font-bold'
                    : 'text-muted hover:text-foreground border-b-2 border-transparent px-3 py-2 text-[13px] font-medium'
              )}
            >
              {icon && <span className='text-base'>{icon}</span>}
              <span>{label}</span>
              {count && selectedId === id && (
                <span className='ml-1 text-[10px] opacity-75'>({count})</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {showArrows && canScrollRight && (
        <button
          onClick={() => scroll('right')}
          className='from-background absolute top-1/2 right-0 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-gradient-to-l to-transparent'
        >
          <ChevronRight size={16} className='text-primary' />
        </button>
      )}
    </div>
  )
}
