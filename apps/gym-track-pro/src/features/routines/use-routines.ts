import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/auth-store'
import { supabase } from '@/lib/supabase'

export interface RoutineExercise {
  id: string
  routine_id: string
  exercise_id: string
  sets: number
  reps: string
  rest_seconds: number
  order_index: number
  notes?: string
  exercises?: {
    id: string
    name: string
    name_es: string
    target_muscle: string
    equipment: string
    difficulty: 'beginner' | 'intermediate' | 'advanced'
  }
}

export interface Routine {
  id: string
  user_id: string
  name: string
  description?: string
  is_active: boolean
  created_at: string
  updated_at: string
  routine_exercises?: RoutineExercise[]
}

export function useRoutines() {
  const { user } = useAuthStore()
  return useQuery({
    queryKey: ['routines', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('routines')
        .select('*, routine_exercises(*)')
        .eq('user_id', user!.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as Routine[]
    },
    enabled: !!user,
  })
}

export function useRoutineDetail(routineId?: string) {
  return useQuery({
    queryKey: ['routine', routineId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('routines')
        .select(
          `
          *,
          routine_exercises (
            *,
            exercises (id, name, name_es, target_muscle, equipment, difficulty)
          )
        `
        )
        .eq('id', routineId!)
        .single()
      if (error) throw error
      return data as Routine
    },
    enabled: !!routineId,
  })
}

export function useCreateRoutine() {
  const { user } = useAuthStore()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (routine: { name: string; description?: string }) => {
      const id = crypto.randomUUID()
      const { error } = await supabase.from('routines').insert({
        id,
        user_id: user!.id,
        name: routine.name,
        description: routine.description,
        is_active: true,
      })
      if (error) throw error
      return { id }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['routines'] }),
  })
}

export function useDeleteRoutine() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('routines').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['routines'] }),
  })
}

export function useUpdateRoutine() {
  const { user } = useAuthStore()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      name,
      description,
    }: {
      id: string
      name: string
      description?: string
    }) => {
      const { error } = await supabase
        .from('routines')
        .update({ name, description })
        .eq('id', id)
        .eq('user_id', user!.id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['routines'] })
    },
  })
}

export function useAddExerciseToRoutine() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      routineId,
      exerciseId,
      sets,
      reps,
      restSeconds,
    }: {
      routineId: string
      exerciseId: string
      sets: number
      reps: string
      restSeconds: number
    }) => {
      const { data } = await supabase
        .from('routine_exercises')
        .select('order_index')
        .eq('routine_id', routineId)
        .order('order_index', { ascending: false })
        .limit(1)
      const nextOrder = (data?.[0]?.order_index ?? -1) + 1

      const { error } = await supabase.from('routine_exercises').insert({
        routine_id: routineId,
        exercise_id: exerciseId,
        sets,
        reps,
        rest_seconds: restSeconds,
        order_index: nextOrder,
      })
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['routine'] })
    },
  })
}

export function useUpdateRoutineExercise() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      sets,
      reps,
      restSeconds,
      notes,
    }: {
      id: string
      sets: number
      reps: string
      restSeconds: number
      notes?: string
    }) => {
      const { error } = await supabase
        .from('routine_exercises')
        .update({ sets, reps, rest_seconds: restSeconds, notes })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['routine'] })
    },
  })
}

export function useRemoveRoutineExercise() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (exerciseId: string) => {
      const { error } = await supabase
        .from('routine_exercises')
        .delete()
        .eq('id', exerciseId)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['routine'] })
    },
  })
}
