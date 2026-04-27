import { useState, useEffect } from 'react'
import { Link, useRouterState } from '@tanstack/react-router'
import {
  LayoutDashboard,
  CalendarDays,
  Zap,
  Clock,
  BookOpen,
  Dumbbell,
  Activity,
  User,
  MoreHorizontal,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type NavItem = { to: string; icon: React.ElementType; label: string }

const PRIMARY: NavItem[] = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Inicio' },
  { to: '/plan', icon: CalendarDays, label: 'Plan' },
  { to: '/history', icon: Clock, label: 'Historial' },
  { to: '/profile', icon: User, label: 'Perfil' },
]

const MORE: NavItem[] = [
  { to: '/plans', icon: CalendarDays, label: 'Mis planes' },
  { to: '/routines', icon: BookOpen, label: 'Rutinas' },
  { to: '/exercises', icon: Dumbbell, label: 'Ejercicios' },
  { to: '/body', icon: Activity, label: 'Mi cuerpo' },
]

const isActiveRoute = (path: string, to: string) =>
  path === to || path.startsWith(to + '/')

function PillTab({
  item,
  active,
}: {
  item: NavItem
  active: boolean
}) {
  const Icon = item.icon
  return (
    <Link
      to={item.to}
      className='flex flex-1 flex-col items-center justify-end py-2'
    >
      <div
        className={cn(
          'flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 transition-all',
          active ? 'bg-primary/10' : 'bg-transparent'
        )}
      >
        <Icon
          size={active ? 18 : 22}
          strokeWidth={active ? 2.5 : 1.8}
          className={active ? 'text-primary' : 'text-soft'}
        />
        {active && (
          <span className='text-primary text-[11px] font-semibold'>
            {item.label}
          </span>
        )}
      </div>
      {!active && (
        <span className='text-soft mt-0.5 text-[9px]'>{item.label}</span>
      )}
    </Link>
  )
}

function MoreSheetItem({ item, onClose }: { item: NavItem; onClose: () => void }) {
  const { location } = useRouterState()
  const active = isActiveRoute(location.pathname, item.to)
  const Icon = item.icon
  return (
    <Link
      to={item.to}
      onClick={onClose}
      className={cn(
        'flex flex-col items-center gap-2 rounded-2xl p-4 transition-colors',
        active ? 'bg-primary/10' : 'bg-card-dark'
      )}
    >
      <div
        className={cn(
          'flex h-11 w-11 items-center justify-center rounded-xl',
          active ? 'bg-primary/20' : 'bg-card'
        )}
      >
        <Icon
          size={22}
          strokeWidth={active ? 2.5 : 1.8}
          className={active ? 'text-primary' : 'text-muted'}
        />
      </div>
      <span
        className={cn(
          'text-[11px] font-medium',
          active ? 'text-primary' : 'text-muted'
        )}
      >
        {item.label}
      </span>
    </Link>
  )
}

export const MobileNav = () => {
  const { location } = useRouterState()
  const path = location.pathname
  const [open, setOpen] = useState(false)

  useEffect(() => {
    setOpen(false)
  }, [path])

  const moreActive = MORE.some((item) => isActiveRoute(path, item.to))

  return (
    <>
      {open && (
        <div
          className='fixed inset-0 z-40 bg-black/60 backdrop-blur-sm'
          onClick={() => setOpen(false)}
        />
      )}

      <div
        className={cn(
          'fixed right-0 left-0 z-50 rounded-t-3xl border-t border-border bg-card px-4 pt-2 pb-4 transition-transform duration-300 ease-out',
          open ? 'translate-y-0' : 'translate-y-full'
        )}
        style={{ bottom: 'calc(56px + env(safe-area-inset-bottom, 0px))' }}
      >
        <div className='mx-auto mb-3 h-1 w-10 rounded-full bg-soft/30' />

        <p className='text-muted mb-3 text-[11px] font-semibold tracking-widest uppercase'>
          Más opciones
        </p>

        <div className='grid grid-cols-3 gap-2'>
          {MORE.map((item) => (
            <MoreSheetItem key={item.to} item={item} onClose={() => setOpen(false)} />
          ))}
        </div>
      </div>

      <nav className='safe-bottom border-border bg-card/95 fixed right-0 bottom-0 left-0 z-50 flex items-end border-t backdrop-blur-sm md:hidden'>
        {PRIMARY.slice(0, 2).map((item) => (
          <PillTab
            key={item.to}
            item={item}
            active={isActiveRoute(path, item.to)}
          />
        ))}

        <Link
          to='/today'
          className='relative -top-3 flex flex-1 flex-col items-center'
        >
          <div
            className={cn(
              'flex h-14 w-14 items-center justify-center rounded-full transition-all',
              isActiveRoute(path, '/today')
                ? 'bg-primary shadow-primary text-primary-foreground'
                : 'border-border bg-card text-soft border'
            )}
          >
            <Zap
              size={24}
              strokeWidth={isActiveRoute(path, '/today') ? 2.5 : 2}
            />
          </div>
          <span
            className={cn(
              'mt-1 mb-2 text-[9px] font-semibold',
              isActiveRoute(path, '/today') ? 'text-primary' : 'text-soft'
            )}
          >
            Hoy
          </span>
        </Link>

        {PRIMARY.slice(2).map((item) => (
          <PillTab
            key={item.to}
            item={item}
            active={isActiveRoute(path, item.to)}
          />
        ))}

        <button
          onClick={() => setOpen((v) => !v)}
          className='flex flex-1 flex-col items-center justify-end py-2'
        >
          <div
            className={cn(
              'flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 transition-all',
              moreActive || open ? 'bg-primary/10' : 'bg-transparent'
            )}
          >
            {open ? (
              <X
                size={18}
                strokeWidth={2.5}
                className={moreActive || open ? 'text-primary' : 'text-soft'}
              />
            ) : (
              <MoreHorizontal
                size={moreActive ? 18 : 22}
                strokeWidth={moreActive ? 2.5 : 1.8}
                className={moreActive ? 'text-primary' : 'text-soft'}
              />
            )}
            {(moreActive || open) && (
              <span className='text-primary text-[11px] font-semibold'>
                {open ? 'Cerrar' : 'Más'}
              </span>
            )}
          </div>
          {!moreActive && !open && (
            <span className='text-soft mt-0.5 text-[9px]'>Más</span>
          )}
        </button>
      </nav>
    </>
  )
}
