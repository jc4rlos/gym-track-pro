import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string
  error?: string
  placeholder?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, placeholder, className, children, ...props }, ref) => (
    <div className='flex w-full flex-col gap-1.5'>
      {label && (
        <label className='text-foreground text-sm font-medium'>{label}</label>
      )}
      <select
        ref={ref}
        className={cn(
          'border-border bg-card text-foreground w-full rounded-xl border px-4 py-3 text-sm',
          'focus:border-primary focus:ring-primary/30 focus:ring-2 focus:outline-none',
          'min-h-[48px] appearance-none transition-colors',
          error && 'border-danger',
          className
        )}
        {...props}
      >
        {placeholder && <option value=''>{placeholder}</option>}
        {children}
      </select>
      {error && <p className='text-danger text-xs'>{error}</p>}
    </div>
  )
)

Select.displayName = 'Select'
