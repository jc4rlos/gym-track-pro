import { useState } from 'react'
import Model, { type IExerciseData } from 'react-body-highlighter'
import { cn } from '@/lib/utils'

type Props = {
  bodyData: IExerciseData[]
}

export const BodyCard = ({ bodyData }: Props) => {
  const [view, setView] = useState<'anterior' | 'posterior'>('anterior')

  return (
    <div className='bg-card-dark rounded-[20px] border border-[#1e1e1e] p-3.5'>
      <div className='mb-2.5 flex items-center justify-between'>
        <span className='text-foreground text-[13px] font-bold'>
          Músculos esta semana
        </span>
        <div className='flex rounded-full bg-[#1a1a1a] p-0.5'>
          <button
            onClick={() => setView('anterior')}
            className={cn(
              'rounded-full px-3 py-1 text-[11px] font-medium transition-colors',
              view === 'anterior'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted'
            )}
          >
            Frente
          </button>
          <button
            onClick={() => setView('posterior')}
            className={cn(
              'rounded-full px-3 py-1 text-[11px] font-medium transition-colors',
              view === 'posterior'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted'
            )}
          >
            Espalda
          </button>
        </div>
      </div>

      <div className='flex justify-center py-2'>
        <Model
          data={bodyData}
          style={{ width: '160px', padding: '5px' }}
          highlightedColors={['#4ade80', '#a3e635']}
          type={view}
        />
      </div>

      <div className='mt-1.5 flex gap-3.5 border-t border-[#1e1e1e] pt-2.5'>
        <div className='text-muted flex items-center gap-1.5 text-[11px]'>
          <div className='bg-primary h-2.5 w-2.5 shrink-0 rounded-xs' />
          Hoy
        </div>
        <div className='text-muted flex items-center gap-1.5 text-[11px]'>
          <div className='bg-muscle-warm h-2.5 w-2.5 shrink-0 rounded-xs' />
          Esta semana
        </div>
        <div className='text-muted flex items-center gap-1.5 text-[11px]'>
          <div className='bg-muscle-rest h-2.5 w-2.5 shrink-0 rounded-xs border border-[#333]' />
          Sin entrenar
        </div>
      </div>
    </div>
  )
}
