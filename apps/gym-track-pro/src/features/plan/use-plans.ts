import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/auth-store'
import { supabase } from '@/lib/supabase'
import { getISOWeek, todayDayOfWeek } from './plan-utils'

export type PlanDayRoutine = {
  id: string
  plan_day_id: string
  routine_id: string
  routines: { id: string; name: string } | null
}

export type PlanDay = {
  id: string
  plan_id: string
  day_of_week: number
  is_rest_day: boolean
  plan_day_routines?: PlanDayRoutine[]
}

export type Plan = {
  id: string
  user_id: string
  name: string
  created_at: string
  plan_days?: PlanDay[]
}

export type PlanWeekAssignment = {
  id: string
  plan_id: string
  week_number: number
  year: number
}

// ── Current week assigned plan ──────────────────────────────

export function useCurrentWeekAssignedPlan() {
  const { user } = useAuthStore()
  const { week, year } = getISOWeek(new Date())
  return useQuery({
    queryKey: ['current_week_plan', user?.id, week, year],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('plan_week_assignments')
        .select(`
          id,
          plan_id,
          plans(
            id, name,
            plan_days(id, day_of_week, is_rest_day,
              plan_day_routines(id, routine_id, routines(id, name))
            )
          )
        `)
        .eq('user_id', user!.id)
        .eq('week_number', week)
        .eq('year', year)
        .maybeSingle()
      if (error) throw error
      if (!data) return null
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (data as any).plans as Plan | null
    },
    enabled: !!user,
  })
}

// ── Today's plan routines (for /today screen) ───────────────

export type TodayPlanExercise = {
  id: string
  sets: number
  reps: string
  rest_seconds: number | null
  exercises: {
    id: string
    name: string
    name_es: string | null
    target_muscle: string | null
    gif_url: string | null
  } | null
}

export type TodayPlanRoutine = {
  id: string
  routine_id: string
  routines: {
    id: string
    name: string
    routine_exercises: TodayPlanExercise[]
  } | null
}

export function useTodayAssignedRoutines() {
  const { user } = useAuthStore()
  const { week, year } = getISOWeek(new Date())
  const dow = todayDayOfWeek()
  return useQuery({
    queryKey: ['today_assigned_routines', user?.id, week, year, dow],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('plan_week_assignments')
        .select(`
          plans(
            plan_days(
              id, day_of_week, is_rest_day,
              plan_day_routines(
                id, routine_id,
                routines(
                  id, name,
                  routine_exercises(id, sets, reps, rest_seconds,
                    exercises(id, name, name_es, target_muscle, gif_url)
                  )
                )
              )
            )
          )
        `)
        .eq('user_id', user!.id)
        .eq('week_number', week)
        .eq('year', year)
        .maybeSingle()
      if (error) throw error
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const plans = (data as any)?.plans
      const planDay = plans?.plan_days?.find(
        (d: { day_of_week: number }) => d.day_of_week === dow
      )
      if (!planDay || planDay.is_rest_day) return null
      return (planDay.plan_day_routines ?? []) as TodayPlanRoutine[]
    },
    enabled: !!user,
  })
}

// ── List ────────────────────────────────────────────────────

export function usePlans() {
  const { user } = useAuthStore()
  return useQuery({
    queryKey: ['plans', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('plans')
        .select(`
          id, name, created_at,
          plan_days(id, day_of_week, is_rest_day,
            plan_day_routines(id, routine_id, routines(id, name))
          )
        `)
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as Plan[]
    },
    enabled: !!user,
  })
}

export function usePlanAssignments() {
  const { user } = useAuthStore()
  return useQuery({
    queryKey: ['plan_assignments', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('plan_week_assignments')
        .select('id, plan_id, week_number, year')
        .eq('user_id', user!.id)
        .order('year', { ascending: false })
        .order('week_number', { ascending: false })
      if (error) throw error
      return data as PlanWeekAssignment[]
    },
    enabled: !!user,
  })
}

