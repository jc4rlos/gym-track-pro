import { useState, useEffect } from 'react'
import { X, SlidersHorizontal } from 'lucide-react'
import { MAIN_MUSCLE_OPTIONS } from '@/lib/exercise-constants'
import { cn } from '@/lib/utils'

import abdominalsUrl from '@/assets/images/svg/abdominals.svg'
import backUrl from '@/assets/images/svg/back.svg'
import bicepsUrl from '@/assets/images/svg/biceps.svg'
import calvesUrl from '@/assets/images/svg/calves.svg'
import chestUrl from '@/assets/images/svg/chest.svg'
import legsUrl from '@/assets/images/svg/legs.svg'
import shouldersUrl from '@/assets/images/svg/shoulders.svg'
import tricepsUrl from '@/assets/images/svg/triceps.svg'

const MUSCLE_SVG: Record<string, string> = {
  abdominals: abdominalsUrl,
  back: backUrl,
  biceps: bicepsUrl,
  calves: calvesUrl,
  chest: chestUrl,
  legs: legsUrl,
  shoulders: shouldersUrl,
  triceps: tricepsUrl,
}

type Props = {
  isOpen: boolean
  onClose: () => void
  selectedMuscles: string[]
  onMusclesChange: (ids: string[]) => void
}

export const ExerciseFilterSheet = ({
  isOpen,
  onClose,
  selectedMuscles,
  onMusclesChange,
}: Props) => {
  const [localMuscles, setLocalMuscles] = useState<string[]>(selectedMuscles)

  useEffect(() => {
    if (isOpen) setLocalMuscles(selectedMuscles)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  const toggleMuscle = (id: string) => {
    setLocalMuscles((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    )
  }

  const handleApply = () => {
    onMusclesChange(localMuscles)
    onClose()
  }

  const handleClearAll = () => setLocalMuscles([])

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div className='fixed inset-0 z-40 bg-black/60' onClick={onClose} />

      {/* Modal centrado */}
      <div className='fixed inset-0 z-50 flex items-center justify-center px-4'>
      <div className='bg-card border-border flex w-full max-w-sm flex-col rounded-[24px] border' style={{ maxHeight: '85dvh' }}>
        {/* Header */}
        <div className='flex items-center justify-between px-5 py-2'>
          <div className='flex items-center gap-2'>
            <SlidersHorizontal size={16} className='text-primary' />
            <span className='text-foreground text-[15px] font-bold'>
              Filtrar por músculo
            </span>
            {localMuscles.length > 0 && (
              <span className='bg-primary text-primary-foreground flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold'>
                {localMuscles.length}
              </span>
            )}
          </div>
          <button onClick={onClose}>
            <X size={20} className='text-muted' />
          </button>
        </div>

        {/* Grid */}
        <div className='flex-1 overflow-y-auto px-5 py-3'>
          <div className='grid grid-cols-4 gap-3'>
            {MAIN_MUSCLE_OPTIONS.map((opt) => {
              const selected = localMuscles.includes(opt.id)
              return (
                <button
                  key={opt.id}
                  onClick={() => toggleMuscle(opt.id)}
                  className={cn(
                    'flex flex-col items-center gap-1.5 rounded-2xl border p-3 transition-all',
                    selected
                      ? 'border-primary bg-primary-light'
                      : 'border-border bg-background'
                  )}
                >
                  <img
                    src={MUSCLE_SVG[opt.id]}
                    alt={opt.label}
                    className={cn(
                      'h-12 w-12 object-contain transition-opacity',
                      selected ? 'opacity-100' : 'opacity-50'
                    )}
                  />
                  <span
                    className={cn(
                      'text-center text-[10px] font-semibold leading-tight',
                      selected ? 'text-primary' : 'text-muted'
                    )}
                  >
                    {opt.label}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Footer */}
        <div className='border-border flex gap-3 border-t px-5 py-4'>
          <button
            onClick={handleClearAll}
            className='border-border text-muted flex-1 rounded-[12px] border py-3 text-[13px] font-semibold'
          >
            Limpiar
          </button>
          <button
            onClick={handleApply}
            className='bg-primary text-primary-foreground flex-[2] rounded-[12px] py-3 text-[13px] font-bold'
          >
            Aplicar{localMuscles.length > 0 ? ` (${localMuscles.length})` : ''}
          </button>
        </div>
      </div>
      </div>
    </>
  )
}
