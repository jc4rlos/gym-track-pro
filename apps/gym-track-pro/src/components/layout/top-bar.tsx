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
      <header className='bg-background sticky top-0 z-20 px-4 pt-4 pb-3 md:hidden'>
        <h1 className='text-foreground text-lg font-semibold'>Gym Track Pro</h1>
      </header>
    )
  }

  return (
    <header className='border-border bg-card sticky top-0 z-20 flex h-14 items-center gap-3 border-b px-4 md:hidden'>
      <button
        onClick={() => window.history.back()}
        className='flex h-8 w-8 items-center justify-center rounded-full'
      >
        <ChevronLeft size={18} className='text-foreground' />
      </button>
      <h1 className='text-foreground flex-1 text-base font-semibold'>
        {title}
      </h1>
    </header>
  )
}
