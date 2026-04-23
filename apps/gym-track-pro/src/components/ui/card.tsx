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
      'rounded-[14px] border border-border bg-card p-4 shadow-card',
      className
    )}
  >
    {title && (
      <div className='mb-3 flex items-center justify-between'>
        <span className='text-[12px] font-semibold tracking-widest text-muted uppercase'>
          {title}
        </span>
        {titleRight}
      </div>
    )}
    {children}
  </div>
)
