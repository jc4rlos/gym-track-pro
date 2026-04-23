import { useRouterState } from '@tanstack/react-router'
import { ChevronLeft } from 'lucide-react'

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/settings': 'Ajustes',
}

export const TopBar = () => {
  const { location } = useRouterState()
  const path = location.pathname
  const title = PAGE_TITLES[path] ?? ''
  const isDashboard = path === '/dashboard'

  if (isDashboard) {
    return (
      <header className='sticky top-0 z-20 bg-background px-4 pt-4 pb-3 md:hidden'>
        <h1 className='text-lg font-semibold text-foreground'>Gym Track Pro</h1>
      </header>
    )
  }

  return (
    <header className='sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-border bg-card px-4 md:hidden'>
      <button
        onClick={() => window.history.back()}
        className='flex h-8 w-8 items-center justify-center rounded-full bg-[#F3F4F6]'
      >
        <ChevronLeft size={18} className='text-foreground' />
      </button>
      <h1 className='flex-1 text-base font-semibold text-foreground'>
        {title}
      </h1>
    </header>
  )
}
