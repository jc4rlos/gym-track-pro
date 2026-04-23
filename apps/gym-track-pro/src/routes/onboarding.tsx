import { useState } from 'react'
import { createFileRoute, Navigate, useNavigate } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/auth-store'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'

type Goal = 'lose_weight' | 'gain_muscle' | 'maintain'

const goals: { value: Goal; label: string; sub: string; emoji: string }[] = [
  {
    value: 'lose_weight',
    label: 'Perder peso',
    sub: 'Déficit calórico',
    emoji: '🔥',
  },
  {
    value: 'gain_muscle',
    label: 'Ganar músculo',
    sub: 'Superávit calórico',
    emoji: '💪',
  },
  {
    value: 'maintain',
    label: 'Mantenerme',
    sub: 'Balance calórico',
    emoji: '⚖️',
  },
]

const gymDayOptions = [2, 3, 4, 5, 6]

const OnboardingPage = () => {
  const { user, isLoading } = useAuthStore()
  const navigate = useNavigate()

  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [goal, setGoal] = useState<Goal | null>(null)
  const [gymDays, setGymDays] = useState<number | null>(4)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (isLoading) return null
  if (!user) return <Navigate to='/login' />

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!goal) {
      setError('Seleccioná un objetivo')
      return
    }
    setError(null)
    setSubmitting(true)
    const { error: dbError } = await supabase
      .from('profiles')
      .update({
        goal,
        gym_days_per_week: gymDays,
        height_cm: height ? Number(height) : null,
        weight_kg: weight ? Number(weight) : null,
        birth_date: birthDate || null,
      })
      .eq('id', user.id)
    setSubmitting(false)
    if (dbError) {
      setError(dbError.message)
      return
    }
    navigate({ to: '/dashboard' })
  }

  const inputCls =
    'w-full rounded-xl bg-card border border-border px-4 py-3.5 text-[15px] text-foreground placeholder:text-soft focus:outline-none focus:border-primary/60 transition-colors'

  return (
    <div className='min-h-screen bg-background'>
      <div className='px-5 pt-14 pb-10'>
        {/* Progress bar — 1 de 2 */}
        <div className='mb-5 flex gap-1.5'>
          <div className='h-1 flex-1 rounded-full bg-primary' />
          <div className='h-1 flex-1 rounded-full bg-border' />
        </div>

        <h1 className='text-[22px] font-bold text-foreground'>
          Tu perfil físico
        </h1>
        <p className='mt-1 mb-6 text-[13px] text-muted'>
          Para calcular tu IMC y recomendaciones
        </p>

        <form onSubmit={handleSubmit} className='flex flex-col gap-5'>
          {/* Altura + Peso */}
          <div className='flex gap-3'>
            <div className='flex-1'>
              <label className='mb-1.5 block text-xs font-medium text-muted'>
                Altura (cm)
              </label>
              <input
                className={inputCls}
                type='number'
                placeholder='175'
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                min='100'
                max='250'
              />
            </div>
            <div className='flex-1'>
              <label className='mb-1.5 block text-xs font-medium text-muted'>
                Peso (kg)
              </label>
              <input
                className={inputCls}
                type='number'
                placeholder='78'
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                min='30'
                max='300'
              />
            </div>
          </div>

          {/* Fecha de nacimiento */}
          <div>
            <label className='mb-1.5 block text-xs font-medium text-muted'>
              Fecha de nacimiento
            </label>
            <input
              className={inputCls}
              type='date'
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
            />
          </div>

          {/* Objetivo */}
          <div>
            <label className='mb-2.5 block text-xs font-medium text-muted'>
              Objetivo principal
            </label>
            <div className='flex flex-col gap-2'>
              {goals.map((g) => {
                const active = goal === g.value
                return (
                  <button
                    key={g.value}
                    type='button'
                    onClick={() => setGoal(g.value)}
                    className={cn(
                      'flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors',
                      active
                        ? 'bg-primary-light border-2 border-primary'
                        : 'border border-border bg-card'
                    )}
                  >
                    {/* Radio dot */}
                    <div
                      className={cn(
                        'flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2',
                        active
                          ? 'border-primary bg-primary'
                          : 'border-border bg-background'
                      )}
                    >
                      {active && (
                        <svg width='10' height='10' viewBox='0 0 10 10'>
                          <polyline
                            points='1.5,5 4,7.5 8.5,2.5'
                            fill='none'
                            stroke='#0f0f0f'
                            strokeWidth='1.8'
                            strokeLinecap='round'
                          />
                        </svg>
                      )}
                    </div>
                    <div className='flex-1'>
                      <p
                        className={cn(
                          'text-[13px] font-medium',
                          active ? 'font-bold text-primary' : 'text-foreground'
                        )}
                      >
                        {g.label}
                      </p>
                      <p
                        className={cn(
                          'text-[11px]',
                          active ? 'text-primary/70' : 'text-muted'
                        )}
                      >
                        {g.sub}
                      </p>
                    </div>
                    <span className='text-xl'>{g.emoji}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Días por semana */}
          <div>
            <label className='mb-2.5 block text-xs font-medium text-muted'>
              Días por semana en el gym
            </label>
            <div className='flex gap-2'>
              {gymDayOptions.map((d) => {
                const active = gymDays === d
                return (
                  <button
                    key={d}
                    type='button'
                    onClick={() => setGymDays(d)}
                    className={cn(
                      'flex-1 rounded-xl border py-2.5 text-sm font-medium transition-colors',
                      active
                        ? 'bg-primary-light border-2 border-primary font-bold text-primary'
                        : 'border border-border bg-card text-foreground'
                    )}
                  >
                    {d}
                  </button>
                )
              })}
            </div>
          </div>

          {error && (
            <p className='rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive'>
              {error}
            </p>
          )}

          <button
            type='submit'
            disabled={submitting}
            className='w-full rounded-[14px] bg-primary py-3.5 text-[15px] font-bold text-primary-foreground transition-opacity disabled:opacity-60'
          >
            {submitting ? 'Guardando...' : 'Continuar →'}
          </button>
        </form>
      </div>
    </div>
  )
}

export const Route = createFileRoute('/onboarding')({
  component: OnboardingPage,
})
