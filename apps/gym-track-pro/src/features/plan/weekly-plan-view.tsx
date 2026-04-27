import { useState } from 'react'
import { X, BookOpen, Plus, Trash2, LayoutList } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { cn } from '@/lib/utils'
import { useRoutines } from '@/features/routines/use-routines'
import {
  useAddRoutineToPlanDay,
  useRemoveRoutineFromPlanDay,
  useTogglePlanDayRest,
  type Plan,
  type PlanDay,
} from './use-plans'
import { DAY_LABELS, todayDayOfWeek } from './plan-utils'

function getDayDate(dayOfWeek: number) {
  const now = new Date()
  const diff = dayOfWeek - todayDayOfWeek()
  const d = new Date(now)
  d.setDate(d.getDate() + diff)
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })
}

interface RoutinePickerProps {
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
      <div className='fixed inset-0 z-50 bg-black/80' onClick={onClose} />
      <div className='fixed inset-0 z-50 flex items-center justify-center px-5'>
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

interface WeeklyPlanViewProps {
  plan: Plan
  weekNumber: number
}

export function WeeklyPlanView({ plan, weekNumber }: WeeklyPlanViewProps) {
  const today = todayDayOfWeek()
  const [selectedDay, setSelectedDay] = useState(today)
  const [showPicker, setShowPicker] = useState(false)
  const removeRoutine = useRemoveRoutineFromPlanDay()
  const toggleRest = useTogglePlanDayRest()

  const dayMap = new Map((plan.plan_days ?? []).map((d) => [d.day_of_week, d]))
  const currentDay: PlanDay | undefined = dayMap.get(selectedDay)
  const routineEntries =
    currentDay?.plan_day_routines?.filter((r) => r.routine_id) ?? []

  return (
    <div className='bg-background flex min-h-screen flex-col pb-32'>
      <div className='border-border flex items-center justify-between border-b px-5 py-3'>
        <div>
          <h1 className='text-[17px] font-bold'>{plan.name}</h1>
          <p className='text-muted text-[11px]'>Semana {weekNumber}</p>
        </div>
        <Link
          to='/plans'
          className='bg-card-dark border-border text-muted flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold'
        >
          <LayoutList size={12} />
          Mis planes
        </Link>
      </div>

      <div className='flex gap-1.5 px-5 pt-4 pb-2'>
        {DAY_LABELS.map(({ short, label }, i) => {
          const day = dayMap.get(i)
          const hasRoutines = (day?.plan_day_routines?.length ?? 0) > 0
          const isRest = !!day?.is_rest_day
          const isToday = i === today
          const isSelected = i === selectedDay

          return (
            <button
              key={i}
              onClick={() => setSelectedDay(i)}
              className={cn(
                'flex flex-1 flex-col items-center gap-0.5 rounded-xl border py-2 transition-colors',
                isSelected
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-card'
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
              <span className='text-muted text-[9px]'>
                {isToday && !isSelected ? 'Hoy' : label.slice(0, 3)}
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

      <div className='border-border bg-card mx-5 mt-2 overflow-hidden rounded-2xl border'>
        <div className='border-border flex items-center justify-between border-b px-4 py-3.5'>
          <div>
            <p className='text-sm font-bold'>{DAY_LABELS[selectedDay].label}</p>
            <p className='text-muted mt-0.5 text-xs'>{getDayDate(selectedDay)}</p>
          </div>
          {currentDay && (
            <button
              onClick={() =>
                toggleRest.mutate({
                  planDayId: currentDay.id,
                  isRest: !currentDay.is_rest_day,
                })
              }
              className={cn(
                'rounded-full border px-3 py-1 text-xs font-semibold transition-colors',
                currentDay.is_rest_day
                  ? 'border-border bg-card-dark text-muted'
                  : 'border-primary/30 bg-primary/10 text-primary'
              )}
            >
              {currentDay.is_rest_day ? 'Descanso' : 'Activo'}
            </button>
          )}
        </div>

        <div className='flex flex-col gap-2 px-4 py-4'>
          <p className='text-muted mb-1 text-xs font-semibold'>Rutinas del día</p>

          {currentDay?.is_rest_day ? (
            <div className='text-muted flex items-center justify-center py-6 text-sm'>
              Día de descanso
            </div>
          ) : (
            <>
              {routineEntries.map((entry) => (
                <div
                  key={entry.id}
                  className='border-border bg-background flex items-center gap-3 rounded-xl border p-3'
                >
                  <BookOpen size={15} className='text-primary shrink-0' />
                  <p className='flex-1 text-sm font-semibold'>
                    {entry.routines?.name}
                  </p>
                  <button
                    onClick={() => removeRoutine.mutate(entry.id)}
                    className='text-muted rounded-lg p-1.5 transition-colors hover:bg-red-500/10 hover:text-red-500'
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              {currentDay && (
                <button
                  onClick={() => setShowPicker(true)}
                  className='border-border bg-background text-primary flex items-center gap-2 rounded-xl border border-dashed p-3 text-sm font-medium'
                >
                  <Plus size={15} />
                  Agregar rutina
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {showPicker && currentDay && (
        <RoutinePicker planDay={currentDay} onClose={() => setShowPicker(false)} />
      )}
    </div>
  )
}
