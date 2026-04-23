import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  fullWidth?: boolean
}

const variantClass: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-white active:bg-primary/90',
  secondary: 'bg-[#F3F4F6] text-foreground active:bg-border',
  ghost: 'bg-transparent text-foreground active:bg-[#F3F4F6]',
  danger: 'bg-danger text-white active:bg-danger/90',
}

const sizeClass: Record<ButtonSize, string> = {
  sm: 'h-9 px-4 text-sm rounded-xl',
  md: 'h-12 px-5 text-sm rounded-xl',
  lg: 'h-14 px-6 text-base rounded-2xl',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading,
      fullWidth,
      className,
      children,
      disabled,
      ...props
    },
    ref
  ) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center font-semibold transition-all',
        'active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50',
        variantClass[variant],
        sizeClass[size],
        fullWidth && 'w-full',
        className
      )}
      {...props}
    >
      {loading ? (
        <span className='h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent' />
      ) : (
        children
      )}
    </button>
  )
)

Button.displayName = 'Button'
