import { useState } from 'react'
import { X, BookOpen, Plus, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  useTogglePlanDayRest,
  useAddRoutineToPlanDay,
  useRemoveRoutineFromPlanDay,
} from './use-plans'
import type { Plan, PlanDay } from './use-plans'
import { DAY_LABELS } from './plan-utils'
import { useRoutines } from '@/features/routines/use-routines'

type RoutinePickerProps = {
  planDay: PlanDay
  onClose: () => void
}

function RoutinePicker({ planDay, onClose }: RoutinePickerProps) {
  const { data: routines = [] } = useRoutines()
  const addRoutine = useAddRoutineToPlanDay()
  const alreadyAdded = (planDay.plan_day_routines || []).map((r) => r.routine_id)
  const available = routines.filter((r) => !alreadyAdded.includes(r.id))

  return (
    <>
      <div
        className='fixed inset-0 z-[60] bg-black/80'
        onClick={onClose}
      />
      <div className='fixed inset-0 z-[60] flex items-center justify-center px-5'>
        <div
          className='border-border bg-card w-full max-w-sm rounded-3xl border shadow-xl'
          onClick={(e) => e.stopPropagation()}
        >
          <div className='border-border flex items-center justify-between border-b px-5 py-4'>
            <h3 className='text-[15px] font-bold'>Agregar rutina</h3>
            <button
              onClick={onClose}
              className='bg-card-dark flex h-8 w-8 items-center justify-center rounded-full'
            >
              <X size={16} className='text-muted' />
            </button>
          </div>
          <div className='flex max-h-72 flex-col gap-2 overflow-y-auto px-4 py-4'>
            {available.length === 0 ? (
              <p className='text-muted py-6 text-center text-sm'>
                No hay más rutinas disponibles
              </p>
            ) : (
              available.map((r) => (
                <button
                  key={r.id}
                  onClick={() => {
                    addRoutine.mutate({ planDayId: planDay.id, routineId: r.id })
                    onClose()
                  }}
                  className='border-border bg-card-dark flex items-center gap-3 rounded-xl border p-3 text-left text-sm'
                >
                  <BookOpen size={16} className='text-primary shrink-0' />
                  <div>
                    <p className='font-semibold'>{r.name}</p>
                    <p className='text-muted text-xs'>
                      {r.routine_exercises?.length || 0} ejercicios
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  )
}

type Props = {
  plan: Plan
  onClose: () => void
}

export function PlanEditorSheet({ plan, onClose }: Props) {
  const [selectedDay, setSelectedDay] = useState(0)
  const [showPicker, setShowPicker] = useState(false)
  const toggleRest = useTogglePlanDayRest()
  const removeRoutine = useRemoveRoutineFromPlanDay()

  const dayMap = new Map((plan.plan_days ?? []).map((d) => [d.day_of_week, d]))
  const currentDay = dayMap.get(selectedDay)
  const routineEntries = currentDay?.plan_day_routines ?? []

  return (
    <>
      <div
        className='fixed inset-0 z-50 bg-black/70 backdrop-blur-sm'
        onClick={onClose}
      />
      <div className='fixed inset-0 z-50 flex items-center justify-center px-5'>
        <div className='border-border bg-card w-full max-w-sm rounded-3xl border shadow-xl'>
          {/* Header */}
          <div className='border-border flex items-center justify-between border-b px-5 pt-4 pb-3'>
            <div>
              <h2 className='text-foreground text-[16px] font-bold'>Editar plan</h2>
              <p className='text-muted mt-0.5 text-[12px]'>{plan.name}</p>
            </div>
            <button
              onClick={onClose}
              className='bg-card-dark flex h-8 w-8 shrink-0 items-center justify-center rounded-full'
            >
              <X size={16} className='text-muted' />
            </button>
          </div>

          {/* Day tabs */}
          <div className='flex gap-1.5 px-4 pt-3 pb-2'>
            {DAY_LABELS.map(({ short }, i) => {
              const day = dayMap.get(i)
              const hasRoutines = (day?.plan_day_routines?.length ?? 0) > 0
              const isRest = !!day?.is_rest_day
              const isSelected = i === selectedDay
              return (
                <button
                  key={i}
                  onClick={() => setSelectedDay(i)}
                  className={cn(
                    'flex flex-1 flex-col items-center gap-0.5 rounded-xl border py-2 transition-colors',
                    isSelected
                      ? 'border-primary bg-primary/5'
                      : 'border-border bg-card-dark'
                  )}
                >
                  <span
                    className={cn(
                      'text-sm font-bold',
                      isSelected ? 'text-foreground' : 'text-muted'
                    )}
                  >
                    {short}
                  </span>
                  <div
                    className={cn(
                      'h-1.5 w-1.5 rounded-full',
                      isRest ? 'bg-border' : hasRoutines ? 'bg-primary' : 'bg-border'
                    )}
                  />
                </button>
              )
            })}
          </div>

          {/* Day content */}
          <div className='px-4 pb-5'>
            <div className='mb-3 flex items-center justify-between'>
              <p className='text-foreground text-[13px] font-bold'>
                {DAY_LABELS[selectedDay].label}
              </p>
              {currentDay && (
                <button
                  onClick={() =>
                    toggleRest.mutate({
                      planDayId: currentDay.id,
                      isRest: !currentDay.is_rest_day,
                    })
                  }
                  className={cn(
                    'rounded-full border px-3 py-1 text-[11px] font-semibold transition-colors',
                    currentDay.is_rest_day
                      ? 'border-border bg-card-dark text-muted'
                      : 'border-primary/30 bg-primary/10 text-primary'
                  )}
                >
                  {currentDay.is_rest_day ? 'Descanso' : 'Activo'}
                </button>
              )}
            </div>

            <div className='flex max-h-52 flex-col gap-2 overflow-y-auto'>
              {currentDay?.is_rest_day ? (
                <div className='border-border flex items-center justify-center rounded-2xl border border-dashed py-8 text-sm text-muted'>
                  Día de descanso
                </div>
              ) : (
                <>
                  {routineEntries.map((entry) => (
                    <div
                      key={entry.id}
                      className='border-border bg-card-dark flex items-center gap-3 rounded-xl border p-3'
                    >
                      <BookOpen size={15} className='text-primary shrink-0' />
                      <p className='flex-1 text-sm font-semibold'>
                        {entry.routines?.name}
                      </p>
                      <button
                        onClick={() => removeRoutine.mutate(entry.id)}
                        className='text-muted rounded-lg p-1.5'
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  {currentDay && (
                    <button
                      onClick={() => setShowPicker(true)}
                      className='border-border text-primary flex items-center gap-2 rounded-xl border border-dashed p-3 text-sm font-medium'
                    >
                      <Plus size={15} />
                      Agregar rutina
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {showPicker && currentDay && (
        <RoutinePicker
          planDay={currentDay}
          onClose={() => setShowPicker(false)}
        />
      )}
    </>
  )
}
