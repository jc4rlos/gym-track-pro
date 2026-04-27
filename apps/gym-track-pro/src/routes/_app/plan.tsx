import { createFileRoute } from '@tanstack/react-router'
import { NoPlanScreen } from '@/features/plan/no-plan-screen'
import { useCurrentWeekAssignedPlan } from '@/features/plan/use-plans'
import { WeeklyPlanView } from '@/features/plan/weekly-plan-view'
import { getISOWeek } from '@/features/plan/plan-utils'

function PlanPage() {
  const { data: currentPlan, isLoading } = useCurrentWeekAssignedPlan()
  const { week: currentWeek } = getISOWeek(new Date())

  if (isLoading) {
    return (
      <div className='flex min-h-64 items-center justify-center'>
        <div className='border-primary h-6 w-6 animate-spin rounded-full border-2 border-t-transparent' />
      </div>
    )
  }

  if (!currentPlan) {
    return <NoPlanScreen />
  }

  return <WeeklyPlanView plan={currentPlan} weekNumber={currentWeek} />
}

export const Route = createFileRoute('/_app/plan')({ component: PlanPage })
