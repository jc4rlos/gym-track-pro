import { cn } from '@/lib/utils'

type Difficulty = 'beginner' | 'intermediate' | 'advanced'

type Props = {
  difficulty: Difficulty
  size?: 'sm' | 'md'
}

const DIFFICULTY_MAP: Record<Difficulty, { label: string; dots: number }> = {
  beginner: { label: 'Principiante', dots: 1 },
  intermediate: { label: 'Intermedio', dots: 2 },
  advanced: { label: 'Avanzado', dots: 3 },
}

export const ExerciseDifficultyDots = ({ difficulty, size = 'md' }: Props) => {
  const { label, dots } = DIFFICULTY_MAP[difficulty]
  const dotSize = size === 'sm' ? 'w-2 h-2' : 'w-3 h-3'

  return (
    <div className='flex flex-col items-start gap-2'>
      <div className='flex gap-1.5'>
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'rounded-full',
              dotSize,
              i < dots ? 'bg-primary' : 'bg-card-dark'
            )}
          />
        ))}
      </div>
      <p className='text-muted text-[12px] font-medium'>{label}</p>
    </div>
  )
}
