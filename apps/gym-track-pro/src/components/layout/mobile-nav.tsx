import { Link, useRouterState } from '@tanstack/react-router'
import {
  LayoutDashboard,
  CalendarDays,
  ClipboardCheck,
  Dumbbell,
  BookOpen,
  User,
  Activity,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type NavItem = { to: string; icon: React.ElementType; label: string }

const navItems: NavItem[] = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Inicio' },
  { to: '/today', icon: ClipboardCheck, label: 'Hoy' },
  { to: '/plan', icon: CalendarDays, label: 'Plan' },
  { to: '/routines', icon: BookOpen, label: 'Rutinas' },
  { to: '/body', icon: Activity, label: 'IMC' },
  { to: '/exercises', icon: Dumbbell, label: 'Ejercicios' },
  { to: '/profile', icon: User, label: 'Perfil' },
]

export const MobileNav = () => {
  const { location } = useRouterState()
  const path = location.pathname

  return (
    <nav className='safe-bottom border-border bg-card fixed right-0 bottom-0 left-0 z-30 flex border-t md:hidden'>
      {navItems.map(({ to, icon: Icon, label }) => {
        const active = path === to || path.startsWith(to + '/')
        return (
          <Link
            key={to}
            to={to}
            className={cn(
              'flex flex-1 flex-col items-center justify-center gap-1 py-2',
              'text-[10px] font-medium transition-colors',
              active ? 'text-primary' : 'text-soft'
            )}
          >
            <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
            <span>{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
