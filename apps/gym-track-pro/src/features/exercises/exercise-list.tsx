import { ExerciseCard } from './exercise-card'

export type Exercise = {
  id: string
  name: string
  muscleGroup: string
  equipment: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  primaryMuscles: string[]
  secondaryMuscles: string[]
  emoji?: string
  imageUrl?: string | null
}

type Props = {
  exercises: Exercise[]
  count?: number
  onSelectExercise?: (exercise: Exercise) => void
  isLoading?: boolean
}

export const ExerciseList = ({
  exercises,
  count,
  onSelectExercise,
  isLoading,
}: Props) => {
  return (
    <div className='px-5'>
      {count && (
        <p className='text-muted mb-2.5 text-[11px] font-medium tracking-wider uppercase'>
          {count.toLocaleString()} ejercicios disponibles
        </p>
      )}

      {isLoading ? (
        <div className='flex items-center justify-center py-12'>
          <div className='border-primary h-6 w-6 animate-spin rounded-full border-2 border-t-transparent' />
        </div>
      ) : exercises.length === 0 ? (
        <div className='flex flex-col items-center justify-center py-12 text-center'>
          <p className='text-muted text-[14px]'>No se encontraron ejercicios</p>
          <p className='text-soft mt-1 text-[12px]'>
            Intenta otra búsqueda o categoría
          </p>
        </div>
      ) : (
        <div className='flex flex-col gap-2'>
          {exercises.map((exercise) => (
            <ExerciseCard
              key={exercise.id}
              name={exercise.name}
              muscleGroup={exercise.muscleGroup}
              equipment={exercise.equipment}
              difficulty={exercise.difficulty}
              primaryMuscles={exercise.primaryMuscles}
              secondaryMuscles={exercise.secondaryMuscles}
              emoji={exercise.emoji}
              imageUrl={exercise.imageUrl}
              onClick={() => onSelectExercise?.(exercise)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
