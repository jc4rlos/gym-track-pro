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
          `id, session_date, started_at, finished_at, notes, week_number, year,
          session_muscle_groups (
            id, is_completed, completed_at,
            muscle_groups (name_es)
          )`
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

export interface MonthStats {
  totalSessions: number
  totalMinutes: number
  muscleCounts: Record<string, number>
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
          `id, started_at, finished_at,
          session_muscle_groups (
            is_completed, muscle_groups (name_es)
          )`
        )
        .eq('user_id', user!.id)
        .not('finished_at', 'is', null)
        .gte('session_date', startDate)
        .lte('session_date', endDate)

      if (error) throw error

      const stats: MonthStats = {
        totalSessions: data?.length ?? 0,
        totalMinutes: 0,
        muscleCounts: {},
      }

      data?.forEach((session) => {
        if (session.started_at && session.finished_at) {
          const mins = Math.round(
            (new Date(session.finished_at).getTime() -
              new Date(session.started_at).getTime()) /
              60000
          )
          stats.totalMinutes += mins
        }
        session.session_muscle_groups?.forEach((smg) => {
          if (smg.is_completed) {
            const name = smg.muscle_groups?.name_es ?? 'Otro'
            stats.muscleCounts[name] = (stats.muscleCounts[name] ?? 0) + 1
          }
        })
      })

      return stats
    },
    enabled: !!user,
  })
}

export function useCurrentStreak() {
  const { user } = useAuthStore()
  return useQuery({
    queryKey: ['streak', user?.id],
    queryFn: async () => {
      const since = new Date()
      since.setDate(since.getDate() - 60)
      const sinceStr = since.toISOString().split('T')[0]

      const { data, error } = await supabase
        .from('workout_sessions')
        .select('session_date')
        .eq('user_id', user!.id)
        .not('finished_at', 'is', null)
        .gte('session_date', sinceStr)
        .order('session_date', { ascending: false })

      if (error) throw error

      const dates = new Set(data?.map((s) => s.session_date) ?? [])
      let streak = 0
      const cursor = new Date()

      while (true) {
        const key = cursor.toISOString().split('T')[0]
        if (!dates.has(key)) break
        streak++
        cursor.setDate(cursor.getDate() - 1)
      }

      return streak
    },
    enabled: !!user,
  })
}

export function useAvailableMonths() {
  const { user } = useAuthStore()
  return useQuery({
    queryKey: ['session-months', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workout_sessions')
        .select('session_date')
        .eq('user_id', user!.id)
        .order('session_date', { ascending: false })

      if (error) throw error

      const seen = new Set<string>()
      const months: Array<{ year: number; month: number }> = []

      data?.forEach(({ session_date }) => {
        const d = new Date(session_date)
        const key = `${d.getFullYear()}-${d.getMonth()}`
        if (!seen.has(key)) {
          seen.add(key)
          months.push({ year: d.getFullYear(), month: d.getMonth() + 1 })
        }
      })

      const now = new Date()
      const currentKey = `${now.getFullYear()}-${now.getMonth()}`
      if (!seen.has(currentKey)) {
        months.unshift({ year: now.getFullYear(), month: now.getMonth() + 1 })
      }

      return months.slice(0, 6)
    },
    enabled: !!user,
    staleTime: 60_000,
  })
}
