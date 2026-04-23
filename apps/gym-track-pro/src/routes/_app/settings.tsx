import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { LogOut, User } from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'

const SettingsPage = () => {
  const { user, signOut } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await signOut()
    navigate({ to: '/login' })
  }

  return (
    <div className='flex flex-col gap-4 pb-10'>
      <h1 className='text-xl font-bold text-foreground'>Ajustes</h1>

      {/* User card */}
      <div className='flex items-center gap-3 rounded-[16px] border border-border bg-card p-4'>
        <div className='flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-primary text-base font-bold text-primary-foreground'>
          {user?.email?.[0]?.toUpperCase() ?? 'U'}
        </div>
        <div className='min-w-0 flex-1'>
          <p className='truncate text-sm font-semibold text-foreground'>
            {user?.email}
          </p>
          <p className='text-xs text-muted'>Cuenta activa</p>
        </div>
        <User size={16} className='text-muted' />
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className='flex w-full items-center gap-3 rounded-[16px] border border-border bg-card px-4 py-4 text-left transition-colors hover:border-destructive/40 hover:bg-destructive/5'
      >
        <LogOut size={18} className='text-destructive' />
        <span className='text-sm font-medium text-destructive'>
          Cerrar sesión
        </span>
      </button>
    </div>
  )
}

export const Route = createFileRoute('/_app/settings')({
  component: SettingsPage,
})
