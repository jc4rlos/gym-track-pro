import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/auth-store'
import { supabase } from '@/lib/supabase'

function getISOWeek(date: Date): { week: number; year: number } {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7))
  const w1 = new Date(d.getFullYear(), 0, 4)
  const week =
    1 +
    Math.round(
      ((d.getTime() - w1.getTime()) / 86400000 - 3 + ((w1.getDay() + 6) % 7)) /
        7
    )
  return { week, year: d.getFullYear() }
}

export function todayDayOfWeek() {
  return (new Date().getDay() + 6) % 7
}

export type DayRoutine = {
  id: string
  plan_day_id: string
  routine_id: string
  routines?: { id: string; name: string } | null
}

export type WeeklyPlanDay = {
  id: string
  day_of_week: number
  is_rest_day: boolean
  notes: string | null
  weekly_plan_day_routines?: DayRoutine[]
}

export type WeeklyPlan = {
  id: string
  week_number: number
  year: number
  name: string | null
  copied_from_id: string | null
  weekly_plan_days: WeeklyPlanDay[]
}

export function useCurrentWeekPlan() {
  const { user } = useAuthStore()
  const { week, year } = getISOWeek(new Date())
  return useQuery({
    queryKey: ['weekly_plan', 'current', user?.id, week, year],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('weekly_plans')
        .select(
          '*, weekly_plan_days(*, weekly_plan_day_routines(*, routines(id, name)))'
        )
        .eq('user_id', user!.id)
        .eq('week_number', week)
        .eq('year', year)
        .maybeSingle()
      if (error) throw error
      return data as WeeklyPlan | null
    },
    enabled: !!user,
  })
}

export function usePreviousWeekPlan() {
  const { user } = useAuthStore()
  const prev = new Date()
  prev.setDate(prev.getDate() - 7)
  const { week, year } = getISOWeek(prev)
  return useQuery({
    queryKey: ['weekly_plan', 'previous', user?.id, week, year],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('weekly_plans')
        .select(
          '*, weekly_plan_days(*, weekly_plan_day_routines(*, routines(id, name)))'
        )
        .eq('user_id', user!.id)
        .eq('week_number', week)
        .eq('year', year)
        .maybeSingle()
      if (error) throw error
      return data as WeeklyPlan | null
    },
    enabled: !!user,
  })
}

export function useCreateWeekPlan() {
  const { user } = useAuthStore()
  const qc = useQueryClient()
  const { week, year } = getISOWeek(new Date())
  return useMutation({
    mutationFn: async () => {
      const planId = crypto.randomUUID()
      const { error } = await supabase
        .from('weekly_plans')
        .insert({ id: planId, user_id: user!.id, week_number: week, year })
      if (error) throw error
      const days = Array.from({ length: 7 }, (_, i) => ({
        id: crypto.randomUUID(),
        weekly_plan_id: planId,
        day_of_week: i,
        is_rest_day: false,
      }))
      const { error: dErr } = await supabase
        .from('weekly_plan_days')
        .insert(days)
      if (dErr) throw dErr
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['weekly_plan'] }),
  })
}

export function useCopyPreviousPlan() {
  const { user } = useAuthStore()
  const qc = useQueryClient()
  const { week, year } = getISOWeek(new Date())
  return useMutation({
    mutationFn: async (prev: WeeklyPlan) => {
      const planId = crypto.randomUUID()
      const { error } = await supabase.from('weekly_plans').insert({
        id: planId,
        user_id: user!.id,
        week_number: week,
        year,
        copied_from_id: prev.id,
      })
      if (error) throw error

      const dayIdMap = new Map<string, string>()
      const days = prev.weekly_plan_days.map((d) => {
        const newId = crypto.randomUUID()
        dayIdMap.set(d.id, newId)
        return {
          id: newId,
          weekly_plan_id: planId,
          day_of_week: d.day_of_week,
          is_rest_day: d.is_rest_day,
        }
      })
      if (days.length) {
        const { error: dErr } = await supabase
          .from('weekly_plan_days')
          .insert(days)
        if (dErr) throw dErr
      }

      const routineRows = prev.weekly_plan_days.flatMap((d) =>
        (d.weekly_plan_day_routines || []).map((r) => ({
          id: crypto.randomUUID(),
          plan_day_id: dayIdMap.get(d.id)!,
          routine_id: r.routine_id,
        }))
      )
      if (routineRows.length) {
        const { error: rErr } = await supabase
          .from('weekly_plan_day_routines')
          .insert(routineRows)
        if (rErr) throw rErr
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['weekly_plan'] }),
  })
}

export function useAddRoutineToDay() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      planDayId,
      routineId,
    }: {
      planDayId: string
      routineId: string
    }) => {
      const { error } = await supabase.from('weekly_plan_day_routines').insert({
        id: crypto.randomUUID(),
        plan_day_id: planDayId,
        routine_id: routineId,
      })
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['weekly_plan'] }),
  })
}

export function useRemoveRoutineFromDay() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (dayRoutineId: string) => {
      const { error } = await supabase
        .from('weekly_plan_day_routines')
        .delete()
        .eq('id', dayRoutineId)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['weekly_plan'] }),
  })
}

export type PlanExercise = {
  id: string
  sets: number
  reps: string
  rest_seconds: number | null
  exercises: {
    id: string
    name: string
    name_es: string | null
    target_muscle: string | null
  } | null
}

export type PlanRoutineWithExercises = {
  id: string
  routine_id: string
  routines: {
    id: string
    name: string
    routine_exercises: PlanExercise[]
  } | null
}

export function useTodayPlanRoutines() {
  const { user } = useAuthStore()
  const { week, year } = getISOWeek(new Date())
  const dow = todayDayOfWeek()
  return useQuery({
    queryKey: ['today_plan_routines', user?.id, week, year, dow],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('weekly_plans')
        .select(
          `
          id,
          weekly_plan_days!inner(
            id, day_of_week, is_rest_day,
            weekly_plan_day_routines(
              id, routine_id,
              routines(
                id, name,
                routine_exercises(id, sets, reps, rest_seconds, exercises(id, name, name_es, target_muscle))
              )
            )
          )
        `
        )
        .eq('user_id', user!.id)
        .eq('week_number', week)
        .eq('year', year)
        .eq('weekly_plan_days.day_of_week', dow)
        .maybeSingle()
      if (error) throw error
      const planDay = (
        data?.weekly_plan_days as unknown as WeeklyPlanDay[]
      )?.[0]
      if (!planDay || planDay.is_rest_day) return null
      return (planDay.weekly_plan_day_routines ??
        []) as PlanRoutineWithExercises[]
    },
    enabled: !!user,
  })
}

export function useToggleRestDay() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      planDayId,
      isRest,
    }: {
      planDayId: string
      isRest: boolean
    }) => {
      if (isRest) {
        await supabase
          .from('weekly_plan_day_routines')
          .delete()
          .eq('plan_day_id', planDayId)
      }
      const { error } = await supabase
        .from('weekly_plan_days')
        .update({ is_rest_day: isRest })
        .eq('id', planDayId)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['weekly_plan'] }),
  })
}
