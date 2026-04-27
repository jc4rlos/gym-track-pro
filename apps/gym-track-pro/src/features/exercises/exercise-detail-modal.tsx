import { X, Check, Dumbbell } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useExerciseDetail } from './use-exercises-query'
import { ExerciseDifficultyDots } from './exercise-difficulty-dots'

type Props = {
  exerciseId: string
  isChecked: boolean
  onToggle: () => void
  onClose: () => void
}

export function ExerciseDetailModal({
  exerciseId,
  isChecked,
  onToggle,
  onClose,
}: Props) {
  const { data: exercise, isLoading } = useExerciseDetail(exerciseId)

  return (
    <>
      <div
        className='fixed inset-0 z-50 bg-black/70 backdrop-blur-sm'
        onClick={onClose}
      />

      <div className='fixed right-0 bottom-0 left-0 z-50 flex max-h-[92dvh] flex-col rounded-t-3xl border-t border-border bg-card'>
        <div className='flex items-center justify-between px-5 pt-4 pb-3'>
          <div className='h-1 w-10 rounded-full bg-soft/30 absolute top-2.5 left-1/2 -translate-x-1/2' />
          <h2 className='text-foreground flex-1 truncate pr-4 text-[16px] font-bold'>
            {isLoading ? '...' : (exercise?.name_es || exercise?.name || '—')}
          </h2>
          <button
            onClick={onClose}
            className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-card-dark'
          >
            <X size={16} className='text-muted' />
          </button>
        </div>

        <div className='flex-1 overflow-y-auto'>
          {isLoading ? (
            <div className='flex h-48 items-center justify-center'>
              <div className='border-primary h-8 w-8 animate-spin rounded-full border-2 border-t-transparent' />
            </div>
          ) : exercise ? (
            <div className='flex flex-col gap-3 px-4 pb-4'>
              <div className='flex h-48 items-center justify-center overflow-hidden rounded-2xl border border-border bg-card-dark'>
                {exercise.gif_url ? (
                  <video
                    src={exercise.gif_url}
                    controls
                    loop
                    muted
                    playsInline
                    className='h-full w-full object-contain'
                  />
                ) : (
                  <Dumbbell size={40} className='text-soft' strokeWidth={1.5} />
                )}
              </div>

              <div className='grid grid-cols-2 gap-2'>
                <div className='rounded-xl border border-border bg-card-dark p-3'>
                  <p className='text-muted mb-1 text-[10px] uppercase'>Músculo principal</p>
                  <p className='text-primary text-[14px] font-bold capitalize'>
                    {exercise.target_muscle || exercise.body_part || 'General'}
                  </p>
                </div>
                <div className='rounded-xl border border-border bg-card-dark p-3'>
                  <p className='text-muted mb-1 text-[10px] uppercase'>Equipamiento</p>
                  <p className='text-foreground text-[14px] font-bold capitalize'>
                    {exercise.equipment || 'Peso corporal'}
                  </p>
                </div>
              </div>

              {(exercise.secondary_muscles as string[] | null)?.length ? (
                <div className='rounded-xl border border-border bg-card-dark p-3'>
                  <p className='text-muted mb-2 text-[10px] uppercase'>Músculos secundarios</p>
                  <div className='flex flex-wrap gap-1.5'>
                    {(exercise.secondary_muscles as string[]).slice(0, 4).map((m) => (
                      <span
                        key={m}
                        className='rounded-full bg-card px-2.5 py-0.5 text-[11px] text-muted'
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className='rounded-xl border border-border bg-card-dark p-3'>
                <p className='text-muted mb-2 text-[10px] uppercase'>Dificultad</p>
                <ExerciseDifficultyDots
                  difficulty={
                    (exercise.difficulty as 'beginner' | 'intermediate' | 'advanced') || 'beginner'
                  }
                  size='sm'
                />
              </div>

              {((exercise as { starting_position?: string | null }).starting_position ||
                (exercise as { execution?: string | null }).execution ||
                (exercise.instructions as string[] | null)?.length) ? (
                <div className='rounded-xl border border-border bg-card-dark p-4'>
                  <p className='text-foreground mb-4 text-[14px] font-bold'>
                    Guía para realizar el ejercicio
                  </p>

                  {(exercise as { starting_position?: string | null }).starting_position && (
                    <div className='mb-4'>
                      <p className='text-primary mb-1.5 text-[11px] font-semibold uppercase tracking-wide'>
                        Posición inicial
                      </p>
                      <p className='text-foreground text-[13px] leading-relaxed'>
                        {(exercise as { starting_position?: string | null }).starting_position}
                      </p>
                    </div>
                  )}

                  {(exercise as { execution?: string | null }).execution && (
                    <div className='mb-4'>
                      <p className='text-primary mb-1.5 text-[11px] font-semibold uppercase tracking-wide'>
                        Ejecución
                      </p>
                      <p className='text-foreground text-[13px] leading-relaxed'>
                        {(exercise as { execution?: string | null }).execution}
                      </p>
                    </div>
                  )}

                  {(exercise.instructions as string[] | null)?.length ? (
                    <div>
                      <p className='text-primary mb-2.5 text-[11px] font-semibold uppercase tracking-wide'>
                        Durante todo el movimiento:
                      </p>
                      <div className='flex flex-col gap-2.5'>
                        {(exercise.instructions as string[]).map((step, i) => (
                          <div key={i} className='flex items-start gap-3'>
                            <div
                              className={cn(
                                'flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold',
                                i === 0
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-primary-light text-primary border border-primary-mid'
                              )}
                            >
                              {i + 1}
                            </div>
                            <p className='text-foreground pt-0.5 text-[13px] leading-relaxed'>
                              {step}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className='border-t border-border px-4 py-3'>
          <button
            onClick={() => {
              onToggle()
              onClose()
            }}
            className={cn(
              'flex w-full items-center justify-center gap-2.5 rounded-2xl py-3.5 text-[15px] font-bold transition-colors',
              isChecked
                ? 'bg-card-dark text-muted border border-border'
                : 'bg-primary text-primary-foreground shadow-primary'
            )}
          >
            <Check size={18} strokeWidth={2.5} />
            {isChecked ? 'Desmarcar ejercicio' : 'Marcar como completado'}
          </button>
        </div>
      </div>
    </>
  )
}
