import { cn } from '@/lib/utils'

export type GridFilterOption = {
  id: string
  label: string
  icon?: string
  count?: number
}

type Props = {
  options: GridFilterOption[]
  selectedIds: string[]
  onToggle: (id: string) => void
  columns?: 2 | 3
}

export const ExerciseFilterGrid = ({
  options,
  selectedIds,
  onToggle,
  columns = 3,
}: Props) => {
  return (
    <div className='px-5 py-3'>
      <div
        className={cn(
          'grid gap-2',
          columns === 2 ? 'grid-cols-2' : 'grid-cols-3'
        )}
      >
        {options.map(({ id, label, icon, count }) => {
          const isSelected = selectedIds.includes(id)
          return (
            <button
              key={id}
              onClick={() => onToggle(id)}
              className={cn(
                'flex flex-col items-center justify-center gap-1.5 rounded-[12px] border-2 p-3 transition-colors',
                isSelected
                  ? 'bg-primary-light border-primary text-primary'
                  : 'border-border bg-card text-foreground hover:border-primary'
              )}
            >
              {icon && <span className='text-2xl'>{icon}</span>}
              <span className='text-center text-[12px] leading-tight font-semibold'>
                {label}
              </span>
              {count && (
                <span className='text-muted text-[10px]'>
                  {count} {count === 1 ? 'ej.' : 'ejs.'}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
