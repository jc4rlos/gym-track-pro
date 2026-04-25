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
          'safe-bottom bg-card fixed right-0 bottom-0 left-0 z-50 rounded-t-3xl',
          'max-h-[90dvh] overflow-y-auto',
          'animate-in slide-in-from-bottom duration-300',
          className
        )}
      >
        <div className='border-border flex items-center justify-between border-b px-5 pt-5 pb-4'>
          <div className='bg-border absolute top-3 left-1/2 h-1 w-10 -translate-x-1/2 rounded-full' />
          {title && (
            <h2 className='text-foreground text-base font-semibold'>{title}</h2>
          )}
          <button
            onClick={onClose}
            className='text-muted ml-auto flex h-8 w-8 items-center justify-center rounded-full bg-[#F3F4F6]'
          >
            <X size={16} />
          </button>
        </div>
        <div className='px-5 py-4'>{children}</div>
      </div>
    </>
  )
}
