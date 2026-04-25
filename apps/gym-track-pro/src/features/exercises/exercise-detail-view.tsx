import { useState } from 'react'
import { Heart, ChevronLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ExerciseDifficultyDots } from './exercise-difficulty-dots'

type Difficulty = 'beginner' | 'intermediate' | 'advanced'

type Props = {
  name: string
  primaryMuscle: string
  secondaryMuscles: string[]
  equipment: string
  difficulty: Difficulty
  instructions: string[]
  gifUrl?: string
  onBack: () => void
  onAddToRoutine?: () => void
  onAddToToday?: () => void
}

export const ExerciseDetailView = ({
  name,
  primaryMuscle,
  secondaryMuscles,
  equipment,
  difficulty,
  instructions,
  gifUrl,
  onBack,
  onAddToRoutine,
  onAddToToday,
}: Props) => {
  const [isFavorite, setIsFavorite] = useState(false)

  return (
    <div className='bg-background flex min-h-screen flex-col'>
      <div className='flex items-center gap-3 px-5 pt-3 pb-2'>
        <button
          onClick={onBack}
          className='hover:bg-card-dark border-border bg-card flex h-8.5 w-8.5 items-center justify-center rounded-full border transition-colors'
        >
          <ChevronLeft size={16} className='text-foreground' />
        </button>
        <h1 className='text-foreground flex-1 truncate text-[17px] font-bold'>
          {name}
        </h1>
        <button
          onClick={() => setIsFavorite(!isFavorite)}
          className='bg-primary-light hover:bg-primary-mid flex h-8.5 w-8.5 items-center justify-center rounded-full border border-[#2a4a1a] transition-colors'
        >
          <Heart
            size={16}
            className={
              isFavorite ? 'fill-primary text-primary' : 'text-primary'
            }
          />
        </button>
      </div>

      <div className='flex-1 overflow-y-auto pb-20'>
        <div className='space-y-3'>
          <div className='border-border bg-card mx-auto flex h-50 w-fit items-center justify-center overflow-hidden rounded-[16px] border px-2'>
            {gifUrl ? (
              <img src={gifUrl} alt={name} className='rounded-xl' />
            ) : (
              <div className='text-center'>
                <div className='mb-2 text-5xl'>💪</div>
                <p className='text-muted text-[12px]'>
                  GIF animado del ejercicio
                </p>
                <p className='text-soft mt-1 text-[11px]'>vía ExerciseDB API</p>
              </div>
            )}
          </div>

          <div className='grid grid-cols-2 gap-2 px-5'>
            <div className='bg-card-dark border-border rounded-[12px] border p-3'>
              <p className='text-muted mb-1 text-[10px]'>Músculo principal</p>
              <p className='text-primary text-[14px] font-bold'>
                {primaryMuscle}
              </p>
            </div>
            <div className='bg-card-dark border-border rounded-[12px] border p-3'>
              <p className='text-muted mb-1 text-[10px]'>Equipamiento</p>
              <p className='text-foreground text-[14px] font-bold'>
                {equipment}
              </p>
            </div>
          </div>

          <div className='grid grid-cols-2 gap-2 px-5'>
            <div className='bg-card-dark border-border rounded-[12px] border p-3'>
              <p className='text-muted mb-2 text-[10px]'>
                Músculos secundarios
              </p>
              <div className='flex flex-wrap gap-1.5'>
                {secondaryMuscles.slice(0, 2).map((muscle) => (
                  <span
                    key={muscle}
                    className='rounded-[10px] border border-[#2a2a3a] bg-[#1a1a2a] px-2 py-1 text-[10px] font-medium text-[#818cf8]'
                  >
                    {muscle}
                  </span>
                ))}
              </div>
            </div>
            <div className='bg-card-dark border-border flex flex-col items-start rounded-[12px] border p-3'>
              <p className='text-muted mb-2 text-[10px]'>Dificultad</p>
              <ExerciseDifficultyDots difficulty={difficulty} size='sm' />
            </div>
          </div>

          {instructions.length > 0 && (
            <div className='bg-card-dark border-border mx-5 rounded-[14px] border p-3'>
              <p className='text-muted mb-3 text-[11px] font-bold tracking-wider uppercase'>
                Instrucciones
              </p>
              <div className='space-y-2.5'>
                {instructions.map((instruction, i) => (
                  <div key={i} className='flex items-start gap-3'>
                    <div
                      className={cn(
                        'flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold',
                        i === 0
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-primary-light text-primary border border-[#2a4a1a]'
                      )}
                    >
                      {i + 1}
                    </div>
                    <p className='text-foreground pt-0.5 text-[13px] leading-relaxed'>
                      {instruction}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className='flex flex-col gap-2 px-5'>
            <button
              onClick={onAddToRoutine}
              className='bg-primary text-primary-foreground flex w-full items-center justify-center gap-2 rounded-[14px] py-3.5 text-[15px] font-bold'
              style={{ boxShadow: '0 4px 24px rgba(163,230,53,.2)' }}
            >
              <svg
                width='16'
                height='16'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2.5'
              >
                <line x1='12' y1='5' x2='12' y2='19' />
                <line x1='5' y1='12' x2='19' y2='12' />
              </svg>
              Agregar a rutina
            </button>
            <button
              onClick={onAddToToday}
              className='hover:bg-card-dark border-border bg-card text-foreground w-full rounded-[14px] border py-3.5 text-[15px] font-bold transition-colors'
            >
              Agregar al plan de hoy
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
