import { useState } from 'react'
import { useSessionsByMonth, useSessionStats } from './use-history'

const MONTHS = [
  'Ene',
  'Feb',
  'Mar',
  'Abr',
  'May',
  'Jun',
  'Jul',
  'Ago',
  'Sep',
  'Oct',
  'Nov',
  'Dic',
]

export function HistoryView() {
  const today = new Date()
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(today.getFullYear())

  const { data: sessions, isLoading } = useSessionsByMonth(
    selectedYear,
    selectedMonth
  )
  const { data: stats } = useSessionStats(selectedYear, selectedMonth)

  const completedSessions = sessions?.filter((s) => s.finished_at) || []
  const totalCompleted = completedSessions.length

  const topMuscles = stats
    ? Object.entries(stats.muscleCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4)
    : []

  const maxMuscleCount = topMuscles.length > 0 ? topMuscles[0][1] : 1

  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12)
      setSelectedYear(selectedYear - 1)
    } else {
      setSelectedMonth(selectedMonth - 1)
    }
  }

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1)
      setSelectedYear(selectedYear + 1)
    } else {
      setSelectedMonth(selectedMonth + 1)
    }
  }

  return (
    <div className='bg-background flex min-h-screen flex-col pb-20'>
      <div className='border-border border-b px-5 py-3'>
        <h1 className='text-xl font-bold'>Historial</h1>
      </div>

      <div className='flex-1 space-y-4 overflow-y-auto px-5 py-4'>
        <div className='flex items-center justify-between'>
          <button
            onClick={handlePrevMonth}
            className='hover:bg-card rounded-lg p-2 text-sm font-medium'
          >
            ←
          </button>
          <h2 className='text-base font-bold'>
            {MONTHS[selectedMonth - 1]} {selectedYear}
          </h2>
          <button
            onClick={handleNextMonth}
            className='hover:bg-card rounded-lg p-2 text-sm font-medium'
          >
            →
          </button>
        </div>

        <div className='grid grid-cols-3 gap-3'>
          <div className='border-border bg-card rounded-lg border p-3 text-center'>
            <div className='text-primary text-2xl font-bold'>
              {totalCompleted}
            </div>
            <div className='text-muted text-xs'>sesiones</div>
          </div>
          <div className='border-border bg-card rounded-lg border p-3 text-center'>
            <div className='text-2xl font-bold'>
              {stats?.totalSessions || 0}h{' '}
              {Math.floor((stats?.totalMinutes || 0) / 60)}m
            </div>
            <div className='text-muted text-xs'>en el gym</div>
          </div>
          <div className='border-border bg-card rounded-lg border p-3 text-center'>
            <div className='text-primary text-2xl font-bold'>
              🔥{totalCompleted > 0 ? totalCompleted : 0}
            </div>
            <div className='text-muted text-xs'>racha</div>
          </div>
        </div>

        {topMuscles.length > 0 && (
          <div className='border-border bg-card rounded-lg border p-4'>
            <h3 className='text-muted mb-3 text-xs font-bold uppercase'>
              Más entrenados
            </h3>
            <div className='space-y-3'>
              {topMuscles.map(([muscle, count]) => (
                <div key={muscle} className='flex items-center gap-3'>
                  <span className='w-20 truncate text-sm'>{muscle}</span>
                  <div className='bg-background h-1.5 flex-1 overflow-hidden rounded-full'>
                    <div
                      className='bg-primary h-full rounded-full'
                      style={{ width: `${(count / maxMuscleCount) * 100}%` }}
                    />
                  </div>
                  <span className='text-muted w-6 text-right text-xs'>
                    {count}×
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <h3 className='text-muted mb-3 text-xs font-bold uppercase'>
            Sesiones
          </h3>
          <div className='space-y-3'>
            {isLoading ? (
              <div className='flex justify-center py-8'>
                <div className='border-primary h-6 w-6 animate-spin rounded-full border-2 border-t-transparent' />
              </div>
            ) : !sessions || sessions.length === 0 ? (
              <p className='text-muted py-8 text-center text-xs'>
                No hay sesiones en este mes
              </p>
            ) : (
              sessions.map((session) => {
                const completed =
                  session.session_muscle_groups?.filter(
                    (m) => m.is_completed
                  ) || []
                const total = session.session_muscle_groups?.length || 0

                return (
                  <div
                    key={session.id}
                    className='border-border bg-card rounded-lg border p-3'
                  >
                    <div className='mb-2 flex items-start justify-between'>
                      <div>
                        <p className='text-sm font-bold'>
                          {new Date(session.session_date).toLocaleDateString(
                            'es-ES',
                            {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                            }
                          )}
                        </p>
                        <p className='text-muted mt-0.5 text-xs'>
                          {session.started_at
                            ? new Date(session.started_at).toLocaleTimeString(
                                'es-ES',
                                { hour: '2-digit', minute: '2-digit' }
                              )
                            : ''}
                        </p>
                      </div>
                      {session.finished_at && (
                        <div className='bg-primary/20 text-primary flex items-center gap-1 rounded-md px-2 py-1 text-xs font-bold'>
                          <span>✓</span> Completo
                        </div>
                      )}
                    </div>

                    {completed.length > 0 && (
                      <>
                        <div className='mb-2 flex flex-wrap gap-1'>
                          {completed.map((m) => (
                            <span
                              key={m.id}
                              className='bg-primary/20 text-primary rounded-md px-2 py-1 text-xs font-medium'
                            >
                              {m.muscle_groups?.name_es}
                            </span>
                          ))}
                        </div>
                        <div className='bg-background h-1 overflow-hidden rounded-full'>
                          <div
                            className='bg-primary h-full rounded-full'
                            style={{
                              width: `${(completed.length / total) * 100}%`,
                            }}
                          />
                        </div>
                        <p className='text-muted mt-1 text-xs'>
                          {completed.length} / {total} grupos
                        </p>
                      </>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
