import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ExerciseDetailView } from '@/features/exercises/exercise-detail-view'
import { useExerciseDetail } from '@/features/exercises/use-exercises-query'

function ExerciseDetailPage() {
  const navigate = useNavigate()
  const { exerciseId } = Route.useParams()
  const { data: exercise, isLoading, error } = useExerciseDetail(exerciseId)

  if (isLoading) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <div className='h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent' />
      </div>
    )
  }

  if (error || !exercise) {
    return (
      <div className='flex min-h-screen flex-col items-center justify-center gap-3'>
        <p className='text-muted'>Ejercicio no encontrado</p>
        <button
          onClick={() => navigate({ to: '/exercises' })}
          className='rounded-lg bg-primary px-4 py-2 font-semibold text-primary-foreground'
        >
          Volver al catálogo
        </button>
      </div>
    )
  }

  return (
    <ExerciseDetailView
      name={exercise.name_es || exercise.name}
      primaryMuscle={exercise.target_muscle || exercise.body_part || 'General'}
      secondaryMuscles={exercise.secondary_muscles || []}
      equipment={exercise.equipment || 'Peso corporal'}
      difficulty={
        (exercise.difficulty as 'beginner' | 'intermediate' | 'advanced') ||
        'beginner'
      }
      instructions={exercise.instructions || []}
      gifUrl={exercise.gif_url || undefined}
      onBack={() => navigate({ to: '/exercises' })}
      onAddToRoutine={() => {
        alert(`Agregado: ${exercise.name_es || exercise.name}`)
      }}
      onAddToToday={() => {
        alert(`Agregado a hoy: ${exercise.name_es || exercise.name}`)
      }}
    />
  )
}

export const Route = createFileRoute('/_app/exercises/$exerciseId')({
  component: ExerciseDetailPage,
})
