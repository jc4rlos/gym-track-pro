type EmptyStateProps = {
  icon: string
  title: string
  description?: string
  action?: React.ReactNode
}

export const EmptyState = ({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) => (
  <div className='flex flex-col items-center justify-center py-12 text-center'>
    <span className='mb-3 text-4xl'>{icon}</span>
    <p className='text-foreground font-semibold'>{title}</p>
    {description && (
      <p className='text-muted mt-1 max-w-xs text-sm'>{description}</p>
    )}
    {action && <div className='mt-4'>{action}</div>}
  </div>
)
