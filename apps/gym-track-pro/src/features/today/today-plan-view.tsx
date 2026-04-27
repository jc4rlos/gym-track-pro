import { useState } from 'react'
import { BookOpen, ChevronRight, Check, Dumbbell } from 'lucide-react'
import { cn } from '@/lib/utils'
import type {
  PlanRoutineWithExercises,
  PlanExercise,
} from '@/features/plan/use-weekly-plan'

type ExerciseCardProps = {
  ex: PlanExercise
  checked: boolean
  onToggle: () => void
  onDetail: (exerciseId: string) => void
}

function ExerciseCard({ ex, checked, onToggle, onDetail }: ExerciseCardProps) {
  const name = ex.exercises?.name_es || ex.exercises?.name || '—'
  const imageUrl = ex.exercises?.image_url
  const exerciseDbId = ex.exercises?.id

  return (
    <div
      className={cn(
        'flex flex-col overflow-hidden rounded-2xl border transition-all',
        checked
          ? 'border-primary bg-primary/5 shadow-[0_0_0_1px_theme(colors.primary)]'
          : 'border-border bg-card'
      )}
    >
      <div className='relative aspect-square overflow-hidden bg-[#eee]'>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className='h-full w-full object-contain p-2'
          />
        ) : (
          <div className='flex h-full items-center justify-center'>
            <Dumbbell size={32} className='text-soft' strokeWidth={1.5} />
          </div>
        )}
        {checked && (
          <div className='absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary'>
            <Check size={13} strokeWidth={3} className='text-primary-foreground' />
          </div>
        )}
      </div>

      <div className='flex flex-1 flex-col gap-1.5 p-2.5'>
        <p
          className={cn(
            'line-clamp-2 flex-1 text-[12px] font-bold leading-tight',
            checked ? 'text-muted line-through' : 'text-foreground'
          )}
        >
          {name}
        </p>
        <p className='text-muted text-[10px]'>
          {ex.sets}×{ex.reps}
          {ex.rest_seconds ? ` · ${ex.rest_seconds}s` : ''}
        </p>

        <div className='mt-auto flex items-center gap-1.5'>
          <button
            onClick={onToggle}
            className={cn(
              'flex flex-1 items-center justify-center gap-1 rounded-lg py-1.5 text-[11px] font-semibold transition-colors',
              checked
                ? 'bg-primary/10 text-primary'
                : 'bg-card-dark text-muted'
            )}
          >
            <Check size={12} strokeWidth={2.5} />
            {checked ? 'Listo' : 'Check'}
          </button>

          {exerciseDbId && (
            <button
              onClick={() => onDetail(exerciseDbId)}
              className='flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-card-dark text-muted transition-colors'
            >
              <ChevronRight size={14} strokeWidth={2} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

type TodayPlanViewProps = {
  routines: PlanRoutineWithExercises[]
  checked: Set<string>
  onToggle: (exerciseId: string) => void
  onExerciseDetail: (exerciseId: string) => void
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
              <BookOpen size={16} className='text-primary shrink-0' />
              <div className='min-w-0 flex-1'>
                <p className='text-sm font-bold'>{r.routines?.name ?? '—'}</p>
                <p className='text-muted mt-0.5 text-xs'>
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
              <div className='grid grid-cols-2 gap-2 px-3 pb-3'>
                {exercises.map((ex) => (
                  <ExerciseCard
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
              <p className='text-muted px-4 pb-4 text-xs'>
                Sin ejercicios en esta rutina
              </p>
            )}
          </div>
        )
      })}
    </div>
  )
}
