import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

type FabProps = {
  onClick: () => void
  className?: string
  label?: string
}

export const Fab = ({ onClick, className, label = 'Agregar' }: FabProps) => (
  <button
    onClick={onClick}
    aria-label={label}
    className={cn(
      'fixed right-4 bottom-20 z-30 flex h-14 w-14 items-center justify-center',
      'rounded-full bg-primary text-white shadow-lg',
      'transition-transform active:scale-95',
      'md:right-6 md:bottom-6',
      className
    )}
  >
    <Plus size={24} strokeWidth={2.5} />
  </button>
)
