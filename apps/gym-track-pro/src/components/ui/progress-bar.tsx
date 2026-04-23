import { cn } from '@/lib/utils'

type ProgressBarProps = {
  value: number
  max?: number
  className?: string
  height?: 'xs' | 'sm' | 'md'
}

const heightClass = { xs: 'h-1', sm: 'h-1.5', md: 'h-2' }

const barColor = (pct: number) => {
  if (pct >= 100) return 'bg-danger'
  if (pct >= 80) return 'bg-amber'
  return 'bg-primary'
}

export const ProgressBar = ({
  value,
  max = 100,
  className,
  height = 'sm',
}: ProgressBarProps) => {
  const pct = Math.min((value / max) * 100, 100)

  return (
    <div
      className={cn(
        'w-full rounded-full bg-[#F3F4F6]',
        heightClass[height],
        className
      )}
    >
      <div
        className={cn(
          'h-full rounded-full transition-all duration-500',
          barColor(pct)
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}
