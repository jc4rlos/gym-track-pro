import { createFileRoute } from '@tanstack/react-router'
import { Shield } from 'lucide-react'
import { useUserRole } from '@/features/admin/use-admin'
import { AdminUsersPage } from '@/features/admin/admin-users-page'

const AdminGuard = () => {
  const { data: role, isLoading } = useUserRole()

  if (isLoading) {
    return (
      <div className='flex min-h-[60vh] items-center justify-center'>
        <div className='border-primary h-8 w-8 animate-spin rounded-full border-2 border-t-transparent' />
      </div>
    )
  }

  if (role !== 'admin') {
    return (
      <div className='flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center'>
        <div className='bg-card-dark flex h-16 w-16 items-center justify-center rounded-2xl border border-border'>
          <Shield size={28} className='text-muted' strokeWidth={1.5} />
        </div>
        <p className='text-foreground font-semibold'>Acceso restringido</p>
        <p className='text-muted text-[13px]'>
          Solo administradores pueden ver esta sección.
        </p>
      </div>
    )
  }

  return <AdminUsersPage />
}

export const Route = createFileRoute('/_app/admin')({ component: AdminGuard })
