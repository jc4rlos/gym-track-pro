import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/auth-store'
import { supabase } from '@/lib/supabase'

function getTodayStr() {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

function getWeekNumber(d: Date) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
  date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7))
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1))
  return Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
}

export type SessionMuscle = {
  id: string
  session_id: string
  muscle_group_id: string
  is_completed: boolean
  completed_at: string | null
  sets_count: number | null
  notes: string | null
  muscle_groups: {
    id: string
    slug: string
    name_es: string
    body_side: string
  } | null
}

export type TodaySession = {
  id: string
  user_id: string
  session_date: string
  started_at: string
  finished_at: string | null
  notes: string | null
  week_number: number
  year: number
  session_muscle_groups: SessionMuscle[]
}

export function useTodaySession() {
  const { user } = useAuthStore()
  return useQuery({
    queryKey: ['today_session', user?.id, getTodayStr()],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workout_sessions')
        .select(
          `
          id, user_id, session_date, started_at, finished_at, notes, week_number, year,
          session_muscle_groups(
            id, session_id, muscle_group_id, is_completed, completed_at, sets_count, notes,
            muscle_groups(id, slug, name_es, body_side)
          )
        `
        )
        .eq('user_id', user!.id)
        .eq('session_date', getTodayStr())
        .maybeSingle()
      if (error) throw error
      return data as TodaySession | null
    },
    enabled: !!user,
  })
}

export function useAllMuscleGroups() {
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

export function useCreateSession() {
  const { user } = useAuthStore()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const now = new Date()
      const { data, error } = await supabase
        .from('workout_sessions')
        .insert({
          user_id: user!.id,
          session_date: getTodayStr(),
          started_at: now.toISOString(),
          week_number: getWeekNumber(now),
          year: now.getFullYear(),
        })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      qc.setQueryData(['today_session', user?.id, getTodayStr()], {
        ...data,
        session_muscle_groups: [],
      })
      qc.invalidateQueries({ queryKey: ['today_session'] })
    },
  })
}

export function useAddMuscleToSession() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      sessionId,
      muscleGroupId,
    }: {
      sessionId: string
      muscleGroupId: string
    }) => {
      const { error } = await supabase
        .from('session_muscle_groups')
        .insert({ session_id: sessionId, muscle_group_id: muscleGroupId })
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['today_session'] }),
  })
}

export function useToggleMuscle() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      isCompleted,
      setsCount,
    }: {
      id: string
      isCompleted: boolean
      setsCount: number
    }) => {
      const { error } = await supabase
        .from('session_muscle_groups')
        .update({
          is_completed: isCompleted,
          completed_at: isCompleted ? new Date().toISOString() : null,
          sets_count: isCompleted ? setsCount : null,
        })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['today_session'] }),
  })
}

export function useUpdateSets() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      setsCount,
    }: {
      id: string
      setsCount: number
    }) => {
      const { error } = await supabase
        .from('session_muscle_groups')
        .update({ sets_count: setsCount })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['today_session'] }),
  })
}

export function useUpdateNotes() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      sessionId,
      notes,
    }: {
      sessionId: string
      notes: string
    }) => {
      const { error } = await supabase
        .from('workout_sessions')
        .update({ notes })
        .eq('id', sessionId)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['today_session'] }),
  })
}

export function useFinishSession() {
  const { user } = useAuthStore()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (sessionId: string) => {
      const { error } = await supabase
        .from('workout_sessions')
        .update({ finished_at: new Date().toISOString() })
        .eq('id', sessionId)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ['today_session', user?.id, getTodayStr()],
      })
      qc.invalidateQueries({ queryKey: ['week_sessions'] })
    },
  })
}

const EXERCISE_MUSCLE_TO_SLUG: Record<string, string> = {
  pectorals: 'chest',
  'upper chest': 'chest',
  quads: 'quadriceps',
  quadriceps: 'quadriceps',
  delts: 'shoulders',
  deltoids: 'shoulders',
  'front deltoids': 'shoulders',
  'front-deltoids': 'shoulders',
  'rear deltoids': 'shoulders',
  'rear-deltoids': 'shoulders',
  'side deltoids': 'shoulders',
  'side-deltoids': 'shoulders',
  lats: 'lats',
  'upper back': 'back',
  'lower back': 'back',
  spine: 'back',
  traps: 'traps',
  trapezius: 'traps',
  biceps: 'biceps',
  triceps: 'triceps',
  abs: 'abs',
  'abs and obliques': 'abs',
  obliques: 'obliques',
  glutes: 'glutes',
  gluteal: 'glutes',
  hamstrings: 'hamstrings',
  calves: 'calves',
  forearms: 'forearms',
  shoulders: 'shoulders',
  chest: 'chest',
  back: 'back',
}

