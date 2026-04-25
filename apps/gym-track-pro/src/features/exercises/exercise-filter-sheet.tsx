import { useState, useEffect } from 'react'
import { X, SlidersHorizontal } from 'lucide-react'
import {
  MUSCLE_OPTIONS,
  MUSCLE_GROUPS,
  EQUIPMENT_OPTIONS,
} from '@/lib/exercise-constants'
import { cn } from '@/lib/utils'

type Tab = 'muscles' | 'equipment'

type Props = {
  isOpen: boolean
  onClose: () => void
  selectedMuscles: string[]
  onMusclesChange: (ids: string[]) => void
  selectedEquipment: string[]
  onEquipmentChange: (values: string[]) => void
}

export const ExerciseFilterSheet = ({
  isOpen,
  onClose,
  selectedMuscles,
  onMusclesChange,
  selectedEquipment,
  onEquipmentChange,
}: Props) => {
  const [tab, setTab] = useState<Tab>('muscles')
  const [localMuscles, setLocalMuscles] = useState<string[]>(selectedMuscles)
  const [localEquipment, setLocalEquipment] =
    useState<string[]>(selectedEquipment)

  useEffect(() => {
    if (isOpen) {
      setLocalMuscles(selectedMuscles)
      setLocalEquipment(selectedEquipment)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  const toggleMuscle = (id: string) => {
    setLocalMuscles((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    )
  }

  const toggleEquipment = (value: string) => {
    setLocalEquipment((prev) =>
      prev.includes(value) ? prev.filter((e) => e !== value) : [...prev, value]
    )
  }

  const handleApply = () => {
    onMusclesChange(localMuscles)
    onEquipmentChange(localEquipment)
    onClose()
  }

  const handleClearAll = () => {
    setLocalMuscles([])
    setLocalEquipment([])
  }

  const totalSelected = localMuscles.length + localEquipment.length

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div className='fixed inset-0 z-40 bg-black/60' onClick={onClose} />

      {/* Sheet */}
      <div className='bg-card border-border fixed right-0 bottom-0 left-0 z-50 flex max-h-[85dvh] flex-col rounded-t-[20px] border-t'>
        {/* Handle */}
        <div className='flex justify-center pt-3 pb-1'>
          <div className='bg-border h-1 w-10 rounded-full' />
        </div>

        {/* Header */}
        <div className='flex items-center justify-between px-5 py-2'>
          <div className='flex items-center gap-2'>
            <SlidersHorizontal size={16} className='text-primary' />
            <span className='text-foreground text-[15px] font-bold'>
              Filtros
            </span>
            {totalSelected > 0 && (
              <span className='bg-primary text-primary-foreground flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold'>
                {totalSelected}
              </span>
            )}
          </div>
          <button onClick={onClose}>
            <X size={20} className='text-muted' />
          </button>
        </div>

        {/* Tabs */}
        <div className='border-border flex border-b px-5'>
          {(
            [
              { key: 'muscles', label: 'Músculos', count: localMuscles.length },
              {
                key: 'equipment',
                label: 'Equipamiento',
                count: localEquipment.length,
              },
            ] as { key: Tab; label: string; count: number }[]
          ).map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={cn(
                'flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-[13px] font-semibold transition-colors',
                tab === key
                  ? 'border-primary text-primary'
                  : 'text-muted border-transparent'
              )}
            >
              {label}
              {count > 0 && (
                <span className='bg-primary text-primary-foreground flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold'>
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Scroll content */}
        <div className='flex-1 overflow-y-auto px-5 py-3'>
          {tab === 'muscles' ? (
            <div className='flex flex-col gap-4'>
              {MUSCLE_GROUPS.map((group) => {
                const options = MUSCLE_OPTIONS.filter((m) => m.group === group)
                if (options.length === 0) return null
                return (
                  <div key={group}>
                    <p className='text-muted mb-2 text-[10px] font-semibold tracking-widest uppercase'>
                      {group}
                    </p>
                    <div className='flex flex-wrap gap-2'>
                      {options.map((opt) => {
                        const selected = localMuscles.includes(opt.id)
                        return (
                          <button
                            key={opt.id}
                            onClick={() => toggleMuscle(opt.id)}
                            className={cn(
                              'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-medium transition-all',
                              selected
                                ? 'bg-primary text-primary-foreground'
                                : 'border-border bg-background text-foreground border'
                            )}
                          >
                            {opt.label}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className='flex flex-wrap gap-2'>
              {EQUIPMENT_OPTIONS.map((opt) => {
                const selected = localEquipment.includes(opt.value)
                return (
                  <button
                    key={opt.value}
                    onClick={() => toggleEquipment(opt.value)}
                    className={cn(
                      'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-medium transition-all',
                      selected
                        ? 'bg-primary text-primary-foreground'
                        : 'border-border bg-background text-foreground border'
                    )}
                  >
                    {opt.label}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className='border-border flex gap-3 border-t px-5 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))]'>
          <button
            onClick={handleClearAll}
            className='border-border text-muted flex-1 rounded-[12px] border py-3 text-[13px] font-semibold'
          >
            Limpiar todo
          </button>
          <button
            onClick={handleApply}
            className='bg-primary text-primary-foreground flex-[2] rounded-[12px] py-3 text-[13px] font-bold'
          >
            Aplicar{totalSelected > 0 ? ` (${totalSelected})` : ''}
          </button>
        </div>
      </div>
    </>
  )
}
