import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/auth-store'
import { supabase } from '@/lib/supabase'

export interface SessionWithMuscles {
  id: string
  session_date: string
  started_at: string
  finished_at: string | null
  notes: string | null
  week_number: number
  year: number
  session_muscle_groups: Array<{
    id: string
    is_completed: boolean
    completed_at: string | null
    muscle_groups: {
      name_es: string
    }
  }>
}

export function useSessionsByMonth(year: number, month: number) {
  const { user } = useAuthStore()
  return useQuery({
    queryKey: ['sessions', user?.id, year, month],
    queryFn: async () => {
      const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0]
      const endDate = new Date(year, month, 0).toISOString().split('T')[0]

      const { data, error } = await supabase
        .from('workout_sessions')
        .select(
          `
          id, session_date, started_at, finished_at, notes, week_number, year,
          session_muscle_groups (
            id, is_completed, completed_at,
            muscle_groups (name_es)
          )
        `
        )
        .eq('user_id', user!.id)
        .gte('session_date', startDate)
        .lte('session_date', endDate)
        .order('session_date', { ascending: false })

      if (error) throw error
      return data as SessionWithMuscles[]
    },
    enabled: !!user,
  })
}

export function useSessionStats(year: number, month: number) {
  const { user } = useAuthStore()
  return useQuery({
    queryKey: ['session-stats', user?.id, year, month],
    queryFn: async () => {
      const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0]
      const endDate = new Date(year, month, 0).toISOString().split('T')[0]

      const { data, error } = await supabase
        .from('workout_sessions')
        .select(
          `
          id, finished_at, session_muscle_groups (
            is_completed, muscle_groups (name_es)
          )
        `
        )
        .eq('user_id', user!.id)
        .not('finished_at', 'is', null)
        .gte('session_date', startDate)
        .lte('session_date', endDate)

      if (error) throw error

      const stats = {
        totalSessions: data?.length || 0,
        totalMinutes: 0,
        muscleCounts: {} as Record<string, number>,
      }

      data?.forEach((session) => {
        session.session_muscle_groups?.forEach((smg) => {
          if (smg.is_completed) {
            const name = smg.muscle_groups?.name_es || 'Unknown'
            stats.muscleCounts[name] = (stats.muscleCounts[name] || 0) + 1
          }
        })
      })

      return stats
    },
    enabled: !!user,
  })
}
