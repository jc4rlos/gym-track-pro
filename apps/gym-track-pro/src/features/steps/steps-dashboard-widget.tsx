import { Link } from '@tanstack/react-router'
import { ChevronRight } from 'lucide-react'
import { useTodaySteps, useStepsGoal } from './use-steps'
import { StepsCircle } from './steps-circle'

export function StepsDashboardWidget() {
  const { data: entry } = useTodaySteps()
  const { data: goal = 10000 } = useStepsGoal()
  const steps = entry?.steps ?? 0
  const pct = Math.min(Math.round((steps / goal) * 100), 100)

  return (
    <Link
      to='/steps'
      className='border-border bg-card flex items-center gap-4 rounded-2xl border p-4'
    >
      <div className='relative flex items-center justify-center'>
        <StepsCircle steps={steps} goal={goal} size={64} />
        <span className='text-primary absolute text-[11px] font-bold'>{pct}%</span>
      </div>

      <div className='min-w-0 flex-1'>
        <p className='text-muted text-[11px] font-semibold uppercase tracking-wide'>
          Pasos hoy
        </p>
        <p className='text-foreground text-[22px] font-bold leading-tight'>
          {steps.toLocaleString()}
        </p>
        <p className='text-muted text-[11px]'>meta: {goal.toLocaleString()}</p>
      </div>

      <ChevronRight size={18} className='text-muted shrink-0' />
    </Link>
  )
}
