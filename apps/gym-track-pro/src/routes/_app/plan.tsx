import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { NoPlanScreen } from '@/features/plan/no-plan-screen'
import {
  useCurrentWeekPlan,
  usePreviousWeekPlan,
  useCreateWeekPlan,
  useCopyPreviousPlan,
} from '@/features/plan/use-weekly-plan'
import { WeeklyPlanView } from '@/features/plan/weekly-plan-view'

function getISOWeekNumber(date: Date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7))
  const w1 = new Date(d.getFullYear(), 0, 4)
  return (
    1 +
    Math.round(
      ((d.getTime() - w1.getTime()) / 86400000 - 3 + ((w1.getDay() + 6) % 7)) /
        7
    )
  )
}

function PlanPage() {
  const [skipped, setSkipped] = useState(false)
  const { data: currentPlan, isLoading } = useCurrentWeekPlan()
  const { data: previousPlan } = usePreviousWeekPlan()
  const createPlan = useCreateWeekPlan()
  const copyPlan = useCopyPreviousPlan()

  const currentWeek = getISOWeekNumber(new Date())
  const prev = new Date()
  prev.setDate(prev.getDate() - 7)
  const previousWeek = getISOWeekNumber(prev)

  if (isLoading) {
    return (
      <div className='flex min-h-64 items-center justify-center'>
        <div className='h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent' />
      </div>
    )
  }

  if (!currentPlan && !skipped) {
    return (
      <NoPlanScreen
        previousPlan={previousPlan ?? null}
        previousWeek={previousWeek}
        onCreateNew={() => createPlan.mutate()}
        onCopyPrevious={() => previousPlan && copyPlan.mutate(previousPlan)}
        onSkip={() => setSkipped(true)}
        isLoading={createPlan.isPending || copyPlan.isPending}
      />
    )
  }

  if (!currentPlan) {
    return (
      <div className='flex flex-col items-center justify-center gap-4 py-20 text-center'>
        <p className='text-sm text-muted'>Sin plan esta semana</p>
        <button
          onClick={() => setSkipped(false)}
          className='text-sm font-semibold text-primary'
        >
          Crear plan
        </button>
      </div>
    )
  }

  return (
    <WeeklyPlanView
      plan={currentPlan}
      weekNumber={currentWeek}
      previousPlan={previousPlan ?? null}
      previousWeek={previousWeek}
      onCopyPrevious={() => previousPlan && copyPlan.mutate(previousPlan)}
    />
  )
}

export const Route = createFileRoute('/_app/plan')({ component: PlanPage })