// ── Create / Delete ─────────────────────────────────────────

export function useCreatePlan() {
  const { user } = useAuthStore()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (name: string) => {
      const planId = crypto.randomUUID()
      const { error } = await supabase
        .from('plans')
        .insert({ id: planId, user_id: user!.id, name })
      if (error) throw error
      const days = Array.from({ length: 7 }, (_, i) => ({
        id: crypto.randomUUID(),
        plan_id: planId,
        day_of_week: i,
        is_rest_day: false,
      }))
      const { error: dErr } = await supabase.from('plan_days').insert(days)
      if (dErr) throw dErr
      return planId
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['plans'] }),
  })
}

export function useDeletePlan() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (planId: string) => {
      const { error } = await supabase.from('plans').delete().eq('id', planId)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['plans'] })
      qc.invalidateQueries({ queryKey: ['plan_assignments'] })
    },
  })
}

export function useRenamePlan() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ planId, name }: { planId: string; name: string }) => {
      const { error } = await supabase
        .from('plans')
        .update({ name })
        .eq('id', planId)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['plans'] }),
  })
}

// ── Day editing ─────────────────────────────────────────────

export function useTogglePlanDayRest() {
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
          .from('plan_day_routines')
          .delete()
          .eq('plan_day_id', planDayId)
      }
      const { error } = await supabase
        .from('plan_days')
        .update({ is_rest_day: isRest })
        .eq('id', planDayId)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['plans'] }),
  })
}

export function useAddRoutineToPlanDay() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      planDayId,
      routineId,
    }: {
      planDayId: string
      routineId: string
    }) => {
      const { error } = await supabase.from('plan_day_routines').insert({
        id: crypto.randomUUID(),
        plan_day_id: planDayId,
        routine_id: routineId,
      })
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['plans'] }),
  })
}

export function useRemoveRoutineFromPlanDay() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (planDayRoutineId: string) => {
      const { error } = await supabase
        .from('plan_day_routines')
        .delete()
        .eq('id', planDayRoutineId)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['plans'] }),
  })
}

// ── Week assignment ─────────────────────────────────────────

export function useAssignPlanToWeek() {
  const { user } = useAuthStore()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      planId,
      weekNumber,
      year,
    }: {
      planId: string
      weekNumber: number
      year: number
    }) => {
      const { error } = await supabase
        .from('plan_week_assignments')
        .upsert(
          {
            id: crypto.randomUUID(),
            user_id: user!.id,
            plan_id: planId,
            week_number: weekNumber,
            year,
          },
          { onConflict: 'user_id,week_number,year' }
        )
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['plan_assignments'] }),
  })
}

export function useUnassignPlanFromWeek() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (assignmentId: string) => {
      const { error } = await supabase
        .from('plan_week_assignments')
        .delete()
        .eq('id', assignmentId)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['plan_assignments'] }),
  })
}

// ── Week helpers ─────────────────────────────────────────────

export function getUpcomingWeeks(count = 8) {
  const weeks: { week: number; year: number; label: string }[] = []
  const d = new Date()
  for (let i = 0; i < count; i++) {
    const date = new Date(d)
    date.setDate(date.getDate() + i * 7)
    const { week, year } = getISOWeek(date)
    const monday = getMondayOfISOWeek(week, year)
    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)
    weeks.push({
      week,
      year,
      label: `Sem ${week} · ${monday.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} – ${sunday.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}`,
    })
  }
  return weeks
}

function getMondayOfISOWeek(week: number, year: number) {
  const simple = new Date(year, 0, 1 + (week - 1) * 7)
  const dow = simple.getDay()
  const monday = new Date(simple)
  if (dow <= 4) {
    monday.setDate(simple.getDate() - (dow - 1))
  } else {
    monday.setDate(simple.getDate() + 8 - dow)
  }
  return monday
}
