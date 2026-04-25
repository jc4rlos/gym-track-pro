import { useEffect, useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Eye, EyeOff, Lock } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type State = 'loading' | 'ready' | 'success' | 'expired'

const ResetPasswordPage = () => {
  const navigate = useNavigate()
  const [state, setState] = useState<State>('loading')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setState('ready')
      }
    })

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setState('ready')
      else setState('expired')
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres')
      return
    }

    if (password !== confirm) {
      setError('Las contraseñas no coinciden')
      return
    }

    setLoading(true)
    const { error: authError } = await supabase.auth.updateUser({ password })
    setLoading(false)

    if (authError) {
      setError(authError.message)
      return
    }

    setState('success')
    setTimeout(() => navigate({ to: '/dashboard' }), 2000)
  }

  return (
    <div className='bg-background flex min-h-screen items-center justify-center px-5'>
      <div className='w-full max-w-sm'>
        <div className='mb-10 flex flex-col items-center'>
          <span className='mb-4 text-5xl'>🐷</span>
          <h1 className='text-foreground text-2xl font-bold'>Chanchi</h1>
        </div>

        <div className='border-border bg-card shadow-card rounded-3xl border p-6'>
          {state === 'loading' && (
            <div className='flex justify-center py-6'>
              <div className='border-primary h-6 w-6 animate-spin rounded-full border-2 border-t-transparent' />
            </div>
          )}

          {state === 'expired' && (
            <div className='flex flex-col items-center gap-3 py-4 text-center'>
              <span className='text-4xl'>⏰</span>
              <p className='text-foreground font-semibold'>Enlace expirado</p>
              <p className='text-muted text-sm'>
                El enlace ya no es válido. Solicita uno nuevo.
              </p>
              <button
                onClick={() => navigate({ to: '/login' })}
                className='text-primary mt-2 text-sm font-medium'
              >
                Volver al inicio de sesión
              </button>
            </div>
          )}

          {state === 'success' && (
            <div className='flex flex-col items-center gap-3 py-4 text-center'>
              <span className='text-4xl'>✅</span>
              <p className='text-foreground font-semibold'>Contraseña creada</p>
              <p className='text-muted text-sm'>Redirigiendo al dashboard...</p>
            </div>
          )}

          {state === 'ready' && (
            <>
              <h2 className='text-foreground mb-1 text-lg font-semibold'>
                Crear contraseña
              </h2>
              <p className='text-muted mb-5 text-sm'>
                Elige una contraseña segura para tu cuenta.
              </p>

              <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
                <div className='relative'>
                  <Input
                    label='Nueva contraseña'
                    type={showPwd ? 'text' : 'password'}
                    placeholder='Mínimo 8 caracteres'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    leftIcon={<Lock size={16} />}
                    required
                    autoComplete='new-password'
                  />
                  <button
                    type='button'
                    onClick={() => setShowPwd((v) => !v)}
                    className='text-muted absolute right-3 bottom-3'
                    tabIndex={-1}
                  >
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                <Input
                  label='Confirmar contraseña'
                  type={showPwd ? 'text' : 'password'}
                  placeholder='Repite la contraseña'
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  leftIcon={<Lock size={16} />}
                  required
                  autoComplete='new-password'
                />

                {error && (
                  <div className='bg-danger-light text-danger rounded-xl px-4 py-3 text-sm'>
                    {error}
                  </div>
                )}

                <Button type='submit' fullWidth loading={loading} size='lg'>
                  Guardar contraseña
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export const Route = createFileRoute('/reset-password')({
  component: ResetPasswordPage,
})
