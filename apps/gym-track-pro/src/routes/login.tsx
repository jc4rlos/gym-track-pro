import { createFileRoute, Link, Navigate } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/auth-store'
import { LoginForm } from '@/features/auth/login-form'

const LoginPage = () => {
  const { user, isLoading } = useAuthStore()

  if (isLoading) return null
  if (user) return <Navigate to='/dashboard' />

  return (
    <div className='bg-background flex min-h-screen flex-col'>
      {/* Branding */}
      <div className='flex flex-1 flex-col items-center justify-center px-6 pt-10'>
        <div className='bg-primary shadow-primary mb-5 flex h-[68px] w-[68px] items-center justify-center rounded-[22px] text-[34px]'>
          💪
        </div>
        <div className='font-display text-foreground text-[36px] leading-none'>
          GymTrack
        </div>
        <div className='font-display text-primary mb-8 text-[36px] leading-none'>
          Pro
        </div>

        <div className='w-full max-w-sm'>
          <LoginForm />
        </div>
      </div>

      {/* Register link */}
      <div className='px-6 pt-5 pb-10 text-center'>
        <span className='text-muted text-sm'>¿No tenés cuenta? </span>
        <Link to='/register' className='text-primary text-sm font-bold'>
          Registrarse
        </Link>
      </div>
    </div>
  )
}

export const Route = createFileRoute('/login')({ component: LoginPage })
