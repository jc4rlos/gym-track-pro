import { cn } from '@/lib/utils'

type CardProps = {
  children: React.ReactNode
  className?: string
  title?: string
  titleRight?: React.ReactNode
}

export const Card = ({ children, className, title, titleRight }: CardProps) => (
  <div
    className={cn(
      'border-border bg-card shadow-card rounded-[14px] border p-4',
      className
    )}
  >
    {title && (
      <div className='mb-3 flex items-center justify-between'>
        <span className='text-muted text-[12px] font-semibold tracking-widest uppercase'>
          {title}
        </span>
        {titleRight}
      </div>
    )}
    {children}
  </div>
)
