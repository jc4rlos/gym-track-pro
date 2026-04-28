import { useState } from 'react'
import { X } from 'lucide-react'
import { useUpdateProfile } from './use-body'

type Profile = {
  full_name: string
  gender: 'male' | 'female' | 'other'
  height_cm: number | null
  goal: 'lose_weight' | 'gain_muscle' | 'maintain'
  daily_steps_goal: number
}

type Props = {
  profile: Profile
  onClose: () => void
}

const GENDER_OPTIONS = [
  { value: 'male', label: 'Masculino' },
  { value: 'female', label: 'Femenino' },
  { value: 'other', label: 'Otro' },
] as const

const GOAL_OPTIONS = [
  { value: 'lose_weight', label: 'Bajar de peso' },
  { value: 'gain_muscle', label: 'Ganar músculo' },
  { value: 'maintain', label: 'Mantener peso' },
] as const

function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly { value: T; label: string }[]
  value: T
  onChange: (v: T) => void
}) {
  return (
    <div className='border-border bg-card-dark flex rounded-xl border p-1'>
      {options.map((o) => (
        <button
          key={o.value}
          type='button'
          onClick={() => onChange(o.value)}
          className={`flex-1 rounded-lg py-1.5 text-[12px] font-semibold transition-colors ${
            value === o.value
              ? 'bg-primary text-primary-foreground'
              : 'text-muted'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

export function ProfileEditSheet({ profile, onClose }: Props) {
  const [name, setName] = useState(profile.full_name)
  const [gender, setGender] = useState(profile.gender)
  const [height, setHeight] = useState(profile.height_cm ? String(profile.height_cm) : '')
  const [goal, setGoal] = useState(profile.goal)
  const [stepsGoal, setStepsGoal] = useState(String(profile.daily_steps_goal ?? 10000))

  const update = useUpdateProfile()

  const handleSave = () => {
    update.mutate(
      {
        full_name: name.trim() || profile.full_name,
        gender,
        height_cm: height ? parseFloat(height) : null,
        goal,
        daily_steps_goal: parseInt(stepsGoal) || 10000,
      },
      { onSuccess: onClose }
    )
  }

  return (
    <>
      <div className='fixed inset-0 z-50 bg-black/70 backdrop-blur-sm' onClick={onClose} />
      <div className='fixed inset-0 z-50 flex items-center justify-center px-4'>
        <div className='bg-card border-border flex max-h-[90dvh] w-full max-w-sm flex-col overflow-hidden rounded-3xl border'>
          <div className='flex items-center justify-between px-5 pt-4 pb-3'>
            <h2 className='text-foreground text-[16px] font-bold'>Editar perfil</h2>
            <button
              onClick={onClose}
              className='bg-card-dark flex h-8 w-8 items-center justify-center rounded-full'
            >
              <X size={15} className='text-muted' />
            </button>
          </div>

          <div className='flex-1 overflow-y-auto px-5 pb-5'>
            <div className='flex flex-col gap-4'>
              <div>
                <label className='text-muted mb-1.5 block text-[11px] font-semibold uppercase tracking-wide'>
                  Nombre
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className='border-border bg-background text-foreground w-full rounded-xl border px-4 py-2.5 text-[14px] focus:outline-none'
                />
              </div>

              <div>
                <label className='text-muted mb-1.5 block text-[11px] font-semibold uppercase tracking-wide'>
                  Género
                </label>
                <SegmentedControl
                  options={GENDER_OPTIONS}
                  value={gender}
                  onChange={setGender}
                />
              </div>

              <div>
                <label className='text-muted mb-1.5 block text-[11px] font-semibold uppercase tracking-wide'>
                  Altura (cm)
                </label>
                <input
                  type='number'
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder='170'
                  className='border-border bg-background text-foreground w-full rounded-xl border px-4 py-2.5 text-[14px] focus:outline-none'
                />
              </div>

              <div>
                <label className='text-muted mb-1.5 block text-[11px] font-semibold uppercase tracking-wide'>
                  Objetivo
                </label>
                <SegmentedControl
                  options={GOAL_OPTIONS}
                  value={goal}
                  onChange={setGoal}
                />
              </div>

              <div>
                <label className='text-muted mb-1.5 block text-[11px] font-semibold uppercase tracking-wide'>
                  Meta de pasos diarios
                </label>
                <div className='flex gap-2'>
                  {[5000, 8000, 10000, 12000].map((p) => (
                    <button
                      key={p}
                      type='button'
                      onClick={() => setStepsGoal(String(p))}
                      className={`flex-1 rounded-xl border py-2 text-[11px] font-semibold transition-colors ${
                        stepsGoal === String(p)
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border text-muted'
                      }`}
                    >
                      {p >= 1000 ? `${p / 1000}k` : p}
                    </button>
                  ))}
                </div>
                <input
                  type='number'
                  value={stepsGoal}
                  onChange={(e) => setStepsGoal(e.target.value)}
                  className='border-border bg-background text-foreground mt-2 w-full rounded-xl border px-4 py-2.5 text-center text-[14px] font-bold focus:outline-none'
                  placeholder='10000'
                />
              </div>
            </div>
          </div>

          <div className='border-border border-t px-5 py-4'>
            <button
              onClick={handleSave}
              disabled={update.isPending}
              className='bg-primary text-primary-foreground w-full rounded-2xl py-3.5 text-[15px] font-bold disabled:opacity-60'
            >
              {update.isPending ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
