import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/auth-store'
import { supabase } from '@/lib/supabase'

function toDateStr(d: Date) {
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

export function useTodaySteps() {
  const { user } = useAuthStore()
  const today = toDateStr(new Date())
  return useQuery({
    queryKey: ['steps', 'today', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('daily_steps')
        .select('id, steps, step_date')
        .eq('user_id', user!.id)
        .eq('step_date', today)
        .maybeSingle()
      if (error) throw error
      return data
    },
    enabled: !!user,
  })
}

export function useStepsHistory() {
  const { user } = useAuthStore()
  return useQuery({
    queryKey: ['steps', 'history', user?.id],
    queryFn: async () => {
      const from = new Date()
      from.setDate(from.getDate() - 29)
      const { data, error } = await supabase
        .from('daily_steps')
        .select('id, steps, step_date')
        .eq('user_id', user!.id)
        .gte('step_date', toDateStr(from))
        .order('step_date', { ascending: false })
      if (error) throw error
      return data ?? []
    },
    enabled: !!user,
  })
}

export function useUpsertSteps() {
  const { user } = useAuthStore()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ stepDate, steps }: { stepDate: string; steps: number }) => {
      const { error } = await supabase.from('daily_steps').upsert(
        { user_id: user!.id, step_date: stepDate, steps },
        { onConflict: 'user_id,step_date' }
      )
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['steps'] })
    },
  })
}

export function useStepsGoal() {
  const { user } = useAuthStore()
  return useQuery({
    queryKey: ['steps_goal', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('daily_steps_goal')
        .eq('id', user!.id)
        .single()
      if (error) throw error
      return data.daily_steps_goal ?? 10000
    },
    enabled: !!user,
  })
}

export function useUpdateStepsGoal() {
  const { user } = useAuthStore()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (goal: number) => {
      const { error } = await supabase
        .from('profiles')
        .update({ daily_steps_goal: goal })
        .eq('id', user!.id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['steps_goal'] }),
  })
}
