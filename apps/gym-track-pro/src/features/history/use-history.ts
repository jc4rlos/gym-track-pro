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
  intensity: string | null
  calories_burned: number | null
  session_muscle_groups: Array<{
    id: string
    is_completed: boolean
    completed_at: string | null
    muscle_groups: {
      name_es: string
    }
  }>
}

export interface MonthStats {
  totalSessions: number
  totalMinutes: number
  muscleCounts: Record<string, number>
}

// Query 1: available months + streak (all sessions, only dates)
export function useHistoryMeta() {
  const { user } = useAuthStore()
  return useQuery({
    queryKey: ['history-meta', user?.id],
    queryFn: async () => {
      const since = new Date()
      since.setDate(since.getDate() - 60)
      const sinceStr = since.toISOString().split('T')[0]

      const { data, error } = await supabase
        .from('workout_sessions')
        .select('session_date, finished_at')
        .eq('user_id', user!.id)
        .order('session_date', { ascending: false })

      if (error) throw error

      // Available months
      const seen = new Set<string>()
      const availableMonths: Array<{ year: number; month: number }> = []
      data?.forEach(({ session_date }) => {
        const d = new Date(session_date)
        const key = `${d.getFullYear()}-${d.getMonth()}`
        if (!seen.has(key)) {
          seen.add(key)
          availableMonths.push({ year: d.getFullYear(), month: d.getMonth() + 1 })
        }
      })
      const now = new Date()
      const currentKey = `${now.getFullYear()}-${now.getMonth()}`
      if (!seen.has(currentKey)) {
        availableMonths.unshift({ year: now.getFullYear(), month: now.getMonth() + 1 })
      }

      // Streak (only finished sessions from last 60 days)
      const finishedDates = new Set(
        data
          ?.filter((s) => s.finished_at && s.session_date >= sinceStr)
          .map((s) => s.session_date) ?? []
      )
      let streak = 0
      const cursor = new Date()
      while (true) {
        const key = cursor.toISOString().split('T')[0]
        if (!finishedDates.has(key)) break
        streak++
        cursor.setDate(cursor.getDate() - 1)
      }

      return { availableMonths: availableMonths.slice(0, 6), streak }
    },
    enabled: !!user,
    staleTime: 60_000,
  })
}

// Query 2: sessions + stats + steps for a given month
export function useHistoryMonth(year: number, month: number) {
  const { user } = useAuthStore()
  return useQuery({
    queryKey: ['history-month', user?.id, year, month],
    queryFn: async () => {
      const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0]
      const endDate = new Date(year, month, 0).toISOString().split('T')[0]

      const [sessionsRes, stepsRes, profileRes] = await Promise.all([
        supabase
          .from('workout_sessions')
          .select(
            `id, session_date, started_at, finished_at, notes, week_number, year,
            intensity, calories_burned,
            session_muscle_groups (
              id, is_completed, completed_at,
              muscle_groups (name_es)
            )`
          )
          .eq('user_id', user!.id)
          .gte('session_date', startDate)
          .lte('session_date', endDate)
          .order('session_date', { ascending: false }),
        supabase
          .from('daily_steps')
          .select('step_date, steps')
          .eq('user_id', user!.id)
          .gte('step_date', startDate)
          .lte('step_date', endDate),
        supabase
          .from('profiles')
          .select('weight_kg')
          .eq('id', user!.id)
          .single(),
      ])

      if (sessionsRes.error) throw sessionsRes.error
      if (stepsRes.error) throw stepsRes.error

      const sessions = sessionsRes.data as SessionWithMuscles[]
      const weightKg = Number(profileRes.data?.weight_kg ?? 70)

      // Steps map: date → steps
      const stepsByDate: Record<string, number> = {}
      stepsRes.data?.forEach((s) => {
        stepsByDate[s.step_date] = s.steps
      })

      // Stats derived from sessions
      const stats: MonthStats = { totalSessions: 0, totalMinutes: 0, muscleCounts: {} }
      sessions.forEach((s) => {
        if (!s.finished_at) return
        stats.totalSessions++
        if (s.started_at) {
          stats.totalMinutes += Math.round(
            (new Date(s.finished_at).getTime() - new Date(s.started_at).getTime()) / 60000
          )
        }
        s.session_muscle_groups?.forEach((smg) => {
          if (smg.is_completed) {
            const name = smg.muscle_groups?.name_es ?? 'Otro'
            stats.muscleCounts[name] = (stats.muscleCounts[name] ?? 0) + 1
          }
        })
      })

      return { sessions, stats, stepsByDate, weightKg }
    },
    enabled: !!user,
  })
}
