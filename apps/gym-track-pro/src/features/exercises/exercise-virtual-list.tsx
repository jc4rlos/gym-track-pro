import { ExerciseCard } from './exercise-card'
import type { Exercise } from './exercise-list'

type Props = {
  exercises: Exercise[]
  isLoading?: boolean
  onSelectExercise: (exercise: Exercise) => void
}

export const ExerciseVirtualList = ({
  exercises,
  isLoading,
  onSelectExercise,
}: Props) => {
  return (
    <div className='scrollbar-hide flex-1 overflow-y-auto'>
      {exercises.length === 0 && !isLoading ? (
        <div className='flex flex-col items-center justify-center px-5 py-12 text-center'>
          <p className='text-muted text-[14px]'>No se encontraron ejercicios</p>
          <p className='text-soft mt-1 text-[12px]'>
            Intenta otra búsqueda o categoría
          </p>
        </div>
      ) : (
        <div className='px-5 py-3'>
          <div className='grid grid-cols-2 gap-3'>
            {exercises.map((exercise) => (
              <ExerciseCard
                key={exercise.id}
                name={exercise.name}
                muscleGroup={exercise.muscleGroup}
                imageUrl={exercise.imageUrl}
                onClick={() => onSelectExercise(exercise)}
              />
            ))}
          </div>

          {isLoading && exercises.length === 0 && (
            <div className='flex justify-center py-8'>
              <div className='border-primary h-6 w-6 animate-spin rounded-full border-2 border-t-transparent' />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
