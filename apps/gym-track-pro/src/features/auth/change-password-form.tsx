import { useState } from 'react'
import { Eye, EyeOff, Lock } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type Props = {
  onSuccess?: () => void
}

export const ChangePasswordForm = ({ onSuccess }: Props) => {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

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

    setSuccess(true)
    setPassword('')
    setConfirm('')
    onSuccess?.()
  }

  if (success) {
    return (
      <div className='flex flex-col items-center gap-3 py-6 text-center'>
        <span className='text-4xl'>✅</span>
        <p className='font-semibold text-foreground'>Contraseña actualizada</p>
        <p className='text-sm text-muted'>
          Ya puedes iniciar sesión con tu nueva contraseña
        </p>
      </div>
    )
  }

  return (
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
          className='absolute right-3 bottom-3 text-muted'
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
        Cambiar contraseña
      </Button>
    </form>
  )
}
