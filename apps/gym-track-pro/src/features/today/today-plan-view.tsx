import { useState } from 'react'
import { BookOpen, Info } from 'lucide-react'
import { cn } from '@/lib/utils'
import type {
  PlanRoutineWithExercises,
  PlanExercise,
} from '@/features/plan/use-weekly-plan'

interface ExerciseRowProps {
  ex: PlanExercise
  checked: boolean
  onToggle: () => void
  onDetail?: (exerciseId: string) => void
}

function ExerciseRow({ ex, checked, onToggle, onDetail }: ExerciseRowProps) {
  const name = ex.exercises?.name_es || ex.exercises?.name || '—'
  const muscle = ex.exercises?.target_muscle

  return (
    <div
      className={cn(
        'flex w-full items-center gap-3 rounded-xl p-3 transition-colors',
        checked
          ? 'border border-primary/20 bg-primary/5'
          : 'border border-border bg-background'
      )}
    >
      <button
        onClick={onToggle}
        className={cn(
          'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
          checked ? 'border-primary bg-primary' : 'border-border bg-transparent'
        )}
      >
        {checked && (
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

      <div className='min-w-0 flex-1'>
        <p
          className={cn(
            'text-sm font-semibold',
            checked && 'text-muted line-through'
          )}
        >
          {name}
        </p>
        <p className='mt-0.5 text-xs text-muted'>
          {ex.sets} series · {ex.reps} reps
          {ex.rest_seconds ? ` · ${ex.rest_seconds}s` : ''}
          {muscle ? ` · ${muscle}` : ''}
        </p>
      </div>

      {onDetail && ex.exercises?.id && (
        <button
          onClick={() => onDetail(ex.exercises!.id)}
          className='shrink-0 rounded-lg p-1.5 text-muted transition-colors hover:bg-primary/10 hover:text-primary'
        >
          <Info size={15} />
        </button>
      )}
    </div>
  )
}

interface TodayPlanViewProps {
  routines: PlanRoutineWithExercises[]
  checked: Set<string>
  onToggle: (exerciseId: string) => void
  onExerciseDetail?: (exerciseId: string) => void
}

export function TodayPlanView({
  routines,
  checked,
  onToggle,
  onExerciseDetail,
}: TodayPlanViewProps) {
  const [expanded, setExpanded] = useState<Set<string>>(
    new Set(routines.map((r) => r.id))
  )

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  return (
    <div className='flex flex-col gap-3'>
      {routines.map((r) => {
        const exercises = r.routines?.routine_exercises ?? []
        const doneCount = exercises.filter((e) => checked.has(e.id)).length
        const isOpen = expanded.has(r.id)

        return (
          <div
            key={r.id}
            className='overflow-hidden rounded-2xl border border-border bg-card'
          >
            <button
              onClick={() => toggleExpand(r.id)}
              className='flex w-full items-center gap-3 px-4 py-3.5 text-left'
            >
              <BookOpen size={16} className='shrink-0 text-primary' />
              <div className='min-w-0 flex-1'>
                <p className='text-sm font-bold'>{r.routines?.name ?? '—'}</p>
                <p className='mt-0.5 text-xs text-muted'>
                  {doneCount}/{exercises.length} ejercicios
                </p>
              </div>
              <div
                className={cn(
                  'rounded-full px-2.5 py-1 text-xs font-semibold',
                  doneCount === exercises.length && exercises.length > 0
                    ? 'bg-primary/10 text-primary'
                    : 'bg-card-dark text-muted'
                )}
              >
                {doneCount === exercises.length && exercises.length > 0
                  ? '✓ Listo'
                  : `${doneCount}/${exercises.length}`}
              </div>
            </button>

            {isOpen && exercises.length > 0 && (
              <div className='flex flex-col gap-2 px-4 pb-4'>
                {exercises.map((ex) => (
                  <ExerciseRow
                    key={ex.id}
                    ex={ex}
                    checked={checked.has(ex.id)}
                    onToggle={() => onToggle(ex.id)}
                    onDetail={onExerciseDetail}
                  />
                ))}
              </div>
            )}

            {isOpen && exercises.length === 0 && (
              <p className='px-4 pb-4 text-xs text-muted'>
                Sin ejercicios en esta rutina
              </p>
            )}
          </div>
        )
      })}
    </div>
  )
}
