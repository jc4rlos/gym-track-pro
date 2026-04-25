import { Outlet } from '@tanstack/react-router'
import { LoadingOverlay } from '@/components/ui/loading-overlay'
import { DesktopSidebar } from './desktop-sidebar'
import { MobileNav } from './mobile-nav'
import { TopBar } from './top-bar'

export const AppLayout = () => (
  <div className='bg-background min-h-screen'>
    <DesktopSidebar />

    <div className='md:pl-56'>
      <TopBar />

      <main className='max-w-4xl px-4 py-4 pb-28 md:px-6 md:pb-6'>
        <Outlet />
      </main>
    </div>

    <MobileNav />
    <LoadingOverlay />
  </div>
)
