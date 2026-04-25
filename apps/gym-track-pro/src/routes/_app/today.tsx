import { useEffect, useRef, useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ChevronLeft, Plus } from 'lucide-react'
import { useTodayPlanRoutines } from '@/features/plan/use-weekly-plan'
import { AddMuscleSheet } from '@/features/today/add-muscle-sheet'
import { MuscleItem } from '@/features/today/muscle-item'
import { TodayPlanView } from '@/features/today/today-plan-view'
import {
  useTodaySession,
  useCreateSession,
  useFinishSession,
  useFinishPlanSession,
  useUpdateNotes,
  useSessionPlanExercises,
  useTogglePlanExercise,
} from '@/features/today/use-today'

// ── Timer ────────────────────────────────────────────────
function useElapsed(
  startedAt: string | null,
  finishedAt: string | null = null
) {
  const [elapsed, setElapsed] = useState(0)
  useEffect(() => {
    if (!startedAt || finishedAt) return
    const update = () => {
      setElapsed(
        Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000)
      )
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [startedAt, finishedAt])

  if (startedAt && finishedAt) {
    return Math.floor(
      (new Date(finishedAt).getTime() - new Date(startedAt).getTime()) / 1000
    )
  }
  return elapsed
}

function fmtTime(secs: number) {
  const h = Math.floor(secs / 3600)
  const m = Math.floor((secs % 3600) / 60)
  const s = secs % 60
  if (h > 0)
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function formatDate(d: Date) {
  return d.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

// ── No-session empty state ────────────────────────────────
const NoSession = ({ onCreate }: { onCreate: () => void }) => (
  <div className='flex flex-col items-center justify-center gap-4 py-24 text-center'>
    <div className='bg-primary-light flex h-16 w-16 items-center justify-center rounded-2xl'>
      <svg
        width='28'
        height='28'
        viewBox='0 0 24 24'
        fill='none'
        stroke='#a3e635'
        strokeWidth='2'
        strokeLinecap='round'
      >
        <line x1='12' y1='5' x2='12' y2='19' />
        <line x1='5' y1='12' x2='19' y2='12' />
      </svg>
    </div>
    <div>
      <p className='text-foreground text-[18px] font-bold'>Sin sesión hoy</p>
      <p className='text-muted mt-1 text-[13px]'>
        Registrá tus grupos musculares y comenzá
      </p>
    </div>
    <button
      onClick={onCreate}
      className='bg-primary text-primary-foreground rounded-[14px] px-8 py-3.5 text-[15px] font-bold'
      style={{ boxShadow: '0 4px 24px rgba(163,230,53,.2)' }}
    >
      Iniciar sesión de hoy
    </button>
  </div>
)

// ── Main page ─────────────────────────────────────────────
const TodayPage = () => {
  const navigate = useNavigate()
  const { data: session, isLoading } = useTodaySession()
  const { data: planRoutines, isLoading: isPlanLoading } =
    useTodayPlanRoutines()
  const createSession = useCreateSession()
  const finishSession = useFinishSession()
  const updateNotes = useUpdateNotes()

  const hasPlan = planRoutines != null && planRoutines.length > 0
  const finishPlanSession = useFinishPlanSession()
  const { data: sessionExercises } = useSessionPlanExercises(session?.id)
  const togglePlanExercise = useTogglePlanExercise()
  const checkedExercises = sessionExercises ?? new Set<string>()

  const toggleExercise = (id: string) => {
    if (!session) return
    togglePlanExercise.mutate({
      sessionId: session.id,
      exerciseId: id,
      checked: !checkedExercises.has(id),
    })
  }
  const elapsed = useElapsed(
    session?.started_at ?? null,
    session?.finished_at ?? null
  )
  const [showAdd, setShowAdd] = useState(false)
  const notesRef = useRef<HTMLTextAreaElement>(null)
  const notesTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  if (isLoading) return null

  if (!session && !createSession.isPending) {
    if (hasPlan) {
      return (
        <div className='flex flex-col gap-4 pb-10'>
          <div>
            <p className='text-foreground text-[18px] font-bold'>Plan de hoy</p>
            <p className='text-muted mt-0.5 text-[13px]'>
              {formatDate(new Date())}
            </p>
          </div>
          <TodayPlanView
            routines={planRoutines!}
            checked={new Set()}
            onToggle={() => {}}
            onExerciseDetail={(id) =>
              navigate({
                to: '/exercises/$exerciseId',
                params: { exerciseId: id },
              })
            }
          />
          <button
            onClick={() => createSession.mutate()}
            className='bg-primary text-primary-foreground flex w-full items-center justify-center gap-2.5 rounded-[14px] py-3.5 font-bold'
            style={{ boxShadow: '0 4px 24px rgba(163,230,53,.2)' }}
          >
            Comenzar entrenamiento
          </button>
        </div>
      )
    }
    return (
      <div className='pb-10'>
        <NoSession onCreate={() => createSession.mutate()} />
      </div>
    )
  }

  if (!session) return null

  const muscles = session.session_muscle_groups ?? []

  const allPlanExercises = hasPlan
    ? planRoutines!.flatMap((r) => r.routines?.routine_exercises ?? [])
    : []
  const totalExercises = allPlanExercises.length
  const doneExercises = allPlanExercises.filter((e) =>
    checkedExercises.has(e.id)
  ).length

  const done = muscles.filter((m) => m.is_completed)
  const total = hasPlan ? totalExercises : muscles.length
  const doneCount = hasPlan ? doneExercises : done.length
  const pct = total > 0 ? Math.round((doneCount / total) * 100) : 0
  const isFinished = !!session.finished_at

  const todayLabel = formatDate(new Date())
  const muscleNames = muscles
    .slice(0, 3)
    .map((m) => m.muscle_groups?.name_es)
    .filter(Boolean)
    .join(' · ')

  const handleNotesChange = (val: string) => {
    if (notesTimer.current) clearTimeout(notesTimer.current)
    notesTimer.current = setTimeout(() => {
      updateNotes.mutate({ sessionId: session.id, notes: val })
    }, 800)
  }

  return (
    <div className='flex flex-col gap-3.5 pb-10'>
      {/* Header */}
      <div className='border-border flex items-center gap-3 border-b pb-3'>
        <button
          onClick={() => navigate({ to: '/dashboard' })}
          className='border-border bg-card flex h-[34px] w-[34px] flex-shrink-0 items-center justify-center rounded-full border'
        >
          <ChevronLeft size={16} className='text-foreground' />
        </button>
        <div className='min-w-0 flex-1'>
          <p className='text-foreground text-[15px] font-bold capitalize'>
            {todayLabel}
          </p>
          <p className='text-muted truncate text-[11px]'>
            {new Date(session.started_at).toLocaleTimeString('es-ES', {
              hour: '2-digit',
              minute: '2-digit',
            })}{' '}
            · {muscleNames || 'Sin grupos aún'}
          </p>
        </div>
        <div className='bg-primary-light flex items-center gap-1.5 rounded-full border border-[#2a4a1a] px-2.5 py-1'>
          {!isFinished && (
            <div className='bg-primary h-1.5 w-1.5 rounded-full' />
          )}
          <span className='text-primary text-[11px] font-bold'>
            {isFinished ? 'TERMINADO' : 'EN CURSO'}
          </span>
        </div>
      </div>

      {/* Progress card */}
      <div className='rounded-[18px] border border-[#1e1e1e] bg-[#131313] p-4'>
        <div className='mb-3 flex items-start justify-between'>
          <div>
            <p className='text-muted text-[11px] font-medium tracking-wide uppercase'>
              Completados
            </p>
            <p className='mt-0.5 leading-none'>
              <span className='font-display text-primary text-[48px]'>
                {doneCount}
              </span>
              <span className='font-display text-[22px] text-[#3a3a3a]'>
                {' '}
                / {total}
              </span>
            </p>
          </div>
          <div className='text-right'>
            <p className='font-display text-foreground text-[28px] leading-none'>
              {fmtTime(elapsed)}
            </p>
            <p className='text-muted text-[10px]'>tiempo activo</p>
          </div>
        </div>
        {/* Progress bar with dot */}
        <div className='relative h-2 overflow-visible rounded-full bg-[#1a1a1a]'>
          <div
            className='bg-primary h-full rounded-full transition-all duration-500'
            style={{ width: `${pct}%` }}
          />
          {pct > 0 && pct < 100 && (
            <div
              className='bg-primary absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#131313]'
              style={{ left: `${pct}%` }}
            />
          )}
        </div>
      </div>

      {/* Exercise / Muscle list */}
      {hasPlan ? (
        <div>
          <p className='text-muted mb-2.5 text-[11px] font-semibold tracking-wide uppercase'>
            Rutinas de hoy
          </p>
          <TodayPlanView
            routines={planRoutines!}
            checked={checkedExercises}
            onToggle={toggleExercise}
            onExerciseDetail={(id) =>
              navigate({
                to: '/exercises/$exerciseId',
                params: { exerciseId: id },
              })
            }
          />
        </div>
      ) : (
        <div>
          <div className='mb-2.5 flex items-center justify-between'>
            <p className='text-muted text-[11px] font-semibold tracking-wide uppercase'>
              Grupos musculares
            </p>
            {!isFinished && (
              <button
                onClick={() => setShowAdd(true)}
                className='text-primary flex items-center gap-1 text-[12px] font-semibold'
              >
                <Plus size={14} strokeWidth={2.5} />
                Agregar
              </button>
            )}
          </div>

          {muscles.length === 0 ? (
            <button
              onClick={() => setShowAdd(true)}
              className='border-border text-muted flex w-full items-center justify-center gap-2 rounded-[14px] border border-dashed py-6 text-[13px] font-medium'
            >
              <Plus size={16} strokeWidth={2} />
              Agregar grupos musculares
            </button>
          ) : (
            <div className='flex flex-col gap-2'>
              {muscles.map((m) => (
                <MuscleItem key={m.id} item={m} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Notes */}
      <div className='border-border bg-card rounded-[14px] border p-3.5'>
        <p className='text-muted mb-2 text-[11px] font-semibold tracking-wide uppercase'>
          Notas
        </p>
        <textarea
          ref={notesRef}
          defaultValue={session.notes ?? ''}
          onChange={(e) => handleNotesChange(e.target.value)}
          placeholder='Ej: Aumenté press banca a 80 kg...'
          className='placeholder:text-soft text-foreground w-full resize-none bg-transparent text-[13px] focus:outline-none'
          rows={2}
          readOnly={isFinished}
        />
      </div>

      {/* Finish / finished */}
      {!isFinished ? (
        <button
          onClick={() => {
            if (hasPlan) {
              finishPlanSession.mutate({
                sessionId: session.id,
                allExercises: allPlanExercises.map((e) => ({
                  id: e.id,
                  target_muscle: e.exercises?.target_muscle ?? null,
                })),
              })
            } else {
              finishSession.mutate(session.id)
            }
          }}
          disabled={
            finishSession.isPending ||
            finishPlanSession.isPending ||
            isPlanLoading
          }
          className='bg-primary flex w-full items-center justify-center gap-2.5 rounded-[14px] py-3.5 disabled:opacity-60'
          style={{ boxShadow: '0 4px 24px rgba(163,230,53,.25)' }}
        >
          <svg
            width='18'
            height='18'
            viewBox='0 0 24 24'
            fill='none'
            stroke='#0f0f0f'
            strokeWidth='2.5'
            strokeLinecap='round'
          >
            <path d='M8 3v3a2 2 0 01-2 2H3m18 0h-3a2 2 0 01-2-2V3m0 18v-3a2 2 0 012-2h3M3 16h3a2 2 0 012 2v3' />
          </svg>
          <div className='text-left'>
            <p className='text-primary-foreground text-[15px] font-bold'>
              {finishSession.isPending
                ? 'Guardando...'
                : 'Finalizar entrenamiento'}
            </p>
            <p className='text-[10px] text-[#1a3a00]'>
              Marcará el sello del día ✓
            </p>
          </div>
        </button>
      ) : (
        <div className='bg-primary-light flex items-center justify-center gap-2 rounded-[14px] border border-[#2a4a1a] py-4'>
          <svg width='18' height='18' viewBox='0 0 10 10'>
            <polyline
              points='1.5,5 4,7.5 8.5,2.5'
              fill='none'
              stroke='#a3e635'
              strokeWidth='1.9'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
          </svg>
          <p className='text-primary text-[15px] font-bold'>
            Entrenamiento finalizado
          </p>
        </div>
      )}

      {/* Add muscle sheet */}
      {showAdd && (
        <AddMuscleSheet
          sessionId={session.id}
          existing={muscles}
          onClose={() => setShowAdd(false)}
        />
      )}
    </div>
  )
}

export const Route = createFileRoute('/_app/today')({ component: TodayPage })
