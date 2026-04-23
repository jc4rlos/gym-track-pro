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
        className='w-full max-w-lg rounded-t-3xl border border-border bg-card pb-10'
        onClick={(e) => e.stopPropagation()}
      >
        <div className='flex items-center justify-between border-b border-border px-5 py-4'>
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
            <p className='py-6 text-center text-sm text-muted'>
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
                className='hover:bg-card-dark flex items-center gap-3 rounded-xl border border-border p-3 text-left text-sm transition-colors hover:border-primary'
              >
                <BookOpen size={16} className='shrink-0 text-primary' />
                <div>
                  <p className='font-semibold'>{r.name}</p>
                  <p className='text-xs text-muted'>
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
    <div className='flex min-h-screen flex-col bg-background pb-32'>
      <div className='flex items-center justify-between border-b border-border px-5 py-3'>
        <h1 className='text-xl font-bold'>Plan semanal</h1>
        <span className='rounded-full border border-border bg-card px-3 py-1 text-xs text-muted'>
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
              <span className='text-[9px] text-muted'>
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

      <div className='mx-5 mt-2 overflow-hidden rounded-2xl border border-border bg-card'>
        <div className='flex items-center justify-between border-b border-border px-4 py-3.5'>
          <div>
            <p className='text-sm font-bold'>{DAY_LABELS[selectedDay].label}</p>
            <p className='mt-0.5 text-xs text-muted'>
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
          <p className='mb-1 text-xs font-semibold text-muted'>
            Rutinas del día
          </p>

          {currentDay?.is_rest_day ? (
            <div className='flex items-center justify-center py-6 text-sm text-muted'>
              Día de descanso
            </div>
          ) : (
            <>
              {routineEntries.map((entry) => (
                <div
                  key={entry.id}
                  className='flex items-center gap-3 rounded-xl border border-border bg-background p-3'
                >
                  <BookOpen size={15} className='shrink-0 text-primary' />
                  <p className='flex-1 text-sm font-semibold'>
                    {entry.routines?.name}
                  </p>
                  <button
                    onClick={() => removeRoutine.mutate(entry.id)}
                    className='rounded-lg p-1.5 text-muted transition-colors hover:bg-red-500/10 hover:text-red-500'
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}

              {currentDay && (
                <button
                  onClick={() => setShowPicker(true)}
                  className='hover:bg-card-dark flex items-center gap-2 rounded-xl border border-dashed border-border bg-background p-3 text-sm font-medium text-primary transition-colors'
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
        <div className='mx-5 mt-3 flex items-center justify-between rounded-2xl border border-border bg-card p-4'>
          <div>
            <p className='text-sm font-medium text-muted'>
              Reutilizar plan anterior
            </p>
            <p className='mt-0.5 text-xs text-muted/60'>
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
            className='bg-card-dark rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:border-primary'
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
