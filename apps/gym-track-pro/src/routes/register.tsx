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
    <div className='bg-background min-h-screen'>
      {/* Header */}
      <div className='flex items-center gap-3 px-5 pt-14 pb-4'>
        <button
          onClick={() => navigate({ to: '/login' })}
          className='border-border bg-card flex h-9 w-9 items-center justify-center rounded-full border'
        >
          <ChevronLeft size={18} className='text-foreground' />
        </button>
        <div>
          <h1 className='text-foreground text-[19px] font-bold'>
            Crear cuenta
          </h1>
          <p className='text-muted text-xs'>Completá tus datos</p>
        </div>
      </div>

      {/* Form */}
      <div className='px-5 pb-10'>
        <RegisterForm />

        <p className='text-muted mt-6 text-center text-sm'>
          ¿Ya tenés cuenta?{' '}
          <Link to='/login' className='text-primary font-bold'>
            Iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  )
}

export const Route = createFileRoute('/register')({ component: RegisterPage })
