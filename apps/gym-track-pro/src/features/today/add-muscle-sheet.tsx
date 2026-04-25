import { X } from 'lucide-react'
import {
  useAllMuscleGroups,
  useAddMuscleToSession,
  type SessionMuscle,
} from './use-today'

type Props = {
  sessionId: string
  existing: SessionMuscle[]
  onClose: () => void
}

export const AddMuscleSheet = ({ sessionId, existing, onClose }: Props) => {
  const { data: all = [] } = useAllMuscleGroups()
  const addMuscle = useAddMuscleToSession()

  const existingIds = new Set(existing.map((m) => m.muscle_group_id))
  const available = all.filter((mg) => !existingIds.has(mg.id))

  const handleAdd = (muscleGroupId: string) => {
    addMuscle.mutate({ sessionId, muscleGroupId }, { onSuccess: onClose })
  }

  return (
    <>
      {/* Backdrop */}
      <div className='fixed inset-0 z-40 bg-black/60' onClick={onClose} />

      {/* Sheet */}
      <div className='border-border bg-card fixed right-0 bottom-0 left-0 z-50 rounded-t-3xl border-t pb-10'>
        <div className='flex items-center justify-between px-5 py-4'>
          <h2 className='text-foreground text-[16px] font-bold'>
            Agregar grupo muscular
          </h2>
          <button
            onClick={onClose}
            className='bg-background text-muted flex h-8 w-8 items-center justify-center rounded-full'
          >
            <X size={16} />
          </button>
        </div>

        {available.length === 0 ? (
          <p className='text-muted px-5 pb-4 text-sm'>
            Todos los grupos ya están en la sesión.
          </p>
        ) : (
          <div className='flex max-h-72 flex-col gap-1.5 overflow-y-auto px-5'>
            {available.map((mg) => (
              <button
                key={mg.id}
                onClick={() => handleAdd(mg.id)}
                disabled={addMuscle.isPending}
                className='border-border bg-background active:bg-primary/10 flex w-full items-center justify-between rounded-[12px] border px-4 py-3 text-left transition-colors'
              >
                <span className='text-foreground text-[14px] font-medium'>
                  {mg.name_es}
                </span>
                <svg
                  width='16'
                  height='16'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='#a3e635'
                  strokeWidth='2.5'
                  strokeLinecap='round'
                >
                  <line x1='12' y1='5' x2='12' y2='19' />
                  <line x1='5' y1='12' x2='19' y2='12' />
                </svg>
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
