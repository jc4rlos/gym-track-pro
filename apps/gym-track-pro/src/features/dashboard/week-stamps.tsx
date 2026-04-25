import { Check, Dumbbell, X, Circle } from 'lucide-react'
import { cn } from '@/lib/utils'

type Props = {
  weekDays: Date[]
  trainedDates: Set<string>
}

const DAY_LABELS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

export const WeekStamps = ({ weekDays, trainedDates }: Props) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayStr = today.toISOString().slice(0, 10)

  return (
    <div className='flex gap-1.5'>
      {weekDays.map((day, i) => {
        const dateStr = day.toISOString().slice(0, 10)
        const isToday = dateStr === todayStr
        const isTrained = trainedDates.has(dateStr)
        const isPast = day < today && !isToday

        return (
          <div key={i} className='flex flex-1 flex-col items-center gap-1'>
            <div
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-full',
                isTrained
                  ? 'bg-primary text-primary-foreground'
                  : isToday
                    ? 'bg-primary-light border-primary text-primary border-2'
                    : isPast
                      ? 'border border-[#3a1a1a] bg-[#180a0a] text-[#4a2a2a]'
                      : 'border-border bg-card border'
              )}
            >
              {isTrained ? (
                <Check size={14} strokeWidth={2.5} stroke='#0f0f0f' />
              ) : isToday ? (
                <Dumbbell size={14} strokeWidth={2} />
              ) : isPast ? (
                <X size={13} strokeWidth={2} />
              ) : (
                <Circle size={8} strokeWidth={1.5} className='text-border' />
              )}
            </div>
            <span
              className={cn(
                'text-[10px] font-medium',
                isTrained || isToday
                  ? 'text-primary'
                  : isPast
                    ? 'text-[#3a2a2a]'
                    : 'text-soft'
              )}
            >
              {DAY_LABELS[i]}
            </span>
          </div>
        )
      })}
    </div>
  )
}
