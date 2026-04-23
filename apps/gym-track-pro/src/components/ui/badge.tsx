import { cn } from '@/lib/utils'

type BadgeVariant = 'success' | 'danger' | 'warning' | 'info' | 'neutral'

type BadgeProps = {
  children: React.ReactNode
  variant?: BadgeVariant
  className?: string
}

const variantClass: Record<BadgeVariant, string> = {
  success: 'bg-primary-light text-primary',
  danger: 'bg-danger-light text-danger',
  warning: 'bg-amber-light text-amber',
  info: 'bg-blue-light text-blue',
  neutral: 'bg-[#F3F4F6] text-muted',
}

export const Badge = ({
  children,
  variant = 'neutral',
  className,
}: BadgeProps) => (
  <span
    className={cn(
      'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium',
      variantClass[variant],
      className
    )}
  >
    {children}
  </span>
)
