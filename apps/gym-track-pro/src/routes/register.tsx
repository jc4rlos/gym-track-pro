import {
  createFileRoute,
  Link,
  Navigate,
  useNavigate,
} from '@tanstack/react-router'
import { ChevronLeft } from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'
import { RegisterForm } from '@/features/auth/register-form'

const RegisterPage = () => {
  const { user, isLoading } = useAuthStore()
  const navigate = useNavigate()

  if (isLoading) return null
  if (user) return <Navigate to='/dashboard' />

  return (
    <div className='min-h-screen bg-background'>
      {/* Header */}
      <div className='flex items-center gap-3 px-5 pt-14 pb-4'>
        <button
          onClick={() => navigate({ to: '/login' })}
          className='flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card'
        >
          <ChevronLeft size={18} className='text-foreground' />
        </button>
        <div>
          <h1 className='text-[19px] font-bold text-foreground'>
            Crear cuenta
          </h1>
          <p className='text-xs text-muted'>Completá tus datos</p>
        </div>
      </div>

      {/* Form */}
      <div className='px-5 pb-10'>
        <RegisterForm />

        <p className='mt-6 text-center text-sm text-muted'>
          ¿Ya tenés cuenta?{' '}
          <Link to='/login' className='font-bold text-primary'>
            Iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  )
}

export const Route = createFileRoute('/register')({ component: RegisterPage })
