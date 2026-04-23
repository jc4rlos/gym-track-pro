import { useState, useMemo } from 'react'
import { ChevronLeft, Trash2 } from 'lucide-react'
import type { Exercise } from '@/features/exercises/exercise-list'
import { ExerciseSelectorModal } from './exercise-selector-modal'
import {
  type RoutineExercise,
  useRoutineDetail,
  useAddExerciseToRoutine,
  useUpdateRoutineExercise,
  useRemoveRoutineExercise,
} from './use-routines'

export interface ExerciseForBuilder extends RoutineExercise {
  name: string
  muscle: string
}

interface RoutineBuilderProps {
  routineId?: string
  routineName: string
  onBack: () => void
  onSave: (name: string, exercises: ExerciseForBuilder[]) => void
  isSaving?: boolean
}

export function RoutineBuilder({
  routineId,
  routineName: initialName,
  onBack,
  onSave,
  isSaving,
}: RoutineBuilderProps) {
  const { data: routine, isLoading } = useRoutineDetail(routineId)
  const addExerciseMutation = useAddExerciseToRoutine()
  const updateExerciseMutation = useUpdateRoutineExercise()
  const removeExerciseMutation = useRemoveRoutineExercise()

  const [name, setName] = useState(initialName || 'Nueva rutina')
  const [showModal, setShowModal] = useState(false)
  const [localExercises, setLocalExercises] = useState<ExerciseForBuilder[]>([])

  const derivedExercises = useMemo(
    () =>
      routine?.routine_exercises?.map((ex) => ({
        ...ex,
        name: ex.exercises?.name_es || ex.exercises?.name || '',
        muscle: ex.exercises?.target_muscle || '',
      })) ?? [],
    [routine]
  )

  const exercises = routineId ? derivedExercises : localExercises

  const handleAddExercise = (
    exercise: Exercise,
    sets: number,
    reps: string,
    rest: number
  ) => {
    if (!routineId) {
      setLocalExercises([
        ...localExercises,
        {
          id: Math.random().toString(),
          routine_id: '',
          exercise_id: exercise.id,
          sets,
          reps,
          rest_seconds: rest,
          order_index: localExercises.length,
          name: exercise.name,
          muscle: exercise.muscleGroup,
        },
      ])
    } else {
      addExerciseMutation.mutate({
        routineId,
        exerciseId: exercise.id,
        sets,
        reps,
        restSeconds: rest,
      })
    }
    setShowModal(false)
  }

  const handleUpdateExercise = <K extends keyof ExerciseForBuilder>(
    index: number,
    field: K,
    value: ExerciseForBuilder[K]
  ) => {
    const updatedItem = { ...exercises[index], [field]: value }

    if (routineId && updatedItem.id) {
      updateExerciseMutation.mutate({
        id: updatedItem.id,
        sets: updatedItem.sets,
        reps: updatedItem.reps,
        restSeconds: updatedItem.rest_seconds,
      })
    } else {
      const updated = [...localExercises]
      updated[index] = updatedItem
      setLocalExercises(updated)
    }
  }

  const handleRemoveExercise = (index: number) => {
    const ex = exercises[index]
    if (routineId && ex.id) {
      removeExerciseMutation.mutate(ex.id)
    } else {
      setLocalExercises(localExercises.filter((_, i) => i !== index))
    }
  }

  const handleSave = () => {
    onSave(name, exercises)
  }

  if (routineId && isLoading) {
    return (
      <div className='flex flex-1 items-center justify-center'>
        <div className='h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent' />
      </div>
    )
  }

  return (
    <div className='flex min-h-screen flex-col bg-background'>
      <div className='flex items-center gap-3 border-b border-border px-5 py-3'>
        <button onClick={onBack} className='rounded-lg p-2 hover:bg-card'>
          <ChevronLeft size={20} />
        </button>
        <h1 className='text-lg font-bold'>Nueva rutina</h1>
      </div>

      <div className='flex-1 space-y-4 overflow-y-auto px-5 py-4 pb-20'>
        <div>
          <label className='mb-2 block text-xs font-semibold text-muted'>
            Nombre de la rutina
          </label>
          <input
            type='text'
            value={name}
            onChange={(e) => setName(e.target.value)}
            className='w-full rounded-lg border border-border bg-background px-4 py-3 text-sm font-medium'
          />
        </div>

        <div>
          <div className='mb-3 flex items-center justify-between'>
            <label className='text-xs font-semibold text-muted'>
              Ejercicios
            </label>
            <span className='text-xs text-muted'>
              {exercises.length} ejercicios
            </span>
          </div>

          <div className='space-y-2'>
            {exercises.map((ex, idx) => (
              <div
                key={idx}
                className='rounded-lg border border-border bg-card p-3'
              >
                <div className='mb-3 flex items-center gap-2'>
                  <svg
                    width='16'
                    height='16'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='2'
                    className='text-muted'
                  >
                    <line x1='9' y1='18' x2='15' y2='18' />
                    <line x1='9' y1='12' x2='15' y2='12' />
                    <line x1='9' y1='6' x2='15' y2='6' />
                  </svg>
                  <div className='flex-1'>
                    <p className='text-sm font-semibold'>{ex.name}</p>
                    <p className='text-xs text-muted'>{ex.muscle}</p>
                  </div>
                  <button
                    onClick={() => handleRemoveExercise(idx)}
                    className='hover:bg-card-dark rounded-lg p-2 text-muted hover:text-foreground'
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className='grid grid-cols-3 gap-2'>
                  <div>
                    <label className='mb-1 block text-xs text-muted'>
                      Series
                    </label>
                    <input
                      type='number'
                      value={ex.sets}
                      onChange={(e) =>
                        handleUpdateExercise(
                          idx,
                          'sets',
                          parseInt(e.target.value) || 3
                        )
                      }
                      className='w-full rounded border border-border bg-background px-2 py-1 text-center text-xs font-bold'
                    />
                  </div>
                  <div>
                    <label className='mb-1 block text-xs text-muted'>
                      Reps
                    </label>
                    <input
                      value={ex.reps}
                      onChange={(e) =>
                        handleUpdateExercise(idx, 'reps', e.target.value)
                      }
                      className='w-full rounded border border-border bg-background px-2 py-1 text-center text-xs'
                      placeholder='8-12'
                    />
                  </div>
                  <div>
                    <label className='mb-1 block text-xs text-muted'>
                      Descanso (s)
                    </label>
                    <input
                      type='number'
                      value={ex.rest_seconds}
                      onChange={(e) =>
                        handleUpdateExercise(
                          idx,
                          'rest_seconds',
                          parseInt(e.target.value) || 60
                        )
                      }
                      className='w-full rounded border border-border bg-background px-2 py-1 text-center text-xs'
                    />
                  </div>
                </div>
              </div>
            ))}

            <button
              onClick={() => setShowModal(true)}
              className='hover:bg-card-dark w-full rounded-lg border border-dashed border-border py-3 text-sm font-medium text-primary transition-colors'
            >
              + Agregar ejercicio del catálogo
            </button>
          </div>
        </div>
      </div>

      <div className='fixed right-0 bottom-0 left-0 z-40 border-t border-border bg-card px-5 py-3'>
        <button
          onClick={handleSave}
          disabled={isSaving || !name.trim()}
          className='w-full rounded-lg bg-primary py-3 font-bold text-primary-foreground disabled:opacity-50'
        >
          {isSaving ? 'Guardando...' : 'Guardar rutina'}
        </button>
      </div>

      <ExerciseSelectorModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onSelect={handleAddExercise}
      />
    </div>
  )
}
