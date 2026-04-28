import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/auth-store'
import { supabase } from '@/lib/supabase'
import { calcStepsCalories } from '@/features/calories/calorie-utils'

function getTodayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function useTodayCalories() {
  const { user } = useAuthStore()
  const today = getTodayStr()
  return useQuery({
    queryKey: ['today_calories', user?.id],
    queryFn: async () => {
      const [sessionRes, stepsRes, profileRes] = await Promise.all([
        supabase
          .from('workout_sessions')
          .select('calories_burned, intensity')
          .eq('user_id', user!.id)
          .eq('session_date', today)
          .maybeSingle(),
        supabase
          .from('daily_steps')
          .select('steps')
          .eq('user_id', user!.id)
          .eq('step_date', today)
          .maybeSingle(),
        supabase
          .from('profiles')
          .select('weight_kg')
          .eq('id', user!.id)
          .single(),
      ])

      const workoutCal = sessionRes.data?.calories_burned ?? 0
      const steps = stepsRes.data?.steps ?? 0
      const weight = Number(profileRes.data?.weight_kg ?? 70)
      const stepsCal = steps > 0 ? calcStepsCalories(steps, weight) : 0

      return { workoutCal, stepsCal, total: workoutCal + stepsCal }
    },
    enabled: !!user,
  })
}

export function CaloriesWidget() {
  const { data, isLoading } = useTodayCalories()

  if (isLoading || !data || data.total === 0) return null

  return (
    <div
      className='rounded-[14px] border p-3.5'
      style={{
        background: 'linear-gradient(135deg,#1a0a00,#0f0800)',
        borderColor: '#3a1a00',
      }}
    >
      <div className='mb-2 flex items-center justify-between'>
        <p className='text-[11px] font-semibold tracking-wide text-orange-400/70 uppercase'>
          Calorías hoy
        </p>
        <p className='text-[22px] font-bold text-orange-400'>
          🔥 {data.total.toLocaleString()} kcal
        </p>
      </div>
      <div className='flex gap-4'>
        {data.workoutCal > 0 && (
          <div className='flex items-center gap-1.5'>
            <span className='text-[13px]'>🏋️</span>
            <span className='text-[13px] font-semibold text-orange-300'>
              {data.workoutCal}
            </span>
            <span className='text-[11px] text-orange-400/60'>entrenamiento</span>
          </div>
        )}
        {data.stepsCal > 0 && (
          <div className='flex items-center gap-1.5'>
            <span className='text-[13px]'>👟</span>
            <span className='text-[13px] font-semibold text-orange-300'>
              {data.stepsCal}
            </span>
            <span className='text-[11px] text-orange-400/60'>pasos</span>
          </div>
        )}
      </div>
    </div>
  )
}
