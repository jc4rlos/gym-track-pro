import { useState } from 'react'
import { X } from 'lucide-react'
import { useUpdateStepsGoal } from './use-steps'

const PRESETS = [5000, 7500, 10000, 12000, 15000]

type Props = {
  current: number
  onClose: () => void
}

export function StepsGoalSheet({ current, onClose }: Props) {
  const [value, setValue] = useState(String(current))
  const update = useUpdateStepsGoal()

  const handleSave = () => {
    const n = parseInt(value)
    if (!n || n < 100) return
    update.mutate(n, { onSuccess: onClose })
  }

  return (
    <>
      <div className='fixed inset-0 z-50 bg-black/70 backdrop-blur-sm' onClick={onClose} />
      <div className='fixed inset-0 z-50 flex items-center justify-center px-5'>
        <div className='bg-card border-border w-full max-w-sm rounded-3xl border p-5'>
          <div className='mb-5 flex items-center justify-between'>
            <h2 className='text-foreground text-[16px] font-bold'>Meta diaria de pasos</h2>
            <button
              onClick={onClose}
              className='bg-card-dark flex h-8 w-8 items-center justify-center rounded-full'
            >
              <X size={15} className='text-muted' />
            </button>
          </div>

          <div className='mb-4 flex flex-wrap gap-2'>
            {PRESETS.map((p) => (
              <button
                key={p}
                onClick={() => setValue(String(p))}
                className={`rounded-xl border px-3 py-1.5 text-[13px] font-semibold transition-colors ${
                  value === String(p)
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border text-muted'
                }`}
              >
                {p.toLocaleString()}
              </button>
            ))}
          </div>

          <input
            type='number'
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className='border-border bg-background text-foreground mb-4 w-full rounded-xl border px-4 py-3 text-center text-[18px] font-bold focus:outline-none'
            placeholder='10000'
            min={100}
          />

          <button
            onClick={handleSave}
            disabled={update.isPending}
            className='bg-primary text-primary-foreground w-full rounded-2xl py-3.5 text-[15px] font-bold disabled:opacity-60'
          >
            {update.isPending ? 'Guardando...' : 'Guardar meta'}
          </button>
        </div>
      </div>
    </>
  )
}
