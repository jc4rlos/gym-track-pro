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
      <h1 className='text-foreground text-xl font-bold'>Ajustes</h1>

      {/* User card */}
      <div className='border-border bg-card flex items-center gap-3 rounded-[16px] border p-4'>
        <div className='bg-primary text-primary-foreground flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full text-base font-bold'>
          {user?.email?.[0]?.toUpperCase() ?? 'U'}
        </div>
        <div className='min-w-0 flex-1'>
          <p className='text-foreground truncate text-sm font-semibold'>
            {user?.email}
          </p>
          <p className='text-muted text-xs'>Cuenta activa</p>
        </div>
        <User size={16} className='text-muted' />
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className='border-border bg-card hover:border-destructive/40 hover:bg-destructive/5 flex w-full items-center gap-3 rounded-[16px] border px-4 py-4 text-left transition-colors'
      >
        <LogOut size={18} className='text-destructive' />
        <span className='text-destructive text-sm font-medium'>
          Cerrar sesión
        </span>
      </button>
    </div>
  )
}

export const Route = createFileRoute('/_app/settings')({
  component: SettingsPage,
})
