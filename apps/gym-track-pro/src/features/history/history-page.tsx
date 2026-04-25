import { useState } from 'react'
import { Check, Flame, Clock, Dumbbell } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  useSessionsByMonth,
  useSessionStats,
  useCurrentStreak,
  useAvailableMonths,
  type SessionWithMuscles,
} from './use-history'

const MONTH_LABELS = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic',
]

function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes}m`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

function formatSessionDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('es-ES', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

function formatSessionTime(startedAt: string) {
  return new Date(startedAt).toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function sessionDurationMin(startedAt: string, finishedAt: string | null) {
  if (!finishedAt) return null
  return Math.round(
    (new Date(finishedAt).getTime() - new Date(startedAt).getTime()) / 60000
  )
}

type MuscleBarProps = { name: string; count: number; max: number }

function MuscleBar({ name, count, max }: MuscleBarProps) {
  const pct = max > 0 ? Math.round((count / max) * 100) : 0
  return (
    <div className='flex items-center gap-2.5'>
      <span className='text-foreground w-20 shrink-0 text-[13px]'>{name}</span>
      <div className='h-1.5 flex-1 overflow-hidden rounded-full bg-card-dark'>
        <div
          className='h-full rounded-full bg-primary transition-all'
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className='text-muted w-6 shrink-0 text-right text-[11px]'>
        {count}×
      </span>
    </div>
  )
}

type SessionCardProps = { session: SessionWithMuscles }

function SessionCard({ session }: SessionCardProps) {
  const isComplete = !!session.finished_at
  const durationMin = sessionDurationMin(session.started_at, session.finished_at)
  const muscles = session.session_muscle_groups ?? []
  const completedCount = muscles.filter((m) => m.is_completed).length
  const totalCount = muscles.length
  const progressPct = totalCount > 0 ? (completedCount / totalCount) * 100 : 0

  return (
    <div className='rounded-2xl border border-border bg-card p-3.5'>
      <div className='mb-2.5 flex items-start justify-between'>
        <div>
          <p className='text-[14px] font-bold capitalize'>
            {formatSessionDate(session.session_date)}
          </p>
          <p className='text-muted mt-0.5 text-[11px]'>
            {durationMin != null ? `${durationMin} min · ` : ''}
            {formatSessionTime(session.started_at)}
          </p>
        </div>
        {isComplete ? (
          <div className='flex items-center gap-1 rounded-full border border-primary-mid bg-primary-light px-2.5 py-1'>
            <Check size={11} className='text-primary' strokeWidth={2.5} />
            <span className='text-primary text-[11px] font-semibold'>
              Completo
            </span>
          </div>
        ) : (
          <div className='rounded-full border border-orange-900/50 bg-orange-950/40 px-2.5 py-1'>
            <span className='text-[11px] font-semibold text-orange-400'>
              Incompleto
            </span>
          </div>
        )}
      </div>

      {muscles.length > 0 && (
        <div className='mb-2.5 flex flex-wrap gap-1.5'>
          {muscles.map((m) => (
            <span
              key={m.id}
              className={cn(
                'rounded-full px-2 py-0.5 text-[11px] font-medium',
                m.is_completed
                  ? 'bg-primary-light text-primary'
                  : 'bg-card-dark text-muted'
              )}
            >
              {m.muscle_groups?.name_es}
            </span>
          ))}
        </div>
      )}

      {totalCount > 0 && (
        <>
          <div className='h-1 w-full overflow-hidden rounded-full bg-card-dark'>
            <div
              className='h-full rounded-full bg-primary transition-all'
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <p
            className={cn(
              'mt-1 text-[10px]',
              isComplete ? 'text-primary-mid' : 'text-muted'
            )}
          >
            {completedCount} / {totalCount} grupos
          </p>
        </>
      )}
    </div>
  )
}

export function HistoryPage() {
  const now = new Date()
  const [selected, setSelected] = useState({
    year: now.getFullYear(),
    month: now.getMonth() + 1,
  })

  const { data: availableMonths = [] } = useAvailableMonths()
  const { data: sessions = [] } = useSessionsByMonth(selected.year, selected.month)
  const { data: stats } = useSessionStats(selected.year, selected.month)
  const { data: streak = 0 } = useCurrentStreak()

  const topMuscles = Object.entries(stats?.muscleCounts ?? {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
  const maxMuscle = topMuscles[0]?.[1] ?? 1

  return (
    <div className='flex flex-col gap-4 pb-10'>
      <h1 className='text-foreground text-xl font-bold'>Historial</h1>

      <div className='-mx-4 overflow-x-auto px-4'>
        <div className='flex gap-2' style={{ minWidth: 'max-content' }}>
          {availableMonths.map(({ year, month }) => {
            const active = selected.year === year && selected.month === month
            return (
              <button
                key={`${year}-${month}`}
                onClick={() => setSelected({ year, month })}
                className={cn(
                  'rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors',
                  active
                    ? 'bg-primary text-primary-foreground'
                    : 'border border-border bg-card text-muted'
                )}
              >
                {MONTH_LABELS[month - 1]}
              </button>
            )
          })}
        </div>
      </div>

      <div className='grid grid-cols-3 gap-2.5'>
        <div className='rounded-2xl border border-primary-mid bg-primary-light p-3 text-center'>
          <p className='font--display text-3xl font-bold text-primary'>
            {stats?.totalSessions ?? 0}
          </p>
          <p className='mt-0.5 text-[11px] text-primary-mid'>sesiones</p>
        </div>
        <div className='rounded-2xl border border-border bg-card-dark p-3 text-center'>
          <div className='flex items-center justify-center gap-1'>
            <Clock size={14} className='text-muted' />
            <p className='font-display text-3xl font-bold text-foreground'>
              {formatDuration(stats?.totalMinutes ?? 0)}
            </p>
          </div>
          <p className='mt-0.5 text-[11px] text-muted'>en el gym</p>
        </div>
        <div className='rounded-2xl border border-border bg-card-dark p-3 text-center'>
          <div className='flex items-center justify-center gap-1'>
            <Flame size={14} className='text-primary' />
            <p className='font-display text-3xl font-bold text-primary'>
              {streak}
            </p>
          </div>
          <p className='mt-0.5 text-[11px] text-muted'>racha</p>
        </div>
      </div>

      {topMuscles.length > 0 && (
        <div className='rounded-2xl border border-border bg-card-dark p-4'>
          <p className='text-muted mb-3 text-[11px] font-semibold tracking-wide uppercase'>
            Más entrenados
          </p>
          <div className='flex flex-col gap-2'>
            {topMuscles.map(([name, count]) => (
              <MuscleBar key={name} name={name} count={count} max={maxMuscle} />
            ))}
          </div>
        </div>
      )}

      {sessions.length > 0 ? (
        <div className='flex flex-col gap-2'>
          <p className='text-muted text-[11px] font-semibold tracking-wide uppercase'>
            Sesiones
          </p>
          {sessions.map((s) => (
            <SessionCard key={s.id} session={s} />
          ))}
        </div>
      ) : (
        <div className='rounded-2xl border border-border bg-card-dark p-8 text-center'>
          <Dumbbell size={32} className='text-muted mx-auto mb-3' strokeWidth={1.5} />
          <p className='text-foreground font-semibold'>Sin sesiones</p>
          <p className='text-muted mt-1 text-sm'>
            No hay entrenamientos registrados este mes.
          </p>
        </div>
      )}
    </div>
  )
}
