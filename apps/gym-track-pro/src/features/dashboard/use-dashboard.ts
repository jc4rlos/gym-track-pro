import { useQuery } from '@tanstack/react-query'
import type { IExerciseData, Muscle } from 'react-body-highlighter'
import { useAuthStore } from '@/stores/auth-store'
import { supabase } from '@/lib/supabase'

function getWeekBounds() {
  const now = new Date()
  const day = now.getDay()
  const diff = day === 0 ? -6 : 1 - day
  const mon = new Date(now)
  mon.setDate(now.getDate() + diff)
  mon.setHours(0, 0, 0, 0)
  const sun = new Date(mon)
  sun.setDate(mon.getDate() + 6)
  sun.setHours(23, 59, 59, 999)
  return { weekStart: mon, weekEnd: sun }
}

const SLUG_TO_MUSCLE: Record<string, Muscle[]> = {
  chest: ['chest'],
  biceps: ['biceps'],
  triceps: ['triceps'],
  abs: ['abs'],
  obliques: ['obliques'],
  quadriceps: ['quadriceps'],
  shoulders: ['front-deltoids', 'back-deltoids'],
  forearms: ['forearm'],
  back: ['upper-back', 'lower-back'],
  traps: ['trapezius'],
  lats: ['upper-back'],
  glutes: ['gluteal'],
  hamstrings: ['hamstring'],
  calves: ['calves'],
}

export function useProfile() {
  const { user } = useAuthStore()
  return useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user!.id)
        .single()
      if (error) throw error
      return data
    },
    enabled: !!user,
  })
}

export function useMuscleGroups() {
  return useQuery({
    queryKey: ['muscle_groups'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('muscle_groups')
        .select('id, slug, name_es, body_side, display_order')
        .order('display_order')
      if (error) throw error
      return data
    },
  })
}

export function useWeekSessions() {
  const { user } = useAuthStore()
  const { weekStart, weekEnd } = getWeekBounds()
  return useQuery({
    queryKey: [
      'week_sessions',
      user?.id,
      weekStart.toISOString(),
      weekEnd.toISOString(),
    ],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workout_sessions')
        .select(
          `
          id, session_date, started_at,
          session_muscle_groups(
            id, muscle_group_id, is_completed,
            muscle_groups(id, slug, name_es, body_side)
          )
        `
        )
        .eq('user_id', user!.id)
        .gte('session_date', weekStart.toISOString().slice(0, 10))
        .lte('session_date', weekEnd.toISOString().slice(0, 10))
      if (error) throw error
      return data
    },
    enabled: !!user,
  })
}

function getISOWeekAndYear(d: Date) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
  date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7))
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1))
  return {
    weekNum: Math.ceil(
      ((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7
    ),
    year: date.getUTCFullYear(),
  }
}

export function useTodayPlan() {
  const { user } = useAuthStore()
  const today = new Date()
  const todayDayIndex = today.getDay() === 0 ? 6 : today.getDay() - 1
  const { weekNum, year } = getISOWeekAndYear(today)

  return useQuery({
    queryKey: ['today_plan', user?.id, weekNum, year, todayDayIndex],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('plan_week_assignments')
        .select(
          `
          plans(
            plan_days(
              id, day_of_week, is_rest_day,
              plan_day_routines(
                id,
                routines(id, name, description)
              )
            )
          )
        `
        )
        .eq('user_id', user!.id)
        .eq('week_number', weekNum)
        .eq('year', year)
        .maybeSingle()
      if (error) throw error

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const plans = (data as any)?.plans
      const planDay = plans?.plan_days?.find(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (d: any) => d.day_of_week === todayDayIndex
      )
      if (!planDay) return null

      return {
        is_rest_day: planDay.is_rest_day as boolean,
        weekly_plan_day_routines: (planDay.plan_day_routines ?? []) as Array<{
          id: string
          routines: { id: string; name: string; description: string | null } | null
        }>,
      }
    },
    enabled: !!user,
  })
}

export function useDashboardData() {
  const profileQ = useProfile()
  const muscleGroupsQ = useMuscleGroups()
  const weekSessionsQ = useWeekSessions()
  const todayPlanQ = useTodayPlan()
  const { weekStart } = getWeekBounds()

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart)
    d.setDate(weekStart.getDate() + i)
    return d
  })

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayStr = today.toISOString().slice(0, 10)

  const sessions = weekSessionsQ.data ?? []

  const trainedDates = new Set(sessions.map((s) => s.session_date))

  const weekMuscleSlugs = new Set<string>()
  const todayMuscleSlugs = new Set<string>()

  for (const session of sessions) {
    const isToday = session.session_date === todayStr
    for (const smg of (session.session_muscle_groups as Array<{
      muscle_groups: { slug: string } | null
    }>) ?? []) {
      const slug = smg.muscle_groups?.slug
      if (!slug) continue
      weekMuscleSlugs.add(slug)
      if (isToday) todayMuscleSlugs.add(slug)
    }
  }

  // Streak: consecutive trained days going back from today
  let streak = 0
  const checkDate = new Date(today)
  if (!trainedDates.has(todayStr)) {
    checkDate.setDate(checkDate.getDate() - 1)
  }
  while (trainedDates.has(checkDate.toISOString().slice(0, 10))) {
    streak++
    checkDate.setDate(checkDate.getDate() - 1)
  }

  const allWeekMuscles: Muscle[] = Array.from(weekMuscleSlugs).flatMap(
    (slug) => SLUG_TO_MUSCLE[slug] ?? []
  )
  const todayMuscles: Muscle[] = Array.from(todayMuscleSlugs).flatMap(
    (slug) => SLUG_TO_MUSCLE[slug] ?? []
  )

  const bodyData: IExerciseData[] = [
    { name: 'week', muscles: allWeekMuscles },
    { name: 'today', muscles: todayMuscles },
  ]

  return {
    profile: profileQ.data,
    muscleGroups: muscleGroupsQ.data ?? [],
    weekDays,
    trainedDates,
    streak,
    weekMuscleSlugs,
    todayMuscleSlugs,
    bodyData,
    todayPlan: todayPlanQ.data,
    isLoading: profileQ.isLoading || weekSessionsQ.isLoading,
  }
}
