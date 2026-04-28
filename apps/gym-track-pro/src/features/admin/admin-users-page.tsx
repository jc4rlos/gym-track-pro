import { useState } from 'react'
import { Search, UserPlus, ChevronLeft, ChevronRight, X, Shield, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  useAdminUsers,
  useToggleUserActive,
  useCreateUser,
  type AdminUser,
} from './use-admin'

const PAGE_SIZE = 20

function formatDate(s: string) {
  return new Date(s).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function UserCard({
  user,
  onToggle,
  isToggling,
}: {
  user: AdminUser
  onToggle: (id: string, active: boolean) => void
  isToggling: boolean
}) {
  const initial = (user.full_name?.[0] ?? user.email?.[0] ?? '?').toUpperCase()

  return (
    <div
      className={cn(
        'rounded-2xl border p-3.5 transition-opacity',
        user.is_active ? 'border-border bg-card' : 'border-border/50 bg-card opacity-50'
      )}
    >
      <div className='flex items-start gap-3'>
        <div
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[15px] font-bold',
            user.role === 'admin'
              ? 'bg-primary text-primary-foreground'
              : 'bg-card-dark text-muted'
          )}
        >
          {initial}
        </div>

        <div className='min-w-0 flex-1'>
          <div className='flex items-center gap-1.5'>
            <p className='text-foreground truncate text-[14px] font-semibold'>
              {user.full_name || '—'}
            </p>
            {user.role === 'admin' && (
              <span className='bg-primary-light text-primary flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold'>
                <Shield size={9} />
                Admin
              </span>
            )}
          </div>
          <p className='text-muted truncate text-[12px]'>{user.email ?? '—'}</p>
          <p className='text-muted/60 mt-0.5 text-[10px]'>
            Desde {formatDate(user.created_at)}
          </p>
        </div>

        <button
          onClick={() => onToggle(user.id, !user.is_active)}
          disabled={isToggling || user.role === 'admin'}
          className={cn(
            'flex h-8 shrink-0 items-center rounded-full border px-3 text-[11px] font-semibold transition-colors disabled:opacity-40',
            user.is_active
              ? 'border-orange-900/50 bg-orange-950/40 text-orange-400'
              : 'border-primary-mid bg-primary-light text-primary'
          )}
        >
          {user.is_active ? 'Desactivar' : 'Activar'}
        </button>
      </div>
    </div>
  )
}

function CreateUserModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [password, setPassword] = useState('')
  const createUser = useCreateUser()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password.trim()) return
    createUser.mutate(
      { email: email.trim(), fullName: fullName.trim(), password },
      { onSuccess: onClose }
    )
  }

  return (
    <>
      <div
        className='fixed inset-0 z-50 bg-black/70 backdrop-blur-sm'
        onClick={onClose}
      />
      <div className='fixed inset-0 z-50 flex items-center justify-center px-4'>
        <div className='bg-card border-border w-full max-w-sm overflow-hidden rounded-3xl border'>
          <div className='flex items-center justify-between px-5 pt-4 pb-3'>
            <h2 className='text-foreground text-[16px] font-bold'>
              Nuevo usuario
            </h2>
            <button
              onClick={onClose}
              className='bg-card-dark flex h-8 w-8 items-center justify-center rounded-full'
            >
              <X size={15} className='text-muted' />
            </button>
          </div>

          <form onSubmit={handleSubmit} className='px-5 pb-5'>
            <div className='flex flex-col gap-3'>
              <div>
                <label className='text-muted mb-1.5 block text-[11px] font-semibold uppercase tracking-wide'>
                  Nombre completo
                </label>
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder='Ej: Juan Pérez'
                  className='border-border bg-background text-foreground w-full rounded-xl border px-4 py-2.5 text-[14px] focus:outline-none'
                />
              </div>
              <div>
                <label className='text-muted mb-1.5 block text-[11px] font-semibold uppercase tracking-wide'>
                  Email *
                </label>
                <input
                  type='email'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder='usuario@email.com'
                  required
                  className='border-border bg-background text-foreground w-full rounded-xl border px-4 py-2.5 text-[14px] focus:outline-none'
                />
              </div>
              <div>
                <label className='text-muted mb-1.5 block text-[11px] font-semibold uppercase tracking-wide'>
                  Contraseña temporal *
                </label>
                <input
                  type='password'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder='Mínimo 6 caracteres'
                  required
                  minLength={6}
                  className='border-border bg-background text-foreground w-full rounded-xl border px-4 py-2.5 text-[14px] focus:outline-none'
                />
              </div>

              {createUser.error && (
                <p className='rounded-xl bg-red-950/40 px-3 py-2 text-[12px] text-red-400'>
                  {(createUser.error as Error).message}
                </p>
              )}

              <p className='text-muted text-[11px]'>
                El usuario deberá cambiar la contraseña al ingresar por primera vez.
              </p>

              <button
                type='submit'
                disabled={createUser.isPending || !email.trim() || !password.trim()}
                className='bg-primary text-primary-foreground mt-1 w-full rounded-2xl py-3.5 text-[15px] font-bold disabled:opacity-60'
              >
                {createUser.isPending ? 'Creando...' : 'Crear usuario'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}

export function AdminUsersPage() {
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [showInvite, setShowInvite] = useState(false)
  const toggleActive = useToggleUserActive()

  const { data, isLoading } = useAdminUsers({ page, search })
  const users = data?.users ?? []
  const total = data?.total ?? 0
  const totalPages = Math.ceil(total / PAGE_SIZE)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(0)
    setSearch(searchInput)
  }

  const clearSearch = () => {
    setSearchInput('')
    setSearch('')
    setPage(0)
  }

  return (
    <div className='flex flex-col gap-4 pb-10'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-foreground text-xl font-bold'>Usuarios</h1>
          <p className='text-muted text-[12px]'>
            {total} {total === 1 ? 'usuario' : 'usuarios'} en total
          </p>
        </div>
        <button
          onClick={() => setShowInvite(true)}
          className='bg-primary text-primary-foreground flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[13px] font-bold'
        >
          <UserPlus size={14} strokeWidth={2.5} />
          Invitar
        </button>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className='relative'>
        <Search
          size={15}
          className='text-muted absolute top-1/2 left-3.5 -translate-y-1/2'
        />
        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder='Buscar por email o nombre...'
          className='border-border bg-card text-foreground placeholder:text-muted w-full rounded-xl border py-2.5 pr-10 pl-9 text-[14px] focus:outline-none'
        />
        {searchInput && (
          <button
            type='button'
            onClick={clearSearch}
            className='absolute top-1/2 right-3 -translate-y-1/2'
          >
            <X size={14} className='text-muted' />
          </button>
        )}
      </form>

      {/* Stats row */}
      <div className='grid grid-cols-3 gap-2'>
        <div className='rounded-2xl border border-primary-mid bg-primary-light p-3 text-center'>
          <p className='text-primary text-[22px] font-bold'>{total}</p>
          <p className='text-primary-mid text-[10px]'>total</p>
        </div>
        <div className='rounded-2xl border border-border bg-card-dark p-3 text-center'>
          <p className='text-foreground text-[22px] font-bold'>
            {users.filter((u) => u.is_active).length}
          </p>
          <p className='text-muted text-[10px]'>activos</p>
        </div>
        <div className='rounded-2xl border border-border bg-card-dark p-3 text-center'>
          <p className='text-foreground text-[22px] font-bold'>
            {users.filter((u) => u.role === 'admin').length}
          </p>
          <p className='text-muted text-[10px]'>admins</p>
        </div>
      </div>

      {/* User list */}
      {isLoading ? (
        <div className='flex justify-center py-12'>
          <div className='border-primary h-8 w-8 animate-spin rounded-full border-2 border-t-transparent' />
        </div>
      ) : users.length === 0 ? (
        <div className='rounded-2xl border border-border bg-card-dark p-8 text-center'>
          <User size={32} className='text-muted mx-auto mb-3' strokeWidth={1.5} />
          <p className='text-foreground font-semibold'>Sin resultados</p>
          {search && (
            <p className='text-muted mt-1 text-[13px]'>
              No hay usuarios para "{search}"
            </p>
          )}
        </div>
      ) : (
        <div className='flex flex-col gap-2'>
          {users.map((u) => (
            <UserCard
              key={u.id}
              user={u}
              onToggle={(id, active) =>
                toggleActive.mutate({ userId: id, isActive: active })
              }
              isToggling={toggleActive.isPending}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className='flex items-center justify-between'>
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className='border-border bg-card flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-[13px] font-semibold disabled:opacity-40'
          >
            <ChevronLeft size={15} />
            Anterior
          </button>
          <span className='text-muted text-[12px]'>
            {page + 1} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className='border-border bg-card flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-[13px] font-semibold disabled:opacity-40'
          >
            Siguiente
            <ChevronRight size={15} />
          </button>
        </div>
      )}

      {showInvite && <CreateUserModal onClose={() => setShowInvite(false)} />}
    </div>
  )
}
