import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/auth-store'
import { supabase } from '@/lib/supabase'

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

export function useBodyMeasurements() {
  const { user } = useAuthStore()
  return useQuery({
    queryKey: ['body_measurements', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('body_measurements')
        .select('id, weight_kg, height_cm, bmi, measured_at, created_at')
        .eq('user_id', user!.id)
        .order('measured_at', { ascending: false })
        .limit(20)
      if (error) throw error
      return data
    },
    enabled: !!user,
  })
}

export function useSessionStats() {
  const { user } = useAuthStore()
  return useQuery({
    queryKey: ['session_stats', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workout_sessions')
        .select('id, session_date')
        .eq('user_id', user!.id)
        .not('finished_at', 'is', null)
      if (error) throw error
      const totalSessions = data.length
      const weeks = new Set(
        data.map((s) => {
          const d = new Date(s.session_date)
          const jan1 = new Date(d.getFullYear(), 0, 1)
          return `${d.getFullYear()}-${Math.ceil(((d.getTime() - jan1.getTime()) / 86400000 + jan1.getDay() + 1) / 7)}`
        })
      ).size
      return { totalSessions, weeks }
    },
    enabled: !!user,
  })
}

export function useUpdateProfile() {
  const { user } = useAuthStore()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (fields: {
      full_name?: string
      gender?: 'male' | 'female' | 'other'
      height_cm?: number | null
      goal?: 'lose_weight' | 'gain_muscle' | 'maintain'
      daily_steps_goal?: number
    }) => {
      const { error } = await supabase
        .from('profiles')
        .update(fields)
        .eq('id', user!.id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['profile'] }),
  })
}

export function useSaveMeasurement() {
  const { user } = useAuthStore()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      weightKg,
      heightCm,
      bmi,
    }: {
      weightKg: number
      heightCm: number
      bmi: number
    }) => {
      const today = new Date().toISOString().slice(0, 10)
      // Upsert: update if measurement already exists for today
      const { error: measureError } = await supabase
        .from('body_measurements')
        .upsert(
          {
            user_id: user!.id,
            weight_kg: weightKg,
            height_cm: heightCm,
            bmi: Math.round(bmi * 10) / 10,
            measured_at: today,
          },
          { onConflict: 'user_id,measured_at' }
        )
      if (measureError) throw measureError

      // Update profile weight
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ weight_kg: weightKg })
        .eq('id', user!.id)
      if (profileError) throw profileError
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['body_measurements'] })
      qc.invalidateQueries({ queryKey: ['profile'] })
    },
  })
}

export function useUpdateMuscleColors() {
  const { user } = useAuthStore()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (colors: {
      muscle_primary_color: string
      muscle_secondary_color: string
    }) => {
      const { error } = await supabase
        .from('profiles')
        .update(colors)
        .eq('id', user!.id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['profile'] }),
  })
}
