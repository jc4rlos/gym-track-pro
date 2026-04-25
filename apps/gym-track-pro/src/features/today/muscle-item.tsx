import { useState } from 'react'
import { cn } from '@/lib/utils'
import { useToggleMuscle, useUpdateSets, type SessionMuscle } from './use-today'

function timeAgo(isoString: string) {
  const diff = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000)
  if (diff < 60) return 'Completado hace un momento'
  const mins = Math.floor(diff / 60)
  if (mins < 60) return `Completado hace ${mins} min`
  const hrs = Math.floor(mins / 60)
  return `Completado hace ${hrs} h`
}

type Props = {
  item: SessionMuscle
}

export const MuscleItem = ({ item }: Props) => {
  const toggle = useToggleMuscle()
  const updateSets = useUpdateSets()
  const [sets, setSets] = useState(item.sets_count ?? 3)

  const done = item.is_completed

  const handleToggle = () => {
    toggle.mutate({ id: item.id, isCompleted: !done, setsCount: sets })
  }

  const handleSets = (delta: number) => {
    const next = Math.max(1, Math.min(20, sets + delta))
    setSets(next)
    if (done) updateSets.mutate({ id: item.id, setsCount: next })
  }

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-[14px] p-3',
        done ? 'bg-[#0a150a]' : 'border-border bg-card border'
      )}
    >
      {/* Left accent bar */}
      <div
        className='h-9 w-1 shrink-0 rounded-full'
        style={{ background: done ? '#a3e635' : '#a3e635' }}
      />

      {/* Checkbox */}
      <button
        onClick={handleToggle}
        disabled={toggle.isPending}
        className={cn(
          'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
          done ? 'border-primary bg-primary' : 'border-border bg-background'
        )}
      >
        {done && (
          <svg width='11' height='11' viewBox='0 0 10 10'>
            <polyline
              points='1.5,5 4,7.5 8.5,2.5'
              fill='none'
              stroke='#0f0f0f'
              strokeWidth='1.9'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
          </svg>
        )}
      </button>

      {/* Name + status */}
      <div className='min-w-0 flex-1'>
        <p
          className={cn(
            'text-[14px] font-semibold',
            done ? 'text-[#4a7a4a] line-through' : 'text-foreground'
          )}
        >
          {item.muscle_groups?.name_es ?? '—'}
        </p>
        <p
          className={cn('text-[11px]', done ? 'text-[#3a5a3a]' : 'text-muted')}
        >
          {done && item.completed_at ? timeAgo(item.completed_at) : 'Pendiente'}
        </p>
      </div>

      {/* Sets badge + stepper */}
      {done ? (
        <div className='flex items-center gap-1.5'>
          <button
            onClick={() => handleSets(-1)}
            className='flex h-6 w-6 items-center justify-center rounded-full text-[#4ade80] hover:bg-[#1a3a1a]'
          >
            <svg width='10' height='10' viewBox='0 0 10 10'>
              <line
                x1='2'
                y1='5'
                x2='8'
                y2='5'
                stroke='currentColor'
                strokeWidth='1.8'
                strokeLinecap='round'
              />
            </svg>
          </button>
          <div className='flex min-w-9 flex-col items-center rounded-lg border border-[#1a3a1a] bg-[#0a150a] px-2.5 py-1'>
            <span className='font-display text-[17px] leading-none text-[#4ade80]'>
              {sets}
            </span>
          </div>
          <button
            onClick={() => handleSets(1)}
            className='flex h-6 w-6 items-center justify-center rounded-full text-[#4ade80] hover:bg-[#1a3a1a]'
          >
            <svg width='10' height='10' viewBox='0 0 10 10'>
              <line
                x1='5'
                y1='2'
                x2='5'
                y2='8'
                stroke='currentColor'
                strokeWidth='1.8'
                strokeLinecap='round'
              />
              <line
                x1='2'
                y1='5'
                x2='8'
                y2='5'
                stroke='currentColor'
                strokeWidth='1.8'
                strokeLinecap='round'
              />
            </svg>
          </button>
          <span className='text-[10px] text-[#3a6a3a]'>series</span>
        </div>
      ) : (
        <div className='border-border bg-background flex min-w-9 items-center justify-center rounded-lg border px-2.5 py-1'>
          <span className='font-display text-border text-[17px] leading-none'>
            —
          </span>
        </div>
      )}
    </div>
  )
}
