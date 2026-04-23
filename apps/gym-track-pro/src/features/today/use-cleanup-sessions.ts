import { useMutation } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export const useFinishOldSessions = () => {
  return useMutation({
    mutationFn: async () => {
      const today = new Date().toISOString().split('T')[0]

      const { error } = await supabase
        .from('workout_sessions')
        .update({ finished_at: new Date().toISOString() })
        .is('finished_at', null)
        .lt('session_date', today)

      if (error) throw error
    },
  })
}
