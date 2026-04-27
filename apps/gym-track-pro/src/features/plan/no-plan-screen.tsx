import { Link } from '@tanstack/react-router'
import { CalendarDays, LayoutList } from 'lucide-react'

export function NoPlanScreen() {
  return (
    <div className='flex min-h-[70vh] items-center justify-center px-4'>
      <div className='border-border bg-card flex w-full max-w-sm flex-col items-center gap-5 rounded-3xl border p-7 text-center'>
        <div className='bg-primary/10 border-primary/20 flex h-16 w-16 items-center justify-center rounded-2xl border'>
          <CalendarDays size={28} className='text-primary' strokeWidth={1.5} />
        </div>

        <div>
          <h2 className='text-foreground text-[18px] font-bold'>
            Sin plan esta semana
          </h2>
          <p className='text-muted mt-1.5 text-[13px] leading-relaxed'>
            Creá un plan en "Mis planes" y asignalo a esta semana para verlo aquí.
          </p>
        </div>

        <Link
          to='/plans'
          className='bg-primary text-primary-foreground flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-[15px] font-bold'
          style={{ boxShadow: '0 4px 24px rgba(163,230,53,.2)' }}
        >
          <LayoutList size={16} />
          Ir a Mis planes
        </Link>
      </div>
    </div>
  )
}
