import { cn } from '@/lib/utils'

export type TabOption = {
  id: string
  label: string
  icon?: string
  badge?: number
}

type Props = {
  options: TabOption[]
  activeTabId: string
  onTabChange: (id: string) => void
  size?: 'sm' | 'md'
}

export const ExerciseFilterTabs = ({
  options,
  activeTabId,
  onTabChange,
  size = 'md',
}: Props) => {
  return (
    <div className='border-border border-b'>
      <div className='scrollbar-hide flex gap-0 overflow-x-auto px-5'>
        {options.map(({ id, label, icon, badge }) => (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className={cn(
              'relative flex items-center gap-2 border-b-2 px-3.5 py-2.5 whitespace-nowrap transition-colors',
              activeTabId === id
                ? 'border-primary text-primary font-bold'
                : 'text-muted hover:text-foreground border-transparent'
            )}
          >
            {icon && <span className='text-base'>{icon}</span>}
            <span className={size === 'sm' ? 'text-[12px]' : 'text-[13px]'}>
              {label}
            </span>
            {badge && activeTabId === id && (
              <span className='bg-primary text-primary-foreground ml-1 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold'>
                {badge > 99 ? '99+' : badge}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
