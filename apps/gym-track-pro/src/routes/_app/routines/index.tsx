import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { RoutineList } from '@/features/routines/routine-list'
import type { Routine } from '@/features/routines/use-routines'

function RoutinesPage() {
  const navigate = useNavigate()

  const handleCreateNew = () => {
    navigate({ to: '/routines/new' })
  }

  const handleSelectRoutine = (routine: Routine) => {
    navigate({ to: '/routines/$routineId', params: { routineId: routine.id } })
  }

  return (
    <RoutineList
      onCreateNew={handleCreateNew}
      onSelectRoutine={handleSelectRoutine}
    />
  )
}

export const Route = createFileRoute('/_app/routines/')({
  component: RoutinesPage,
})
