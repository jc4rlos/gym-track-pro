import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { SportShoe, ChevronRight, Moon, Dumbbell } from 'lucide-react'
import { BodyCard } from '@/features/dashboard/body-card'
import { MuscleProgress } from '@/features/dashboard/muscle-progress'
import { useDashboardData } from '@/features/dashboard/use-dashboard'
import { WeekStamps } from '@/features/dashboard/week-stamps'
import { StepsDashboardWidget } from '@/features/steps/steps-dashboard-widget'
import { CaloriesWidget } from '@/features/dashboard/calories-widget'

const DAY_LABELS_ES = [
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
  'Domingo',
]

function getWeekLabel() {
  const now = new Date()
  const day = now.getDay()
  const diff = day === 0 ? -6 : 1 - day
  const mon = new Date(now)
  mon.setDate(now.getDate() + diff)
  const sun = new Date(mon)
  sun.setDate(mon.getDate() + 6)
  const weekNum = getWeekNumber(now)
  const monStr = mon.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
  })
  const sunStr = sun.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
  return `Semana ${weekNum} · ${monStr}–${sunStr}`
}

function getWeekNumber(d: Date) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
  date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7))
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1))
  return Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
}

const DashboardPage = () => {
  const navigate = useNavigate()
  const {
    profile,
    muscleGroups,
    weekDays,
    trainedDates,
    streak,
    weekMuscleSlugs,
    bodyData,
    todayPlan,
  } = useDashboardData()
  const today = new Date()
  const todayDayIndex = today.getDay() === 0 ? 6 : today.getDay() - 1
  const todayLabel = DAY_LABELS_ES[todayDayIndex]

  const firstName = profile?.full_name?.split(' ')[0] ?? 'Atleta'
  const initial = (profile?.full_name?.[0] ?? 'A').toUpperCase()

  return (
    <div className='flex flex-col gap-3.5 pb-10'>
      {/* Header */}
      <div className='flex items-start justify-between pt-1'>
        <div>
          <h1 className='text-foreground text-[22px] font-bold'>
            Hola, {firstName} 💪
          </h1>
          <p className='text-muted mt-0.5 text-[12px]'>{getWeekLabel()}</p>
        </div>
        <div className='flex items-center gap-2'>
          {streak > 0 && (
            <div className='bg-primary-light text-primary flex items-center gap-1 rounded-full border border-[#2a4a1a] px-2.5 py-1 text-[12px] font-bold'>
              🔥 {streak}
            </div>
          )}
          <div className='bg-primary text-primary-foreground flex h-10.5 w-10.5 items-center justify-center rounded-full text-[16px] font-bold'>
            {initial}
          </div>
        </div>
      </div>

      {/* Week stamps */}
      <WeekStamps weekDays={weekDays} trainedDates={trainedDates} />

      {/* Body silhouette */}
      <BodyCard bodyData={bodyData} />

      {/* Muscle progress */}
      <MuscleProgress
        muscleGroups={muscleGroups}
        weekMuscleSlugs={weekMuscleSlugs}
      />

      <StepsDashboardWidget />

      <CaloriesWidget />

      {/* Today's plan */}
      <div>
        <p className='text-muted mb-2 text-[12px] font-semibold tracking-wide uppercase'>
          Plan de hoy — {todayLabel}
        </p>
        <div
          className='bg-primary-light flex cursor-pointer items-center justify-between rounded-[14px] border border-[#2a4a1a] px-3.5 py-3'
        >
          {todayPlan?.is_rest_day ? (
            <>
              <div className='flex items-center gap-2.5'>
                <Moon size={16} className='text-primary' />
                <div>
                  <p className='text-primary text-[13px] font-bold'>
                    Día de descanso
                  </p>
                  <p className='mt-0.5 text-[11px] text-[#4a7a4a]'>
                    Recuperate bien 💤
                  </p>
                </div>
              </div>
            </>
          ) : todayPlan?.weekly_plan_day_routines?.length ? (
              <div className='flex items-center gap-2.5'>
                <Dumbbell size={16} className='text-primary' />
                <div>
                  {(
                    todayPlan.weekly_plan_day_routines as Array<{
                      id: string
                      routines: {
                        id: string
                        name: string
                        description: string | null
                      } | null
                    }>
                  ).map((r) =>
                    r.routines ? (
                      <p
                        key={r.id}
                        className='text-primary text-[13px] leading-snug font-bold'
                      >
                        {r.routines.name}
                      </p>
                    ) : null
                  )}
                </div>
              </div>
          ) : (
            <>
              <div>
                <p className='text-primary text-[13px] font-bold'>
                  Sin rutina asignada
                </p>
                <p className='mt-0.5 text-[11px] text-[#4a7a4a]'>
                  Configurá tu plan semanal
                </p>
              </div>
              <ChevronRight size={18} className='text-primary' />
            </>
          )}
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={() => navigate({ to: '/today' })}
        className='bg-primary text-primary-foreground flex w-full items-center justify-center gap-2 rounded-[14px] py-3.5 text-[15px] font-bold'
        style={{ boxShadow: '0 4px 24px rgba(163,230,53,.2)' }}
      >
        <SportShoe size={16} strokeWidth={2.5} />
        Ver sesión de hoy
      </button>
    </div>
  )
}

export const Route = createFileRoute('/_app/dashboard')({
  component: DashboardPage,
})
