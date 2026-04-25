import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

type Difficulty = 'beginner' | 'intermediate' | 'advanced'

type Props = {
  name: string
  muscleGroup: string
  equipment: string
  difficulty: Difficulty
  primaryMuscles: string[]
  secondaryMuscles: string[]
  emoji?: string
  imageUrl?: string | null
  onClick?: () => void
}

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  beginner: 'Principiante',
  intermediate: 'Intermedio',
  advanced: 'Avanzado',
}

const MUSCLE_COLOR_MAP: Record<string, { bg: string; text: string }> = {
  chest: { bg: 'bg-[#111d00]', text: 'text-[#4ade80]' },
  biceps: { bg: 'bg-[#111d00]', text: 'text-[#4ade80]' },
  triceps: { bg: 'bg-[#1a1a2a]', text: 'text-[#818cf8]' },
  back: { bg: 'bg-[#111d00]', text: 'text-[#4ade80]' },
  lats: { bg: 'bg-[#111d00]', text: 'text-[#4ade80]' },
  glutes: { bg: 'bg-[#1a1520]', text: 'text-[#f9a8d4]' },
  quadriceps: { bg: 'bg-[#111d00]', text: 'text-[#4ade80]' },
  hamstrings: { bg: 'bg-[#1a1520]', text: 'text-[#f9a8d4]' },
  shoulders: { bg: 'bg-[#111d00]', text: 'text-[#4ade80]' },
  abs: { bg: 'bg-[#111d00]', text: 'text-[#4ade80]' },
  obliques: { bg: 'bg-[#111d00]', text: 'text-[#4ade80]' },
  traps: { bg: 'bg-[#111d00]', text: 'text-[#4ade80]' },
}

export const ExerciseCard = ({
  name,
  muscleGroup,
  equipment,
  difficulty,
  primaryMuscles,
  secondaryMuscles,
  emoji = '💪',
  imageUrl,
  onClick,
}: Props) => {
  const allMuscles = [...primaryMuscles, ...secondaryMuscles]
  return (
    <button
      onClick={onClick}
      className='hover:bg-card-dark border-border bg-card flex w-full items-start gap-3 rounded-[14px] border p-3 text-left transition-colors'
    >
      <div className='bg-muscle-rest flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-[12px] text-2xl'>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            loading='lazy'
            decoding='async'
            className='h-full w-full object-cover'
          />
        ) : (
          emoji
        )}
      </div>

      <div className='flex-1'>
        <h3 className='text-foreground text-[14px] font-bold'>{name}</h3>
        <p className='text-muted mt-0.5 text-[11px]'>
          {muscleGroup} · {equipment} · {DIFFICULTY_LABELS[difficulty]}
        </p>

        <div className='mt-1.5 flex flex-wrap gap-1'>
          {allMuscles.slice(0, 3).map((muscle) => {
            const colors = MUSCLE_COLOR_MAP[muscle] || {
              bg: 'bg-card-dark',
              text: 'text-muted',
            }
            return (
              <span
                key={muscle}
                className={cn(
                  'rounded-[10px] px-2 py-0.5 text-[10px] font-medium',
                  colors.bg,
                  colors.text
                )}
              >
                {muscle.charAt(0).toUpperCase() + muscle.slice(1)}
              </span>
            )
          })}
        </div>
      </div>

      <ChevronRight size={18} className='text-soft mt-1 shrink-0' />
    </button>
  )
}
