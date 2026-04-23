import { cn } from '@/lib/utils'

type PageHeaderProps = {
  title: string
  subtitle?: string
  action?: React.ReactNode
  className?: string
}

export const PageHeader = ({
  title,
  subtitle,
  action,
  className,
}: PageHeaderProps) => (
  <div className={cn('mb-4 flex items-center justify-between', className)}>
    <div>
      <h1 className='text-lg font-semibold text-foreground'>{title}</h1>
      {subtitle && <p className='mt-0.5 text-sm text-muted'>{subtitle}</p>}
    </div>
    {action && <div className='flex-shrink-0'>{action}</div>}
  </div>
)
