import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  error?: string
  leftIcon?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, leftIcon, className, ...props }, ref) => (
    <div className='flex w-full flex-col gap-1.5'>
      {label && (
        <label className='text-sm font-medium text-foreground'>{label}</label>
      )}
      <div className='relative'>
        {leftIcon && (
          <div className='absolute top-1/2 left-3 -translate-y-1/2 text-muted'>
            {leftIcon}
          </div>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground',
            'placeholder:text-soft focus:border-primary focus:ring-2 focus:ring-primary/30 focus:outline-none',
            'min-h-12 transition-colors',
            leftIcon && 'pl-10',
            error && 'border-danger focus:ring-danger/30',
            className
          )}
          {...props}
        />
      </div>
      {error && <p className='text-danger text-xs'>{error}</p>}
    </div>
  )
)

Input.displayName = 'Input'
