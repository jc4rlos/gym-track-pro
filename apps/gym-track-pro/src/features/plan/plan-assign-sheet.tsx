import { X, Calendar, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Plan, PlanWeekAssignment } from './use-plans'
import {
  useAssignPlanToWeek,
  useUnassignPlanFromWeek,
  getUpcomingWeeks,
} from './use-plans'
import { getISOWeek } from './plan-utils'

type Props = {
  plan: Plan
  assignments: PlanWeekAssignment[]
  onClose: () => void
}

export function PlanAssignSheet({ plan, assignments, onClose }: Props) {
  const weeks = getUpcomingWeeks(10)
  const { week: currentWeek, year: currentYear } = getISOWeek(new Date())
  const assignMutation = useAssignPlanToWeek()
  const unassignMutation = useUnassignPlanFromWeek()

  const getAssignment = (week: number, year: number) =>
    assignments.find((a) => a.week_number === week && a.year === year)

  const toggle = (week: number, year: number) => {
    const existing = getAssignment(week, year)
    if (existing) {
      unassignMutation.mutate(existing.id)
    } else {
      assignMutation.mutate({ planId: plan.id, weekNumber: week, year })
    }
  }

  const isBusy = assignMutation.isPending || unassignMutation.isPending

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
              <h2 className='text-foreground text-[16px] font-bold'>Asignar semanas</h2>
              <p className='text-muted mt-0.5 text-[12px]'>{plan.name}</p>
            </div>
            <button
              onClick={onClose}
              className='bg-card-dark flex h-8 w-8 shrink-0 items-center justify-center rounded-full'
            >
              <X size={16} className='text-muted' />
            </button>
          </div>

          {/* Week list */}
          <div className='flex max-h-80 flex-col gap-2 overflow-y-auto px-4 py-3'>
            {weeks.map(({ week, year, label }) => {
              const assigned = !!getAssignment(week, year)
              const isCurrentWeek = week === currentWeek && year === currentYear
              return (
                <button
                  key={`${year}-${week}`}
                  onClick={() => !isBusy && toggle(week, year)}
                  disabled={isBusy}
                  className={cn(
                    'flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-all',
                    assigned
                      ? 'border-primary bg-primary/5'
                      : 'border-border bg-card-dark'
                  )}
                >
                  <div
                    className={cn(
                      'flex h-7 w-7 shrink-0 items-center justify-center rounded-xl',
                      assigned ? 'bg-primary' : 'border-border bg-card border'
                    )}
                  >
                    {assigned ? (
                      <Check size={14} strokeWidth={2.5} className='text-primary-foreground' />
                    ) : (
                      <Calendar size={13} className='text-muted' />
                    )}
                  </div>
                  <div className='min-w-0 flex-1'>
                    <p
                      className={cn(
                        'text-[12px] font-semibold',
                        assigned ? 'text-foreground' : 'text-muted'
                      )}
                    >
                      {label}
                      {isCurrentWeek && (
                        <span className='bg-primary/10 text-primary ml-2 rounded-full px-2 py-0.5 text-[10px] font-bold'>
                          Esta semana
                        </span>
                      )}
                    </p>
                    {assigned && (
                      <p className='text-primary mt-0.5 text-[11px]'>Asignado</p>
                    )}
                  </div>
                </button>
              )
            })}
          </div>

          {/* Footer */}
          <div className='border-border border-t px-4 py-3'>
            <button
              onClick={onClose}
              className='border-border bg-card-dark text-muted w-full rounded-2xl border py-3 text-[14px] font-semibold'
            >
              Listo
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
