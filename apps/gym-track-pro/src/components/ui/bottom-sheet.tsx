import { useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

type BottomSheetProps = {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  className?: string
}

export const BottomSheet = ({
  open,
  onClose,
  title,
  children,
  className,
}: BottomSheetProps) => {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  if (!open) return null

  return (
    <>
      <div
        className='fixed inset-0 z-40 bg-black/30 backdrop-blur-sm'
        onClick={onClose}
      />
      <div
        className={cn(
          'safe-bottom fixed right-0 bottom-0 left-0 z-50 rounded-t-3xl bg-card',
          'max-h-[90dvh] overflow-y-auto',
          'animate-in duration-300 slide-in-from-bottom',
          className
        )}
      >
        <div className='flex items-center justify-between border-b border-border px-5 pt-5 pb-4'>
          <div className='absolute top-3 left-1/2 h-1 w-10 -translate-x-1/2 rounded-full bg-border' />
          {title && (
            <h2 className='text-base font-semibold text-foreground'>{title}</h2>
          )}
          <button
            onClick={onClose}
            className='ml-auto flex h-8 w-8 items-center justify-center rounded-full bg-[#F3F4F6] text-muted'
          >
            <X size={16} />
          </button>
        </div>
        <div className='px-5 py-4'>{children}</div>
      </div>
    </>
  )
}
