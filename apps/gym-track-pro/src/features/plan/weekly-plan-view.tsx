import { useState } from 'react'
import { X, BookOpen, Plus, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRoutines } from '@/features/routines/use-routines'
import {
  useAddRoutineToDay,
  useRemoveRoutineFromDay,
  useToggleRestDay,
  todayDayOfWeek,
  type WeeklyPlan,
  type WeeklyPlanDay,
} from './use-weekly-plan'

const DAY_LABELS = [
  { short: 'L', label: 'Lunes' },
  { short: 'M', label: 'Martes' },
  { short: 'X', label: 'Miércoles' },
  { short: 'J', label: 'Jueves' },
  { short: 'V', label: 'Viernes' },
  { short: 'S', label: 'Sábado' },
  { short: 'D', label: 'Domingo' },
]

function getDayDate(dayOfWeek: number) {
  const now = new Date()
  const diff = dayOfWeek - todayDayOfWeek()
  const d = new Date(now)
  d.setDate(d.getDate() + diff)
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })
}

interface RoutinePickerProps {
  planDay: WeeklyPlanDay
  onClose: () => void
}

function RoutinePicker({ planDay, onClose }: RoutinePickerProps) {
  const { data: routines = [] } = useRoutines()
  const addRoutine = useAddRoutineToDay()
  const alreadyAdded = (planDay.weekly_plan_day_routines || []).map(
    (r) => r.routine_id
  )
  const available = routines.filter((r) => !alreadyAdded.includes(r.id))

  return (
    <div
      className='fixed inset-0 z-50 flex items-end justify-center bg-black/80'
      onClick={onClose}
    >
      <div
        className='border-border bg-card w-full max-w-lg rounded-t-3xl border pb-10'
        onClick={(e) => e.stopPropagation()}
      >
        <div className='border-border flex items-center justify-between border-b px-5 py-4'>
          <h3 className='font-bold'>Agregar rutina</h3>
          <button
            onClick={onClose}
            className='hover:bg-card-dark rounded-lg p-2'
          >
            <X size={18} />
          </button>
        </div>
        <div className='flex max-h-80 flex-col gap-2 overflow-y-auto px-5 pt-4'>
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
                className='hover:bg-card-dark border-border hover:border-primary flex items-center gap-3 rounded-xl border p-3 text-left text-sm transition-colors'
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
  )
}

interface WeeklyPlanViewProps {
  plan: WeeklyPlan
  weekNumber: number
  previousPlan: WeeklyPlan | null
  previousWeek: number
  onCopyPrevious: () => void
}

export function WeeklyPlanView({
  plan,
  weekNumber,
  previousPlan,
  previousWeek,
  onCopyPrevious,
}: WeeklyPlanViewProps) {
  const today = todayDayOfWeek()
  const [selectedDay, setSelectedDay] = useState(today)
  const [showPicker, setShowPicker] = useState(false)
  const removeRoutine = useRemoveRoutineFromDay()
  const toggleRest = useToggleRestDay()

  const dayMap = new Map(plan.weekly_plan_days.map((d) => [d.day_of_week, d]))
  const currentDay: WeeklyPlanDay | undefined = dayMap.get(selectedDay)
  const routineEntries =
    currentDay?.weekly_plan_day_routines?.filter((r) => r.routine_id) ?? []

  return (
    <div className='bg-background flex min-h-screen flex-col pb-32'>
      <div className='border-border flex items-center justify-between border-b px-5 py-3'>
        <h1 className='text-xl font-bold'>Plan semanal</h1>
        <span className='border-border bg-card text-muted rounded-full border px-3 py-1 text-xs'>
          Semana {weekNumber}
        </span>
      </div>

      <div className='flex gap-1.5 px-5 pt-4 pb-2'>
        {DAY_LABELS.map(({ short, label }, i) => {
          const day = dayMap.get(i)
          const hasRoutines = (day?.weekly_plan_day_routines?.length ?? 0) > 0
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
                  isRest
                    ? 'bg-border'
                    : hasRoutines
                      ? 'bg-primary'
                      : 'bg-border'
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
            <p className='text-muted mt-0.5 text-xs'>
              {getDayDate(selectedDay)}
            </p>
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
                  ? 'bg-card-dark border-border text-muted'
                  : 'border-primary/30 bg-primary/10 text-primary'
              )}
            >
              {currentDay.is_rest_day ? 'Descanso' : 'Activo'}
            </button>
          )}
        </div>

        <div className='flex flex-col gap-2 px-4 py-4'>
          <p className='text-muted mb-1 text-xs font-semibold'>
            Rutinas del día
          </p>

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
                  className='hover:bg-card-dark border-border bg-background text-primary flex items-center gap-2 rounded-xl border border-dashed p-3 text-sm font-medium transition-colors'
                >
                  <Plus size={15} />
                  Agregar rutina
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {previousPlan && (
        <div className='border-border bg-card mx-5 mt-3 flex items-center justify-between rounded-2xl border p-4'>
          <div>
            <p className='text-muted text-sm font-medium'>
              Reutilizar plan anterior
            </p>
            <p className='text-muted/60 mt-0.5 text-xs'>
              Semana {previousWeek} ·{' '}
              {previousPlan.weekly_plan_days.reduce(
                (acc, d) => acc + (d.weekly_plan_day_routines?.length ?? 0),
                0
              )}{' '}
              rutinas
            </p>
          </div>
          <button
            onClick={onCopyPrevious}
            className='bg-card-dark border-border text-primary hover:border-primary rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors'
          >
            Usar este
          </button>
        </div>
      )}

      {showPicker && currentDay && (
        <RoutinePicker
          planDay={currentDay}
          onClose={() => setShowPicker(false)}
        />
      )}
    </div>
  )
}
