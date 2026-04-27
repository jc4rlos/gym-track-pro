import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Exercise } from './exercise-list'

export const useExercisesQuery = () => {
  return useQuery({
    queryKey: ['exercises'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('exercises')
        .select(
          'id, name, name_es, body_part, target_muscle, secondary_muscles, equipment, image_url, gif_url, instructions, difficulty, starting_position, execution'
        )
        .limit(100)

      if (error) throw error
      if (!data || data.length === 0) return []

      return data.map((ex) => ({
        id: ex.id,
        name: ex.name_es || ex.name,
        muscleGroup: ex.target_muscle || ex.body_part || 'General',
        equipment: ex.equipment || 'Peso corporal',
        difficulty:
          (ex.difficulty as 'beginner' | 'intermediate' | 'advanced') ||
          'beginner',
        primaryMuscles: [ex.target_muscle || 'General'],
        secondaryMuscles: (ex.secondary_muscles || []) as string[],
        imageUrl: ex.image_url ?? null,
        gifUrl: ex.gif_url ?? null,
        startingPosition: ex.starting_position ?? null,
        execution: ex.execution ?? null,
        emoji: '💪',
      })) as Exercise[]
    },
  })
}

export const useExerciseDetail = (exerciseId: string) => {
  return useQuery({
    queryKey: ['exercise', exerciseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .eq('id', exerciseId)
        .single()

      if (error) throw error
      return data
    },
    enabled: !!exerciseId,
  })
}
