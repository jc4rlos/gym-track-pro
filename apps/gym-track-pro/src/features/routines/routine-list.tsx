import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { useRoutines, useDeleteRoutine, type Routine } from './use-routines'

interface RoutineListProps {
  onCreateNew: () => void
  onSelectRoutine: (routine: Routine) => void
}

export function RoutineList({
  onCreateNew,
  onSelectRoutine,
}: RoutineListProps) {
  const { data: routines, isLoading } = useRoutines()
  const deleteMutation = useDeleteRoutine()
  const [confirmId, setConfirmId] = useState<string | null>(null)

  return (
    <div className='bg-background flex min-h-screen flex-col'>
      <div className='border-border flex items-center justify-between border-b px-5 py-3'>
        <h1 className='text-xl font-bold'>Mis Rutinas</h1>
      </div>

      <div className='flex-1 space-y-3 overflow-y-auto px-5 py-4 pb-20'>
        {isLoading ? (
          <div className='flex justify-center py-8'>
            <div className='border-primary h-6 w-6 animate-spin rounded-full border-2 border-t-transparent' />
          </div>
        ) : !routines || routines.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-12 text-center'>
            <p className='text-muted mb-4 text-sm'>No tienes rutinas creadas</p>
            <button
              onClick={onCreateNew}
              className='bg-primary text-primary-foreground rounded-lg px-6 py-2 text-sm font-bold'
            >
              Crear primera rutina
            </button>
          </div>
        ) : (
          routines.map((routine) => (
            <div
              key={routine.id}
              onClick={() => onSelectRoutine(routine)}
              className='hover:bg-card-dark border-border bg-card hover:border-primary cursor-pointer rounded-lg border p-4 transition-colors'
            >
              <div className='mb-2 flex items-start justify-between'>
                <h3 className='flex-1 text-sm font-bold'>{routine.name}</h3>
                <div className='flex items-center gap-2'>
                  <span className='bg-primary/20 text-primary rounded-md px-2 py-1 text-xs font-medium'>
                    {routine.routine_exercises?.length || 0} ejercicios
                  </span>
                  {confirmId === routine.id ? (
                    <div
                      className='flex items-center gap-1'
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => {
                          deleteMutation.mutate(routine.id)
                          setConfirmId(null)
                        }}
                        className='rounded-md bg-red-500 px-2 py-1 text-xs font-semibold text-white'
                      >
                        Eliminar
                      </button>
                      <button
                        onClick={() => setConfirmId(null)}
                        className='bg-card-dark text-muted rounded-md px-2 py-1 text-xs'
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setConfirmId(routine.id)
                      }}
                      className='text-muted rounded-lg p-1.5 transition-colors hover:bg-red-500/10 hover:text-red-500'
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              </div>
              {routine.description && (
                <p className='text-muted mb-2 text-xs'>{routine.description}</p>
              )}
              <p className='text-soft text-xs'>
                Creada el{' '}
                {new Date(routine.created_at).toLocaleDateString('es-ES')}
              </p>
            </div>
          ))
        )}
      </div>

      <div className='safe-bottom fixed right-5 bottom-24 z-40'>
        <button
          onClick={onCreateNew}
          className='bg-primary text-primary-foreground hover:bg-primary/90 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-colors'
        >
          <Plus size={24} />
        </button>
      </div>
    </div>
  )
}