export function useSessionPlanExercises(sessionId: string | undefined) {
  return useQuery({
    queryKey: ['session_plan_exercises', sessionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('session_plan_exercises')
        .select('routine_exercise_id')
        .eq('session_id', sessionId!)
      if (error) throw error
      return new Set(data.map((r) => r.routine_exercise_id))
    },
    enabled: !!sessionId,
  })
}

export function useTogglePlanExercise() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      sessionId,
      exerciseId,
      checked,
    }: {
      sessionId: string
      exerciseId: string
      checked: boolean
    }) => {
      if (checked) {
        const { error } = await supabase
          .from('session_plan_exercises')
          .insert({ session_id: sessionId, routine_exercise_id: exerciseId })
        if (error && error.code !== '23505') throw error
      } else {
        const { error } = await supabase
          .from('session_plan_exercises')
          .delete()
          .eq('session_id', sessionId)
          .eq('routine_exercise_id', exerciseId)
        if (error) throw error
      }
    },
    onSuccess: (_, { sessionId }) => {
      qc.invalidateQueries({ queryKey: ['session_plan_exercises', sessionId] })
    },
  })
}

export function useUpsertSessionMuscle() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      sessionId,
      bodyPart,
    }: {
      sessionId: string
      bodyPart: string
    }) => {
      const slug = EXERCISE_MUSCLE_TO_SLUG[bodyPart.toLowerCase()] ?? bodyPart.toLowerCase()
      const { data: groups } = await supabase
        .from('muscle_groups')
        .select('id')
        .eq('slug', slug)
        .limit(1)
      if (!groups || groups.length === 0) return
      const muscleGroupId = groups[0].id
      // check if already exists to avoid duplicate
      const { data: existing } = await supabase
        .from('session_muscle_groups')
        .select('id')
        .eq('session_id', sessionId)
        .eq('muscle_group_id', muscleGroupId)
        .limit(1)
      if (existing && existing.length > 0) return
      await supabase.from('session_muscle_groups').insert({
        session_id: sessionId,
        muscle_group_id: muscleGroupId,
        is_completed: true,
        completed_at: new Date().toISOString(),
      })
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['today_session'] }),
  })
}

export function useFinishPlanSession() {
  const { user } = useAuthStore()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      sessionId,
      allExercises,
    }: {
      sessionId: string
      allExercises: { id: string; target_muscle: string | null }[]
    }) => {
      if (allExercises.length > 0) {
        const exerciseRows = allExercises.map((e) => ({
          session_id: sessionId,
          routine_exercise_id: e.id,
        }))
        await supabase
          .from('session_plan_exercises')
          .delete()
          .eq('session_id', sessionId)
        await supabase.from('session_plan_exercises').insert(exerciseRows)
      }

      const targetMuscles = [
        ...new Set(
          allExercises.map((e) => e.target_muscle).filter(Boolean) as string[]
        ),
      ]

      if (targetMuscles.length > 0) {
        const slugs = [
          ...new Set(
            targetMuscles.map(
              (m) => EXERCISE_MUSCLE_TO_SLUG[m.toLowerCase()] ?? m.toLowerCase()
            )
          ),
        ]
        const { data: groups } = await supabase
          .from('muscle_groups')
          .select('id, slug')
          .in('slug', slugs)

        if (groups && groups.length > 0) {
          const muscleRows = groups.map((g) => ({
            session_id: sessionId,
            muscle_group_id: g.id,
            is_completed: true,
            completed_at: new Date().toISOString(),
          }))
          await supabase
            .from('session_muscle_groups')
            .delete()
            .eq('session_id', sessionId)
          const { error: insertErr } = await supabase
            .from('session_muscle_groups')
            .insert(muscleRows)
          if (insertErr) throw insertErr
        }
      }

      const { error } = await supabase
        .from('workout_sessions')
        .update({ finished_at: new Date().toISOString() })
        .eq('id', sessionId)
      if (error) throw error
    },
    onSuccess: (_, { sessionId }) => {
      qc.invalidateQueries({
        queryKey: ['today_session', user?.id, getTodayStr()],
      })
      qc.invalidateQueries({ queryKey: ['week_sessions'] })
      qc.invalidateQueries({ queryKey: ['session_plan_exercises', sessionId] })
    },
  })
}
