import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'

type Gender = 'male' | 'female' | 'other'

const genderOptions: { value: Gender; symbol: string; label: string }[] = [
  { value: 'male', symbol: '♂', label: 'Hombre' },
  { value: 'female', symbol: '♀', label: 'Mujer' },
  { value: 'other', symbol: '⚥', label: 'Otro' },
]

export const RegisterForm = () => {
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [gender, setGender] = useState<Gender>('male')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const inputCls =
    'w-full rounded-xl bg-card border border-border px-4 py-3.5 text-[15px] text-foreground placeholder:text-soft focus:outline-none focus:border-primary/60 transition-colors'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fullName.trim()) {
      setError('Ingresá tu nombre')
      return
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }
    setError(null)
    setLoading(true)
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName.trim(), gender } },
    })
    setLoading(false)
    if (authError) {
      setError(authError.message)
      return
    }
    navigate({ to: '/onboarding' })
  }

  return (
    <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
      <div>
        <label className='text-muted mb-1.5 block text-xs font-medium'>
          Nombre completo
        </label>
        <input
          className={inputCls}
          placeholder='Carlos García'
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          autoComplete='name'
          required
        />
      </div>

      <div>
        <label className='text-muted mb-1.5 block text-xs font-medium'>
          Correo electrónico
        </label>
        <input
          className={inputCls}
          type='email'
          placeholder='carlos@gmail.com'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete='email'
          required
        />
      </div>

      <div>
        <label className='text-muted mb-1.5 block text-xs font-medium'>
          Contraseña
        </label>
        <input
          className={inputCls}
          type='password'
          placeholder='Mínimo 6 caracteres'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete='new-password'
          required
        />
      </div>

      {/* Gender selector */}
      <div>
        <label className='text-muted mb-2.5 block text-xs font-medium'>
          Género
        </label>
        <div className='flex gap-3'>
          {genderOptions.map((g) => {
            const active = gender === g.value
            return (
              <button
                key={g.value}
                type='button'
                onClick={() => setGender(g.value)}
                className={cn(
                  'flex flex-1 flex-col items-center rounded-[14px] border py-3.5 transition-colors',
                  active
                    ? 'bg-primary-light border-primary border-2'
                    : 'border-border bg-card border'
                )}
              >
                <span className='mb-1 text-2xl'>{g.symbol}</span>
                <span
                  className={cn(
                    'text-[13px] font-medium',
                    active ? 'text-primary font-bold' : 'text-muted'
                  )}
                >
                  {g.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {error && (
        <p className='bg-destructive/10 text-destructive rounded-xl px-4 py-3 text-sm'>
          {error}
        </p>
      )}

      <button
        type='submit'
        disabled={loading}
        className='bg-primary text-primary-foreground w-full rounded-[14px] py-3.5 text-[15px] font-bold transition-opacity disabled:opacity-60'
      >
        {loading ? 'Creando cuenta...' : 'Crear cuenta'}
      </button>

      <p className='text-soft pb-2 text-center text-xs'>
        Al registrarte aceptás los{' '}
        <span className='text-primary'>Términos</span> y{' '}
        <span className='text-primary'>Privacidad</span>
      </p>
    </form>
  )
}
