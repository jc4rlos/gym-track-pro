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
    <p className='font-semibold text-foreground'>{title}</p>
    {description && (
      <p className='mt-1 max-w-xs text-sm text-muted'>{description}</p>
    )}
    {action && <div className='mt-4'>{action}</div>}
  </div>
)
