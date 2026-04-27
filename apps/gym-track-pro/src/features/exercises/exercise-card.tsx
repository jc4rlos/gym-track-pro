import { Dumbbell } from 'lucide-react'

type Props = {
  name: string
  muscleGroup: string
  imageUrl?: string | null
  onClick?: () => void
}

export const ExerciseCard = ({ name, muscleGroup, imageUrl, onClick }: Props) => {
  return (
    <button
      onClick={onClick}
      className='border-border bg-card flex flex-col overflow-hidden rounded-2xl border text-left transition-all active:scale-[0.98]'
    >
      <div className='relative aspect-square w-full overflow-hidden bg-[#eee]'>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            loading='lazy'
            decoding='async'
            className='h-full w-full object-contain p-2'
          />
        ) : (
          <div className='flex h-full items-center justify-center'>
            <Dumbbell size={32} className='text-soft' strokeWidth={1.5} />
          </div>
        )}
      </div>

      <div className='px-3 py-2.5'>
        <p className='text-foreground line-clamp-2 text-[13px] font-bold leading-tight'>
          {name}
        </p>
        <p className='text-muted mt-0.5 text-[11px] capitalize'>{muscleGroup}</p>
      </div>
    </button>
  )
}
