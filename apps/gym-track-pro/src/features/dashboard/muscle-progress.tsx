import { cn } from '@/lib/utils'

type MuscleGroup = {
  id: string
  slug: string
  name_es: string
}

type Props = {
  muscleGroups: MuscleGroup[]
  weekMuscleSlugs: Set<string>
}

export const MuscleProgress = ({ muscleGroups, weekMuscleSlugs }: Props) => {
  const total = muscleGroups.length
  const trained = muscleGroups.filter((mg) =>
    weekMuscleSlugs.has(mg.slug)
  ).length
  const pct = total > 0 ? Math.round((trained / total) * 100) : 0

  return (
    <div className='border-border bg-card rounded-[16px] border p-3.5'>
      <div className='mb-2.5 flex items-center justify-between'>
        <span className='text-muted text-[13px] font-medium'>
          Músculos esta semana
        </span>
        <span className='font-display text-primary text-[28px] leading-none'>
          {trained} / {total}
        </span>
      </div>
      <div className='mb-3 h-1.5 overflow-hidden rounded-full bg-[#2a2a2a]'>
        <div
          className='bg-primary h-full rounded-full transition-all duration-500'
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className='flex flex-wrap gap-1.5'>
        {muscleGroups.map((mg) => {
          const done = weekMuscleSlugs.has(mg.slug)
          return (
            <span
              key={mg.id}
              className={cn(
                'rounded-full px-2.5 py-1 text-[11px] font-medium',
                done
                  ? 'bg-primary/15 text-primary'
                  : 'bg-[#1a1a1a] text-[#4a4a4a]'
              )}
            >
              {mg.name_es}
            </span>
          )
        })}
      </div>
    </div>
  )
}
