import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { supabase } from '@/lib/supabase'

type View = 'login' | 'forgot' | 'forgot-sent'

export const LoginForm = () => {
  const navigate = useNavigate()
  const [view, setView] = useState<View>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const inputCls =
    'w-full rounded-xl bg-card border border-border px-4 py-3.5 text-[15px] text-foreground placeholder:text-soft focus:outline-none focus:border-primary/60 transition-colors'

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    setLoading(false)
    if (authError) {
      setError('Correo o contraseña incorrectos')
      return
    }
    navigate({ to: '/dashboard' })
  }

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { error: authError } = await supabase.auth.resetPasswordForEmail(
      email,
      {
        redirectTo: `${window.location.origin}/reset-password`,
      }
    )
    setLoading(false)
    if (authError) {
      setError(authError.message)
      return
    }
    setView('forgot-sent')
  }

  if (view === 'forgot-sent') {
    return (
      <div className='flex flex-col items-center gap-3 py-4 text-center'>
        <p className='text-2xl'>📧</p>
        <p className='font-semibold text-foreground'>Revisa tu correo</p>
        <p className='text-sm text-muted'>
          Enviamos un enlace a <strong>{email}</strong>
        </p>
        <button
          onClick={() => {
            setView('login')
            setError(null)
          }}
          className='mt-2 text-sm font-semibold text-primary'
        >
          Volver al inicio de sesión
        </button>
      </div>
    )
  }

  if (view === 'forgot') {
    return (
      <form onSubmit={handleForgot} className='flex flex-col gap-4'>
        <p className='text-sm text-muted'>
          Ingresá tu correo y te enviamos un enlace para restablecer tu
          contraseña.
        </p>
        <div>
          <label className='mb-1.5 block text-xs font-medium text-muted'>
            Correo electrónico
          </label>
          <input
            className={inputCls}
            type='email'
            placeholder='carlos@gmail.com'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete='email'
          />
        </div>
        {error && (
          <p className='rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive'>
            {error}
          </p>
        )}
        <button
          type='submit'
          disabled={loading}
          className='w-full rounded-[14px] bg-primary py-3.5 text-[15px] font-bold text-primary-foreground transition-opacity disabled:opacity-60'
        >
          {loading ? 'Enviando...' : 'Enviar enlace'}
        </button>
        <button
          type='button'
          onClick={() => {
            setView('login')
            setError(null)
          }}
          className='text-center text-sm text-muted'
        >
          Volver al inicio de sesión
        </button>
      </form>
    )
  }

  return (
    <form onSubmit={handleLogin} className='flex flex-col gap-4'>
      <div>
        <label className='mb-1.5 block text-xs font-medium text-muted'>
          Correo electrónico
        </label>
        <input
          className={inputCls}
          type='email'
          placeholder='carlos@gmail.com'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete='email'
        />
      </div>
      <div>
        <label className='mb-1.5 block text-xs font-medium text-muted'>
          Contraseña
        </label>
        <input
          className={inputCls}
          type='password'
          placeholder='••••••••'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete='current-password'
        />
      </div>
      <div className='text-right'>
        <button
          type='button'
          onClick={() => {
            setView('forgot')
            setError(null)
          }}
          className='text-xs font-medium text-primary'
        >
          ¿Olvidaste tu contraseña?
        </button>
      </div>
      {error && (
        <p className='rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive'>
          {error}
        </p>
      )}
      <button
        type='submit'
        disabled={loading}
        className='w-full rounded-[14px] bg-primary py-3.5 text-[15px] font-bold text-primary-foreground shadow-primary transition-opacity disabled:opacity-60'
      >
        {loading ? 'Ingresando...' : 'Iniciar sesión'}
      </button>
    </form>
  )
}
