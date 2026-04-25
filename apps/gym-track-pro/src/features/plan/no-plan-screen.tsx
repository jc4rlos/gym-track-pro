import { RotateCcw, Plus, ArrowRight } from 'lucide-react'
import type { WeeklyPlan } from './use-weekly-plan'

interface NoPlanScreenProps {
  previousPlan: WeeklyPlan | null
  previousWeek: number
  onCreateNew: () => void
  onCopyPrevious: () => void
  onSkip: () => void
  isLoading: boolean
}

export function NoPlanScreen({
  previousPlan,
  previousWeek,
  onCreateNew,
  onCopyPrevious,
  onSkip,
  isLoading,
}: NoPlanScreenProps) {
  const activeDays =
    previousPlan?.weekly_plan_days.filter(
      (d) => !d.is_rest_day && (d.weekly_plan_day_routines?.length ?? 0) > 0
    ).length ?? 0
  const routineNames =
    previousPlan?.weekly_plan_days
      .flatMap((d) => d.weekly_plan_day_routines ?? [])
      .map((r) => r.routines?.name)
      .filter((v, i, a) => v && a.indexOf(v) === i)
      .slice(0, 4)
      .join(' · ') ?? ''

  return (
    <div className='flex min-h-[70vh] items-center justify-center px-4'>
      <div className='border-border bg-card flex w-full max-w-sm flex-col items-center gap-5 rounded-3xl border p-7'>
        <div className='border-primary/20 bg-primary/10 flex h-18 w-18 items-center justify-center rounded-2xl border text-4xl'>
          📅
        </div>

        <div className='text-center'>
          <h2 className='mb-2 text-xl font-bold'>Sin plan para esta semana</h2>
          <p className='text-muted text-sm leading-relaxed'>
            No encontramos un plan activo. ¿Qué querés hacer?
          </p>
        </div>

        <div className='flex w-full flex-col gap-3'>
          <button
            onClick={onCreateNew}
            disabled={isLoading}
            className='bg-primary text-primary-foreground flex w-full items-center justify-center gap-2 rounded-xl py-3 font-bold disabled:opacity-50'
          >
            <Plus size={16} />
            Crear nuevo plan
          </button>

          <button
            onClick={onCopyPrevious}
            disabled={isLoading || !previousPlan}
            className='bg-card-dark border-border text-foreground flex w-full items-center justify-center gap-2 rounded-xl border py-3 font-semibold disabled:opacity-40'
          >
            <RotateCcw size={16} />
            Usar semana anterior
          </button>

          {previousPlan && (
            <div className='border-border bg-background flex items-center gap-3 rounded-2xl border p-4'>
              <div className='flex-1'>
                <p className='text-sm font-semibold'>Semana {previousWeek}</p>
                <p className='text-muted mt-0.5 text-xs'>
                  {activeDays} días · {routineNames || 'Sin rutinas asignadas'}
                </p>
              </div>
              <ArrowRight size={18} className='text-muted' />
            </div>
          )}

          <button onClick={onSkip} className='text-muted w-full py-3 text-sm'>
            Continuar sin plan
          </button>
        </div>
      </div>
    </div>
  )
}
