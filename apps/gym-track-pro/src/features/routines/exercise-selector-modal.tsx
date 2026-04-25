import { useState, useRef } from 'react'
import { X } from 'lucide-react'
import { ExerciseCard } from '@/features/exercises/exercise-card'
import { ExerciseFilterMenu } from '@/features/exercises/exercise-filter-menu'
import type { Exercise } from '@/features/exercises/exercise-list'
import { ExerciseSearch } from '@/features/exercises/exercise-search'
import { useExercisesFiltered } from '@/features/exercises/use-exercises-filtered'

interface ExerciseSelectorModalProps {
  open: boolean
  onClose: () => void
  onSelect: (
    exercise: Exercise,
    sets: number,
    reps: string,
    rest: number
  ) => void
}

const FILTERS = [
  { id: 'all', label: 'Todo' },
  { id: 'chest', label: 'Pecho' },
  { id: 'back', label: 'Espalda' },
  { id: 'arms', label: 'Brazos' },
  { id: 'legs', label: 'Piernas' },
  { id: 'shoulders', label: 'Hombros' },
  { id: 'core', label: 'Core' },
]

export function ExerciseSelectorModal({
  open,
  onClose,
  onSelect,
}: ExerciseSelectorModalProps) {
  const {
    exercises,
    searchQuery,
    setSearchQuery,
    selectedMuscles,
    setSelectedMuscles,
    isLoading,
  } = useExercisesFiltered()

  const selectedCategory =
    selectedMuscles.length === 1 ? selectedMuscles[0] : 'all'

  const setSelectedCategory = (id: string) => {
    setSelectedMuscles(id === 'all' ? [] : [id])
  }

  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(
    null
  )
  const [sets, setSets] = useState('3')
  const [reps, setReps] = useState('10-12')
  const [rest, setRest] = useState('60')
  const scrollRef = useRef<HTMLDivElement>(null)

  const handleConfirm = () => {
    if (selectedExercise) {
      onSelect(
        selectedExercise,
        parseInt(sets) || 3,
        reps || '10-12',
        parseInt(rest) || 60
      )
      setSelectedExercise(null)
      setSets('3')
      setReps('10-12')
      setRest('60')
      onClose()
    }
  }

  if (!open) return null

  return (
    <div className='fixed inset-0 z-50 flex items-end justify-center bg-black/80 sm:items-center'>
      <div className='border-border bg-card flex h-[90vh] w-full flex-col overflow-hidden rounded-t-3xl border sm:max-h-[90vh] sm:max-w-96 sm:rounded-3xl'>
        <div className='border-border flex items-center justify-between border-b px-5 py-4'>
          <h2 className='text-lg font-bold'>Agregar ejercicio</h2>
          <button
            onClick={onClose}
            className='hover:bg-card-dark rounded-lg p-2'
          >
            <X size={20} />
          </button>
        </div>

        <div className='flex flex-1 flex-col overflow-hidden'>
          {!selectedExercise ? (
            <>
              <ExerciseSearch value={searchQuery} onChange={setSearchQuery} />

              <ExerciseFilterMenu
                options={FILTERS}
                selectedId={selectedCategory}
                onSelect={(id) =>
                  setSelectedCategory(
                    id as Parameters<typeof setSelectedCategory>[0]
                  )
                }
                variant='pills'
                showArrows={true}
              />

              <div ref={scrollRef} className='flex-1 overflow-y-auto px-5 py-3'>
                <div className='space-y-2'>
                  {exercises.length === 0 && !isLoading ? (
                    <div className='py-8 text-center'>
                      <p className='text-muted text-sm'>
                        No se encontraron ejercicios
                      </p>
                    </div>
                  ) : (
                    exercises.map((ex) => (
                      <div key={ex.id} onClick={() => setSelectedExercise(ex)}>
                        <ExerciseCard
                          name={ex.name}
                          muscleGroup={ex.muscleGroup}
                          equipment={ex.equipment}
                          difficulty={ex.difficulty}
                          primaryMuscles={ex.primaryMuscles}
                          secondaryMuscles={ex.secondaryMuscles}
                          emoji={ex.emoji}
                          imageUrl={ex.imageUrl ?? ''}
                        />
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className='flex flex-1 flex-col p-5'>
              <button
                onClick={() => setSelectedExercise(null)}
                className='text-primary mb-4 flex items-center gap-1 self-start text-sm font-medium'
              >
                ← Volver
              </button>

              <div className='mb-6'>
                <h3 className='mb-2 text-base font-bold'>
                  {selectedExercise.name}
                </h3>
                <p className='text-muted text-xs'>
                  {selectedExercise.muscleGroup} · {selectedExercise.equipment}
                </p>
              </div>

              <div className='space-y-4'>
                <div>
                  <label className='text-muted mb-2 block text-xs font-semibold'>
                    Series
                  </label>
                  <input
                    type='number'
                    value={sets}
                    onChange={(e) => setSets(e.target.value)}
                    className='border-border bg-background w-full rounded-lg border px-3 py-2 text-center text-sm font-bold'
                  />
                </div>

                <div>
                  <label className='text-muted mb-2 block text-xs font-semibold'>
                    Repeticiones
                  </label>
                  <input
                    value={reps}
                    onChange={(e) => setReps(e.target.value)}
                    className='border-border bg-background w-full rounded-lg border px-3 py-2 text-center text-sm'
                    placeholder='8-12'
                  />
                </div>

                <div>
                  <label className='text-muted mb-2 block text-xs font-semibold'>
                    Descanso (segundos)
                  </label>
                  <input
                    type='number'
                    value={rest}
                    onChange={(e) => setRest(e.target.value)}
                    className='border-border bg-background w-full rounded-lg border px-3 py-2 text-center text-sm'
                  />
                </div>
              </div>

              <button
                onClick={handleConfirm}
                className='bg-primary text-primary-foreground mt-auto w-full rounded-lg py-3 font-bold'
              >
                Confirmar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
