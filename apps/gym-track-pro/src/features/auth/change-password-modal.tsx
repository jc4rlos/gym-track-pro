import { useState } from 'react'
import { Lock } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth-store'
import { useQueryClient } from '@tanstack/react-query'

export function ChangePasswordModal() {
  const { user } = useAuthStore()
  const qc = useQueryClient()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      return
    }
    if (password !== confirm) {
      setError('Las contraseñas no coinciden.')
      return
    }

    setIsLoading(true)
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password })
      if (updateError) throw updateError

      await supabase
        .from('profiles')
        .update({ must_change_password: false })
        .eq('id', user!.id)

      qc.invalidateQueries({ queryKey: ['profile', user?.id] })
      navigate({ to: '/onboarding' })
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='fixed inset-0 z-[100] flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm'>
      <div className='bg-card border-border w-full max-w-sm overflow-hidden rounded-3xl border'>
        <div className='flex flex-col items-center px-6 pt-8 pb-2'>
          <div className='bg-primary-light mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#2a4a1a]'>
            <Lock size={24} className='text-primary' />
          </div>
          <h2 className='text-foreground text-[18px] font-bold'>
            Cambiá tu contraseña
          </h2>
          <p className='text-muted mt-1 text-center text-[13px]'>
            Por seguridad, necesitás crear una contraseña personal antes de continuar.
          </p>
        </div>

        <form onSubmit={handleSubmit} className='px-6 pb-6 pt-4'>
          <div className='flex flex-col gap-3'>
            <div>
              <label className='text-muted mb-1.5 block text-[11px] font-semibold uppercase tracking-wide'>
                Nueva contraseña
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
            <div>
              <label className='text-muted mb-1.5 block text-[11px] font-semibold uppercase tracking-wide'>
                Confirmar contraseña
              </label>
              <input
                type='password'
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder='Repetí la contraseña'
                required
                className='border-border bg-background text-foreground w-full rounded-xl border px-4 py-2.5 text-[14px] focus:outline-none'
              />
            </div>

            {error && (
              <p className='rounded-xl bg-red-950/40 px-3 py-2 text-[12px] text-red-400'>
                {error}
              </p>
            )}

            <button
              type='submit'
              disabled={isLoading || !password || !confirm}
              className='bg-primary text-primary-foreground mt-1 w-full rounded-2xl py-3.5 text-[15px] font-bold disabled:opacity-60'
            >
              {isLoading ? 'Guardando...' : 'Guardar contraseña'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
